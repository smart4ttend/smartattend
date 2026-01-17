import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  const [studentMatric, setStudentMatric] = useState("");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ===============================
  // 1️⃣ AMBIL DATA SESSION (MASA)
  // ===============================
  useEffect(() => {
    if (!sessionId) {
      setErrorMsg("Session tidak sah. Sila scan QR yang betul.");
      return;
    }

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("class_start_at, late_after, expires_at")
        .eq("id", sessionId)
        .single();

      if (error || !data) {
        setErrorMsg("Session tidak dijumpai.");
        return;
      }

      setSession(data);
    };

    fetchSession();
  }, [sessionId]);

  // ===============================
  // 2️⃣ SUBMIT KEHADIRAN
  // ===============================
  const submitAttendance = async () => {
    if (!studentMatric.trim()) {
      alert("Sila masukkan No Matriks");
      return;
    }

    if (!session) {
      alert("Session tidak sah");
      return;
    }

    // Tentukan status berdasarkan masa
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const lateAfter = session.late_after
      ? new Date(session.late_after)
      : null;

    if (now > expiresAt) {
      alert("❌ Sesi ini telah tamat. Kehadiran ditolak.");
      return;
    }

    let status = "HADIR";
    if (lateAfter && now > lateAfter) {
      status = "LAMBAT";
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("attendance_records")
        .insert([
          {
            session_id: sessionId,
            student_matric: studentMatric.trim(),
            status, // 🔥 HADIR / LAMBAT
          },
        ]);

      if (error) {
        // Duplicate (unique constraint)
        if (error.code === "23505") {
          alert("❌ Anda telah merekod kehadiran untuk sesi ini.");
        } else {
          alert("❌ Rekod gagal: " + error.message);
        }
        return;
      }

      alert(
        status === "LAMBAT"
          ? "⚠️ Kehadiran direkod sebagai LAMBAT."
          : "✅ Kehadiran berjaya direkod."
      );

      setStudentMatric("");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI STATES
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
        <p>Memuatkan sesi...</p>
      </div>
    );
  }

  // ===============================
  // UI UTAMA
  // ===============================
  return (
    <div style={{ padding: 30, maxWidth: 420 }}>
      <h3>Rekod Kehadiran</h3>

      <p>
        Sila masukkan <b>No Matriks</b>.
      </p>

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
