import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  const [status, setStatus] = useState("Loading...");
  const [session, setSession] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // 🔑 Ambil token dari URL
  const token = new URLSearchParams(window.location.search).get("token");

  // ===============================
  // 1️⃣ FETCH SESSION BERDASARKAN TOKEN (FIX UTAMA)
  // ===============================
  useEffect(() => {
    if (!token) {
      setStatus("❌ Token tidak ditemui dalam URL");
      return;
    }

    const fetchSession = async () => {
      setStatus("Memuatkan session...");

      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("id, course_code")
        .eq("token", token)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(); // ⬅️ PENTING

      if (error || !data) {
        setStatus("❌ QR tidak sah atau telah tamat");
        return;
      }

      console.log("✅ SESSION DITEMUI:", data);
      setSession(data);
      setStatus("");
    };

    fetchSession();
  }, [token]);

  // ===============================
  // 2️⃣ SUBMIT KEHADIRAN
  // ===============================
  const submitAttendance = async () => {
    if (!studentId.trim()) {
      alert("Sila masukkan ID pelajar (contoh: A001)");
      return;
    }

    if (!session) {
      alert("Session tidak ditemui.");
      return;
    }

    const matric = studentId.trim().toUpperCase();
    setBusy(true);
    setStatus("Menyimpan kehadiran...");

    try {
      // 🔍 Semak jika sudah rekod
      const { data: exists, error: checkErr } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("student_matric", matric)
        .eq("session_id", session.id)
        .limit(1);

      if (checkErr) {
        setStatus("❌ Ralat semakan: " + checkErr.message);
        setBusy(false);
        return;
      }

      if (exists && exists.length > 0) {
        setStatus("ℹ️ Anda sudah merekod kehadiran.");
        setSubmitted(true);
        setBusy(false);
        return;
      }

      // ➕ Simpan kehadiran
      const { error } = await supabase
        .from("attendance_records")
        .insert([
          {
            student_matric: matric,
            session_id: session.id,
          },
        ]);

      if (error) {
        setStatus("❌ Gagal simpan kehadiran: " + error.message);
        setBusy(false);
        return;
      }

      setSubmitted(true);
      setStatus("✔️ Kehadiran berjaya direkod");
      setBusy(false);
    } catch (e) {
      setStatus("❌ Ralat tidak dijangka: " + e.message);
      setBusy(false);
    }
  };

  // ===============================
  // 3️⃣ PAPAR STATUS SELEPAS SUBMIT
  // ===============================
  if (submitted) {
    return (
      <div style={{ padding: 30 }}>
        <h2>✔️ Attendance Recorded</h2>
        <p>{status}</p>
      </div>
    );
  }

  // ===============================
  // 4️⃣ UI
  // ===============================
  return (
    <div style={{ padding: 30 }}>
      <h2>Attendance Check-In</h2>

      {status && <p>{status}</p>}

      {session && (
        <>
          <p>
            <b>Course:</b> {session.course_code}
          </p>

          <input
            style={{ padding: 8, width: 260 }}
            placeholder="Enter Matric No (A001)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={busy}
          />

          <br />
          <br />

          <button
            onClick={submitAttendance}
            style={{ padding: "8px 16px" }}
            disabled={busy}
          >
            {busy ? "Processing..." : "Submit Attendance"}
          </button>
        </>
      )}
    </div>
  );
}

export default AttendancePage;
