import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  // Ambil token dari URL (QR)
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [session, setSession] = useState(null);
  const [studentMatric, setStudentMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ===============================
  // 1️⃣ DAPATKAN SESSION BERDASARKAN TOKEN
  // ===============================
  useEffect(() => {
    if (!token) {
      setErrorMsg("QR tidak sah atau token tiada.");
      return;
    }

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        setErrorMsg("Session tidak dijumpai atau telah tamat.");
        return;
      }

      setSession(data);
    };

    fetchSession();
  }, [token]);

  // ===============================
  // 2️⃣ SUBMIT KEHADIRAN PELAJAR
  // ===============================
  const submitAttendance = async () => {
    if (!studentMatric.trim()) {
      alert("Sila masukkan No Matriks");
      return;
    }

    if (!session?.id) {
      alert("Session tidak sah");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance_records")
        .insert([
          {
            session_id: session.id,
            student_matric: studentMatric.trim(),
          },
        ])
        .select();

      console.log("INSERT DATA:", data);
      console.log("INSERT ERROR:", error);

      if (error) {
        alert("INSERT GAGAL: " + error.message);
        return;
      }

      alert("Kehadiran berjaya direkod");
      setStudentMatric(""); // reset input
    } catch (err) {
      alert("Ralat tidak dijangka");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 3️⃣ UI STATES
  // ===============================
  if (errorMsg) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Ralat</h3>
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: 30 }}>
        <p>Memuatkan session...</p>
      </div>
    );
  }

  // ===============================
  // 4️⃣ UI UTAMA
  // ===============================
  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>{session.course_code}</h2>
      <p>Sila masukkan No Matriks untuk rekod kehadiran.</p>

      <input
        type="text"
        placeholder="No Matriks"
        value={studentMatric}
        onChange={(e) => setStudentMatric(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <button
        onClick={submitAttendance}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          background: "#1976d2",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Merekod..." : "Hadir"}
      </button>
    </div>
  );
}

export default AttendancePage;
