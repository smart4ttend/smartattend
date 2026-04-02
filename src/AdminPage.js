import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";
import SetupEvent from "./SetupEvent";

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
  cursor: "pointer",
  textAlign: "center",
  fontWeight: "600",
};

function AdminPage({ staffName, logout }) {
  const [page, setPage] = useState("dashboard");

  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // ===============================
  // FETCH SESSION HISTORY
  // ===============================
  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("attendance_sessions")
        .select("*")
        .order("id", { ascending: false });

      setSessions(data || []);
    };

    fetchSessions();
  }, []);

  // ===============================
  // LOAD SAVED SESSION
  // ===============================
  useEffect(() => {
    const savedSession = localStorage.getItem("activeSessionId");

    if (savedSession && savedSession !== "null") {
      setSessionId(savedSession);
      setPage("attendance");
    }
  }, []);

  // ===============================
  // AUTO SAVE SESSION
  // ===============================
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("activeSessionId", sessionId);
    }
  }, [sessionId]);

  // ===============================
  // ACCESS CONTROL
  // ===============================
  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);
  if (!staffName || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Access Denied</h3>
        <p>This page is for admin only.</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={container}>
      {/* DASHBOARD */}
      {page === "dashboard" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={header}>🚀 Event Check-in Dashboard</div>
            <button onClick={logout}>Logout</button>
          </div>

          <h2>Welcome, {staffName}</h2>

          <div style={cardGrid}>
            <div style={statCard} onClick={() => setPage("setup")}>
              Create Event
            </div>

            <div style={statCard} onClick={() => setPage("attendance")}>
              View Records
            </div>
          </div>
        </>
      )}

      {/* ATTENDANCE */}
      {page === "attendance" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>Check-in Records</h3>

          {/* SESSION DROPDOWN */}
          <select
            value={sessionId || ""}
            onChange={(e) => setSessionId(e.target.value)}
            style={{ padding: 8, marginBottom: 15 }}
          >
            <option value="">Select Session</option>

            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Session {s.id} | {new Date(s.class_start_at).toLocaleString()}
              </option>
            ))}
          </select>

          {sessionId ? (
            <AttendanceList sessionId={sessionId} />
          ) : (
            <p>Please select a session.</p>
          )}
        </div>
      )}

      {/* SETUP */}
      {page === "setup" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Home</button>
          <SetupEvent staffName={staffName} />
        </div>
      )}
    </div>
  );
}

export default AdminPage;
