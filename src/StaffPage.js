import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";

function StaffPage({ staffName, logout }) {
  const [course, setCourse] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);

  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);
  if (!staffName || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Akses Ditolak</h3>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  const createSession = async () => {
    if (!course.trim()) return alert("Sila masukkan Course Code");

    try {
      setLoading(true);

      const token = crypto.randomUUID();
      const expiresAtValue = new Date(Date.now() + 10 * 60 * 1000);

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: course.trim(),
            token,
            expires_at: expiresAtValue,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setQrToken(token);
      setExpiresAt(expiresAtValue);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    setSessionId(null);
    setQrToken("");
    setExpiresAt(null);
  };

  const APP_URL = "https://smartattend-psi.vercel.app";
  const qrUrl = qrToken ? `${APP_URL}/attendance?token=${qrToken}` : "";
  const qrImage = qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`
    : "";

  return (
    <div style={{ padding: 30, maxWidth: 900 }}>
      <h2>Welcome, {staffName}</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={logout}>Logout</button>

        <input
          placeholder="Course Code"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <button onClick={createSession} disabled={loading || sessionId}>
          {loading ? "Creating..." : "Create Session"}
        </button>
      </div>

      {qrToken && (
        <div style={{ marginTop: 25, border: "1px solid #ccc", padding: 20 }}>
          <img src={qrImage} alt="QR" />
          <p><b>Session ID:</b> {sessionId}</p>
          <p><b>QR Tamat:</b> {new Date(expiresAt).toLocaleTimeString()}</p>

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
