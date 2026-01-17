import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";

function StaffPage({ staffName, logout }) {
  const [course, setCourse] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // SAFETY CHECK – STAFF SAHAJA
  // ===============================
  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);
  if (!staffName || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Akses Ditolak</h3>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // ===============================
  // CREATE SESSION
  // ===============================
  const createSession = async () => {
    if (!course.trim()) {
      alert("Sila masukkan Course Code");
      return;
    }

    try {
      setLoading(true);

      const expiresAtValue = new Date(Date.now() + 10 * 60 * 1000);

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: course.trim(),
            expires_at: expiresAtValue,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setExpiresAt(expiresAtValue);
    } catch (e) {
      alert("Gagal cipta session: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TAMATKAN SESSION (UI SAHAJA)
  // ===============================
  const endSession = () => {
    setSessionId(null);
    setExpiresAt(null);
  };

  // ===============================
  // QR URL (GUNA session_id TERUS)
  // ===============================
  const APP_URL = "https://smartattend-psi.vercel.app";
  const qrUrl = sessionId
    ? `${APP_URL}/attendance?session_id=${sessionId}`
    : "";

  const qrImage = sessionId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        qrUrl
      )}`
    : "";

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 30, maxWidth: 900 }}>
      <h2>Welcome, {staffName}</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={logout}>Logout</button>

        <input
          placeholder="Course Code (DIT101)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <button onClick={createSession} disabled={loading || sessionId}>
          {loading ? "Creating..." : "Create Session"}
        </button>
      </div>

      {sessionId && (
        <div style={{ marginTop: 25, border: "1px solid #ccc", padding: 20 }}>
          <img src={qrImage} alt="QR Code" />

          <p>
            <b>Session ID:</b> {sessionId}
          </p>

          <p>
            <b>QR Tamat:</b>{" "}
            {expiresAt ? new Date(expiresAt).toLocaleTimeString() : "-"}
          </p>

          <p style={{ fontSize: 12, color: "#555" }}>
            📌 Pastikan pelajar scan QR ini (session aktif).
          </p>

          <button onClick={endSession} style={{ marginTop: 10 }}>
            Tamatkan Session
          </button>
        </div>
      )}

      {sessionId && (
        <div style={{ marginTop: 30 }}>
          <AttendanceList sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}

export default StaffPage;
