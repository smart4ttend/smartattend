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

  const [startTime, setStartTime] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [endTime, setEndTime] = useState("");

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
  const loadSession = async () => {
    const savedSession = localStorage.getItem("activeSessionId");

    if (!savedSession || savedSession === "null") return;

    // 🔥 check expired
    const { data } = await supabase
      .from("attendance_sessions")
      .select("expires_at")
      .eq("id", savedSession)
      .single();

    if (!data) return;

    const now = new Date();
    const expired = new Date(data.expires_at);

    if (now > expired) {
      // ❌ session tamat → clear
      localStorage.removeItem("activeSessionId");
      setSessionId(null);
    } else {
      // ✅ session masih aktif
      setSessionId(savedSession);
      setPage("attendance");
    }
  };

  loadSession();
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
  // CREATE SESSION
  // ===============================
  const createEventSession = async () => {
    if (!startTime || !lateAfter || !endTime) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            class_start_at: startTime,
            late_after: lateAfter,
            expires_at: endTime,
            class_name: "DEFAULT",
          },
        ])
        .select()
        .single();

      setSessionId(data.id);
      localStorage.setItem("activeSessionId", data.id);

    } catch {
      alert("Error creating session");
    }
  };

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

            <div style={statCard} onClick={() => setPage("session")}>
              Generate QR
            </div>

            <div style={statCard} onClick={() => setPage("attendance")}>
              View Records
            </div>
          </div>
        </>
      )}

      {/* SETUP */}
      {page === "setup" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Home</button>
          <SetupEvent staffName={staffName} />
        </div>
      )}

      {/* GENERATE QR */}
      {page === "session" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>📱 Generate QR</h3>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input type="datetime-local" onChange={(e) => setStartTime(e.target.value)} />
            <input type="datetime-local" onChange={(e) => setLateAfter(e.target.value)} />
            <input type="datetime-local" onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <button onClick={createEventSession}>
            Generate QR
          </button>

          {sessionId && (
            <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
              
              {/* QR */}
              <div style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <h4>Scan QR</h4>

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/attendance?session_id=${sessionId}`}
                  alt="QR"
                />
              </div>

              {/* LIVE LIST */}
              <div style={{ flex: 1 }}>
                <AttendanceList sessionId={sessionId} />
              </div>

            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE */}
      {page === "attendance" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>Check-in Records</h3>

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
            <AttendanceList sessionId={sessionId} hideIfExpired={true} />
          ) : (
            <p>Please select a session.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
