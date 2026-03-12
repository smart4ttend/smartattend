import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";
import SetupSemester from "./SetupSemester";

const container = {
  padding: "30px",
  background: "#f4f6fb",
  minHeight: "100vh",
  fontFamily: "Segoe UI, sans-serif",
};

const header = {
  fontSize: "22px",
  fontWeight: "600",
  marginBottom: "25px",
};

const cardGrid = {
  display: "flex",
  gap: "20px",
  marginBottom: "25px",
};

const statCard = {
  flex: 1,
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const cardTitle = {
  fontSize: "13px",
  color: "#777",
};

const cardValue = {
  fontSize: "24px",
  fontWeight: "600",
};

function StaffPage({ staffName, logout }) {

  const [activeTab, setActiveTab] = useState(null);

  const [course, setCourse] = useState("");
  const [classStart, setClassStart] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [classEnd, setClassEnd] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);
  if (!staffName || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Akses Ditolak</h3>
        <p>Halaman ini hanya untuk staff sahaja.</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  const createSession = async () => {

    if (!course || !classStart || !lateAfter || !classEnd) {
      alert("Sila lengkapkan Course dan masa kelas.");
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
            course_code: course.trim().toUpperCase(),
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

      setErrorMsg("Ralat tidak dijangka.");

    } finally {

      setLoading(false);

    }

  };

  const endSession = () => {
    setSessionId(null);
    setExpiresAt(null);
  };

  const APP_URL = "https://smartattend-psi.vercel.app";

  const qrUrl = sessionId
    ? `${APP_URL}/attendance?session_id=${sessionId}`
    : "";

  const qrImage = sessionId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`
    : "";

  return (
    <div style={container}>

      <div style={header}>
        🎓 SmartAttend Lecturer Dashboard
      </div>

      {/* DASHBOARD CARD */}
      <div style={cardGrid}>

        <div
          style={{ ...statCard, cursor: "pointer" }}
          onClick={() => setActiveTab("setup")}
        >
          <div style={cardTitle}>Profile</div>
          <div style={cardValue}>Setup Semester</div>
        </div>

        <div
          style={{ ...statCard, cursor: "pointer" }}
          onClick={() => setActiveTab("session")}
        >
          <div style={cardTitle}>Create Session</div>
          <div style={cardValue}>Generate QR</div>
        </div>

        <div
          style={{ ...statCard, cursor: "pointer" }}
          onClick={() => {
            if (!sessionId) {
              alert("Sila create session dahulu.");
            } else {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
        >
          <div style={cardTitle}>Rekod Kehadiran</div>
          <div style={cardValue}>Lihat Kehadiran</div>
        </div>

      </div>

      <h2>Welcome, {staffName}</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

        <button
          onClick={logout}
          style={{ background: "#d32f2f", color: "#fff", padding: "6px 12px" }}
        >
          Logout
        </button>

        <button
          onClick={() => setActiveTab("setup")}
          style={{
            background: activeTab === "setup" ? "#1976d2" : "#e0e0e0",
            color: activeTab === "setup" ? "#fff" : "#000",
            padding: "6px 12px",
          }}
        >
          Setup Semester
        </button>

        <button
          onClick={() => setActiveTab("session")}
          style={{
            background: activeTab === "session" ? "#1976d2" : "#e0e0e0",
            color: activeTab === "session" ? "#fff" : "#000",
            padding: "6px 12px",
          }}
        >
          Create Session
        </button>

      </div>

      {activeTab === "setup" && (
        <div>
          <SetupSemester staffName={staffName} />
        </div>
      )}

      {activeTab === "session" && (
        <div>

          <h3>Create Attendance Session</h3>

          <div
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 8,
              maxWidth: 520,
            }}
          >

            <label><b>Course Code</b></label>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="DTM10333"
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label><b>Masa Mula Kelas</b></label>
            <input
              type="datetime-local"
              value={classStart}
              onChange={(e) => setClassStart(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label><b>Lambat Selepas</b></label>
            <input
              type="datetime-local"
              value={lateAfter}
              onChange={(e) => setLateAfter(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <label><b>Masa Tamat Kelas</b></label>
            <input
              type="datetime-local"
              value={classEnd}
              onChange={(e) => setClassEnd(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />

            <button
              onClick={createSession}
              disabled={loading || sessionId}
              style={{ width: "100%", padding: 10 }}
            >
              {loading ? "Creating..." : "Create Session"}
            </button>

            {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

          </div>

          {sessionId && (
            <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 15 }}>

              <h4>QR Code</h4>

              <img src={qrImage} alt="QR Code" />

              <p><b>Session ID:</b> {sessionId}</p>

              <p>
                <b>Session Tamat:</b>{" "}
                {expiresAt ? new Date(expiresAt).toLocaleString() : "-"}
              </p>

              <p>
                <b>Link:</b><br />
                <a href={qrUrl} target="_blank" rel="noreferrer">
                  {qrUrl}
                </a>
              </p>

              <button onClick={endSession}>Tamatkan Session</button>

            </div>
          )}

          {sessionId && (
            <div style={{ marginTop: 25 }}>
              <AttendanceList sessionId={sessionId} />
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default StaffPage;

