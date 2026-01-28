import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";
import SetupSemester from "./SetupSemester";


function StaffPage({ staffName, logout }) {
  const [course, setCourse] = useState("");

  const [classStart, setClassStart] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [classEnd, setClassEnd] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    if (!course || !classStart || !lateAfter || !classEnd) {
      alert("Sila lengkapkan semua maklumat masa kelas.");
      return;
    }

    const classStartAt = new Date(classStart);
    const lateAfterAt = new Date(lateAfter);
    const expiresAtValue = new Date(classEnd);

    if (!(classStartAt < lateAfterAt && lateAfterAt < expiresAtValue)) {
      alert("Susunan masa tidak sah.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: course.trim(),
            class_start_at: classStartAt,
            late_after: lateAfterAt,
            expires_at: expiresAtValue,
          },
        ])
        .select()
        .single();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSessionId(data.id);
      setExpiresAt(expiresAtValue);
    } catch (err) {
      setErrorMsg("Gagal cipta session.");
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    setSessionId(null);
    setExpiresAt(null);
  };

  // ===============================
  // QR
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

      <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <button onClick={logout}>Logout</button>

        <input
          placeholder="Course Code (DIT101)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <label>Masa Mula Kelas</label>
        <input
          type="datetime-local"
          value={classStart}
          onChange={(e) => setClassStart(e.target.value)}
        />

        <label>Lambat Selepas</label>
        <input
          type="datetime-local"
          value={lateAfter}
          onChange={(e) => setLateAfter(e.target.value)}
        />

        <label>Masa Tamat Kelas</label>
        <input
          type="datetime-local"
          value={classEnd}
          onChange={(e) => setClassEnd(e.target.value)}
        />

        <button onClick={createSession} disabled={loading || sessionId}>
          {loading ? "Creating..." : "Create Session"}
        </button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>

      {sessionId && (
        <div style={{ marginTop: 25, border: "1px solid #ccc", padding: 20 }}>
          <img src={qrImage} alt="QR" />
          <p>
            <b>Session ID:</b> {sessionId}
          </p>
          <p>
            <b>Session Tamat:</b>{" "}
            {expiresAt ? new Date(expiresAt).toLocaleString() : "-"}
          </p>
          <button onClick={endSession}>Tamatkan Session</button>
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

