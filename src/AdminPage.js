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

  const [eventCode, setEventCode] = useState("");
  const [events, setEvents] = useState([]);

  const [startTime, setStartTime] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [endTime, setEndTime] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ===============================
  // FETCH EVENTS
  // ===============================
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("lecturer_courses")
        .select("*")
        .order("course_code");

      setEvents(data || []);
    };

    fetchEvents();
  }, []);

  // ===============================
  // 🔥 LOAD SAVED SESSION
  // ===============================
  useEffect(() => {
    const savedSession = localStorage.getItem("activeSessionId");
    console.log("Saved session:", savedSession); // 🔥 DEBUG
    if (savedSession) {
      setSessionId(savedSession);
    }
  }, []);

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

  // ===============================
  // CREATE EVENT SESSION
  // ===============================
  const createEventSession = async () => {
    if (!eventCode || !startTime || !lateAfter || !endTime) {
      alert("Please fill in all fields.");
      return;
    }

    const start = new Date(startTime);
    const late = new Date(lateAfter);
    const end = new Date(endTime);

    if (!(start < late && late < end)) {
      alert("Invalid time sequence.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: eventCode.trim().toUpperCase(),
            class_start_at: start,
            late_after: late,
            expires_at: end,
            class_name: "DEFAULT",
          },
        ])
        .select()
        .single();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // ✅ SET + SAVE SESSION
      setSessionId(data.id);
      localStorage.setItem("activeSessionId", data.id);

    } catch {
      setErrorMsg("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Event Setup</h2>
          <SetupEvent staffName={staffName} />
        </div>
      )}

      {/* QR SESSION */}
      {page === "session" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h2>📱 QR Check-in</h2>

          {/* EVENT SELECT */}
          <select
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value)}
            style={{ padding: 8, marginBottom: 10 }}
          >
            <option value="">Select Event</option>
            {events.map((e) => (
              <option key={e.id} value={e.course_code}>
                {e.course_code}
              </option>
            ))}
          </select>

          {/* TIME INPUT */}
          <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
            <input type="datetime-local" onChange={(e) => setStartTime(e.target.value)} />
            <input type="datetime-local" onChange={(e) => setLateAfter(e.target.value)} />
            <input type="datetime-local" onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <button onClick={createEventSession}>
            {loading ? "Creating..." : "Generate QR"}
          </button>

          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

          {/* QR + LIST */}
          {sessionId && (
            <div style={{ display: "flex", gap: "30px", marginTop: 20 }}>
              
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

                <p>Event: <b>{eventCode}</b></p>
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

          {sessionId ? (
            <AttendanceList sessionId={sessionId} />
          ) : (
            <p>No active event session.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
