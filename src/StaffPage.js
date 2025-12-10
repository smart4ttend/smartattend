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
    <div style={{ marginTop: 30 }}>
      <h3>QR Code untuk Attendance</h3>

      <img src={qrApi} alt="QR Code" style={{ maxWidth: 220 }} />

      <p><b>Session ID:</b> {sessionId}</p>
      <p><b>QR Token:</b> {qrToken}</p>
      <p><small>Link: <a href={fullUrl} target="_blank" rel="noreferrer">{fullUrl}</a></small></p>
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

