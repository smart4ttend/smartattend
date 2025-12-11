import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";

function StaffPage({ staffName }) {
  const [course, setCourse] = useState("");
  const [qrToken, setQrToken] = useState(""); // token string
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    if (!course.trim()) {
      alert("Sila masukkan Course Code.");
      return;
    }

    try {
      setLoading(true);

      // create a unique token for this attendance session
      const token = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: course.trim(),
            token: token,
            created_at: new Date(),
          },
        ])
        .select()
        .limit(1);

      if (error) {
        alert("Error creating session: " + error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        alert("No session returned from server.");
        setLoading(false);
        return;
      }

      setSessionId(data[0].id);
      setQrToken(token);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert("Unexpected error: " + e.message);
    }
  };

  // build full URL & QR API url when qrToken present
  const fullUrl = qrToken ? `${window.location.origin}/attendance?token=${qrToken}` : "";
  const qrApi = qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullUrl)}`
    : "";

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif", maxWidth: 900 }}>
      <h2 style={{ marginBottom: 8 }}>Welcome, {staffName}</h2>

      <h3 style={{ marginTop: 20 }}>Create Attendance Session</h3>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <input
          style={{ padding: 8, width: 300, borderRadius: 6, border: "1px solid #ccc" }}
          placeholder="Course Code (e.g. DIT101)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <button
          onClick={createSession}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: "#0070f3",
            color: "white",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Session"}
        </button>
      </div>

      {/* If qrToken exists, show a single nicely styled card */}
      {qrToken && (
        <div
          style={{
            marginTop: 20,
            padding: "20px",
            border: "1px solid #e6e6e6",
            borderRadius: 10,
            maxWidth: 420,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 12, color: "#222" }}>
            QR Code untuk Attendance
          </h3>

          <div style={{ textAlign: "center" }}>
            <img
              src={qrApi}
              alt="QR Code"
              style={{
                width: 220,
                height: 220,
                borderRadius: 8,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                background: "white",
              }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <p style={{ margin: "6px 0" }}>
              <strong>Session ID:</strong> {sessionId}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>QR Token:</strong> {qrToken}
            </p>

            <p style={{ marginTop: 10 }}>
              <strong>Link:</strong>
              <br />
              <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: "#0070f3" }}>
                {fullUrl}
              </a>
            </p>

            <p style={{ marginTop: 12, color: "#555" }}>
              📌 <i>Pelajar perlu scan QR ini untuk rekod kehadiran.</i>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffPage;




