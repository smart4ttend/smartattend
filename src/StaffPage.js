import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";

function StaffPage({ staffName, logout }) {

  // ✅ 1) SEMUA HOOKS DI ATAS
  const [course, setCourse] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 2) SAFETY CHECK – HANYA STAFF
  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);

  if (!staffName || staffName.trim() === "" || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Akses Ditolak</h3>
        <p>Halaman ini hanya untuk staff sahaja.</p>
      </div>
    );
  }

  // ✅ 3) CREATE SESSION
  const createSession = async () => {
    if (!course.trim()) {
      alert("Sila masukkan Course Code.");
      return;
    }

    try {
      setLoading(true);

      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([{ course_code: course.trim(), token }])
        .select()
        .limit(1);

      if (error) throw error;

      setSessionId(data[0].id);
      setQrToken(token);
      setLoading(false);
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  };

  // ✅ 4) UI
  return (
    <div style={{ padding: 30 }}>
      <h2>Welcome, {staffName}</h2>
      <button
  onClick={logout}
  style={{
    marginTop: 10,
    padding: "6px 14px",
    background: "#e53935",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer"
  }}
>
  Logout
</button>

      <input
        placeholder="Course Code (DIT101)"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />

      <button onClick={createSession}>
        {loading ? "Creating..." : "Create Session"}
      </button>
{qrToken && (
  <div style={{ marginTop: 20 }}>
    <h3>QR Code untuk Attendance</h3>

    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `${window.location.origin}/attendance?token=${qrToken}`
      )}`}
      alt="QR Code"
    />

    <p><b>Session ID:</b> {sessionId}</p>
    <p><b>QR Token:</b> {qrToken}</p>

    <p>
      <b>Link:</b><br />
      <a
        href={`${window.location.origin}/attendance?token=${qrToken}`}
        target="_blank"
        rel="noreferrer"
      >
        {window.location.origin}/attendance?token={qrToken}
      </a>
    </p>

    <p>📌 <i>Pelajar perlu scan QR ini untuk rekod kehadiran.</i></p>
  </div>
)}

      {sessionId && <AttendanceList sessionId={sessionId} />}
    </div>
  );
}

export default StaffPage;





