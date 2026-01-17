import React, { useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  // Ambil session_id terus dari URL (QR)
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  const [studentMatric, setStudentMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ===============================
  // SUBMIT KEHADIRAN
  // ===============================
  const submitAttendance = async () => {
    if (!sessionId) {
      setErrorMsg("Session tidak sah. Sila scan QR yang betul.");
      return;
    }

    if (!studentMatric.trim()) {
      alert("Sila masukkan No Matriks");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance_records")
        .insert([
          {
            session_id: sessionId,              // 🔥 SINGLE SOURCE OF TRUTH
            student_matric: studentMatric.trim(),
          },
        ])
        .select();
      console.log("SESSION_ID DARIPADA QR:", sessionId);
      console.log("INSERT DATA:", data);
      console.log("INSERT ERROR:", error);
      console.log("INSERT KE SESSION:", sessionId);

      if (error) {
        alert("Rekod gagal: " + error.message);
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

  // ===============================
  // UI UTAMA
  // ===============================
  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h3>Rekod Kehadiran</h3>

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
