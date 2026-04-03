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

  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isExpired, setIsExpired] = useState(false);

  const [eventName, setEventName] = useState("");
  const [currentEventName, setCurrentEventName] = useState("");

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
  // FETCH EVENT NAME
  // ===============================
  useEffect(() => {
    const fetchEventName = async () => {
      if (!sessionId) return;

      const { data } = await supabase
        .from("attendance_sessions")
        .select("class_name")
        .eq("id", sessionId)
        .single();

      if (data) {
        setCurrentEventName(data.class_name);
      }
    };

    fetchEventName();
  }, [sessionId]);

  // ===============================
  // LOAD SAVED SESSION
  // ===============================
  useEffect(() => {
    const loadSession = async () => {
      const savedSession = localStorage.getItem("activeSessionId");

      if (!savedSession || savedSession === "null") return;

      const { data } = await supabase
        .from("attendance_sessions")
        .select("expires_at")
        .eq("id", savedSession)
        .single();

      if (!data) return;

      const now = new Date();
      const expired = new Date(data.expires_at);

      if (now > expired) {
        localStorage.removeItem("activeSessionId");
        setSessionId(null);
        setIsExpired(true);
      } else {
        setSessionId(savedSession);
        setIsExpired(false);
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
  // CHECK EXPIRED
  // ===============================
  useEffect(() => {
    const checkExpired = async () => {
      if (!sessionId) return;

      const { data } = await supabase
        .from("attendance_sessions")
        .select("expires_at")
        .eq("id", sessionId)
        .single();

      if (data) {
        const now = new Date();
        const expired = new Date(data.expires_at);

        if (now > expired) {
          setIsExpired(true);
          setSessionId(null);
          localStorage.removeItem("activeSessionId");
        } else {
          setIsExpired(false);
        }
      }
    };

    checkExpired();
  }, [sessionId]);

  // ===============================
  // CREATE SESSION
  // ===============================
  const createEventSession = async () => {
    if (!startTime || !lateAfter || !endTime) {
      alert("Please fill in all fields.");
      return;
    }

    if (!eventName.trim()) {
      alert("Please enter Event Name.");
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
            class_name: eventName.trim(),
          },
        ])
        .select()
        .single();

      setSessionId(data.id);
      localStorage.setItem("activeSessionId", data.id);
      setIsExpired(false);
      setEventName("");
    } catch {
      alert("Error creating session");
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
      {/* SETUP EVENT */}
      {page === "setup" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Home</button>

         <h3 style={{ marginTop: 10 }}>📅 Create Event</h3>

       <SetupEvent staffName={staffName} />
      </div>
      )}
      {/* GENERATE QR */}
      {page === "session" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>📱 Generate QR</h3>

          {/* 🔥 EVENT NAME INPUT */}
          <input
            type="text"
            placeholder="Event Name / Program"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input type="datetime-local" onChange={(e) => setStartTime(e.target.value)} />
            <input type="datetime-local" onChange={(e) => setLateAfter(e.target.value)} />
            <input type="datetime-local" onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <button onClick={createEventSession}>Generate QR</button>

          {isExpired && (
            <p style={{ color: "red", marginTop: 10 }}>
              ⚠️ Session has ended. Please generate a new QR.
            </p>
          )}

          {sessionId && !isExpired && (
            <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
              
              {/* QR SIDE */}
              <div style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <h4>Scan QR</h4>

                <p style={{ fontWeight: "600", marginBottom: 10 }}>
                  {currentEventName}
                </p>

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/attendance?session_id=${sessionId}`}
                  alt="QR"
                />
              </div>

              {/* ATTENDANCE SIDE */}
              <div style={{ flex: 1 }}>
                <h3>📍 {currentEventName}</h3>
                <AttendanceList sessionId={sessionId} hideIfExpired={true} />
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
            onChange={(e) => setSessionId(e.target.value || null)}
            style={{ padding: 8, marginBottom: 15 }}
          >
            <option value="">Select Session</option>

            {sessions
  .filter((s) => s.class_start_at) // 🔥 buang yang null / invalid
  .sort(
    (a, b) =>
      new Date(b.class_start_at) - new Date(a.class_start_at)
  ) // 🔥 latest first
  .map((s) => {
    const date = new Date(s.class_start_at);

    return (
      <option key={s.id} value={s.id}>
        {s.class_name || "Event"} -{" "}
        {date.toLocaleDateString()} ({date.toLocaleTimeString()})
      </option>
    );
  })}
          </select>

          {sessionId ? (
            <AttendanceList sessionId={sessionId} />
          ) : (
            <p>Please select a session.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
