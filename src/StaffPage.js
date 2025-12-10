import React, { useState } from "react";
import { supabase } from "./supabase";

function StaffPage({ staffName }) {
  const [course, setCourse] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [sessionId, setSessionId] = useState("");

  const createSession = async () => {
    if (!course.trim()) {
      alert("Sila masukkan Course Code.");
      return;
    }

    // Token QR unik
    const token = crypto.randomUUID();

    // Insert ke table attendance_sessions
    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert([
        {
          course_code: course,
          token: token,
          created_at: new Date(),
        },
      ])
      .select()
      .limit(1);

    if (error) {
      alert("Error creating session: " + error.message);
      return;
    }

    setSessionId(data[0].id);
    setQrToken(token);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h2>Welcome, {staffName}</h2>

      <h3>Create Attendance Session</h3>

      <input
        style={{ padding: 8, width: 260 }}
        placeholder="Course Code (e.g. DIT101)"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />

      <br />
      <br />

      <button onClick={createSession} style={{ padding: "8px 16px" }}>
        Create Session
      </button>

      {/* Papar QR selepas berjaya create session */}
      {qrToken && (
        <div style={{ marginTop: 30 }}>
          <h3>QR Code untuk Attendance</h3>

          {qrToken && (() => {
  const fullUrl = `${window.location.origin}/attendance?token=${qrToken}`;
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullUrl)}`;
  return (
    <div style={{
  marginTop: 30,
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  maxWidth: "350px",
  background: "#fafafa"
}}>
  <h2 style={{ marginBottom: "15px", color: "#333" }}>QR Code untuk Attendance</h2>

  <div style={{ textAlign: "center" }}>
    <img
      src={qrApi}
      alt="QR Code"
      style={{
        width: "220px",
        height: "220px",
        border: "8px solid white",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
        marginBottom: "20px",
        borderRadius: "10px"
      }}
    />
  </div>

  <p><b>Session ID:</b> {sessionId}</p>
  <p><b>QR Token:</b> {qrToken}</p>

  <p style={{ marginTop: "10px" }}>
    <b>Link:</b><br />
    <a href={fullUrl} target="_blank" rel="noreferrer" style={{ color: "#0070f3" }}>
      {fullUrl}
    </a>
  </p>

  <p style={{ marginTop: "15px", color: "#555" }}>
    📌 <i>Pelajar perlu scan QR ini untuk rekod kehadiran.</i>
  </p>
</div>

  );
})()}



          <p><b>Session ID:</b> {sessionId}</p>
          <p><b>QR Token:</b> {qrToken}</p>

          <p>Pelajar perlu scan QR ini untuk rekod kehadiran.</p>
        </div>
      )}
    </div>
  );
}

export default StaffPage;


