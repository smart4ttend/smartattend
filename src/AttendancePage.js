import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  const [status, setStatus] = useState("Loading...");
  const [session, setSession] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // get token from URL
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setStatus("❌ Token tidak ditemui dalam URL");
      return;
    }

    const fetchSession = async () => {
      setStatus("Memuatkan session...");
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("token", token)
        .limit(1);

      if (error) {
        setStatus("❌ Error: " + error.message);
        return;
      }
      if (!data || data.length === 0) {
        setStatus("❌ Invalid or expired QR code");
        return;
      }

      setSession(data[0]);
      setStatus("");
    };

    fetchSession();
  }, [token]);

  const submitAttendance = async () => {
    if (!studentId.trim()) {
      alert("Sila masukkan ID pelajar (contoh: A001)");
      return;
    }
    if (!session) {
      alert("Session tidak ditemui.");
      return;
    }

    const idTrim = studentId.trim().toUpperCase();
    setBusy(true);
    setStatus("Memeriksa rekod kehadiran...");

    try {
      // 1) check existing attendance
      const { data: exists, error: checkErr } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("student_matric", idTrim)
        .eq("session_id", session.id)
        .limit(1);

      if (checkErr) {
        setStatus("❌ Error checking existing attendance: " + checkErr.message);
        setBusy(false);
        return;
      }

      if (exists && exists.length > 0) {
        setStatus("ℹ️ Anda sudah merekod kehadiran untuk session ini.");
        setSubmitted(true);
        setBusy(false);
        return;
      }

      // 2) insert attendance
      const { error } = await supabase
        .from("attendance_records")
        .insert([
          {
            student_matric: idTrim,
            session_id: session.id,
          },
        ]);

      if (error) {
        // possible unique-constraint violation from DB (race)
        const errmsg = error.message || "";
        if (errmsg.toLowerCase().includes("unique") || errmsg.toLowerCase().includes("duplicate")) {
          setStatus("ℹ️ Anda sudah merekod kehadiran untuk session ini.");
          setSubmitted(true);
        } else {
          setStatus("❌ Error menyimpan kehadiran: " + errmsg);
        }
        setBusy(false);
        return;
      }

      // success
      setSubmitted(true);
      setStatus("✔️ Attendance Recorded Successfully");
      setBusy(false);
    } catch (e) {
      setStatus("❌ Unexpected error: " + e.message);
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: 30 }}>
        <h2>✔️ Attendance Recorded</h2>
        <p>{status}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Attendance Check-In</h2>

      {status && <p>{status}</p>}

      {session && (
        <>
          <p>
            <b>Course:</b> {session.course_code || "(not set)"}
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

          <button onClick={submitAttendance} style={{ padding: "8px 16px" }} disabled={busy}>
            {busy ? "Processing..." : "Submit Attendance"}
          </button>
        </>
      )}
    </div>
  );
}

export default AttendancePage;
