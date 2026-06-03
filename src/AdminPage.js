import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";
import SetupEvent from "./SetupEvent";

const container = {
  padding: "30px",
  background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
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
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
  cursor: "pointer",
  textAlign: "center",
  fontWeight: "600",
};

const buttonStyle = {
  padding: "10px 16px",
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

function AdminPage({ staffName, logout }) {
  const [page, setPage] = useState("dashboard");

  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isExpired, setIsExpired] = useState(false);

  const [eventName, setEventName] = useState("");
  const [currentEventName, setCurrentEventName] = useState("");
  const [qrToken, setQrToken] = useState("");

  const [startTime, setStartTime] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("created_by", staffName)
        .order("id", { ascending: false });

      setSessions(data || []);
    };

    fetchSessions();
  }, [staffName]);

  useEffect(() => {
  setSessionId(null);
}, [staffName]);

  useEffect(() => {
  const fetchToken = async () => {
    if (!sessionId) return;

    const { data } = await supabase
      .from("attendance_sessions")
      .select("qr_token")
      .eq("id", sessionId)
      .single();

    if (data?.qr_token) {
      setQrToken(data.qr_token);
    }
  };

  fetchToken();
}, [sessionId]);

  useEffect(() => {
    const loadSession = async () => {
      const savedSession = localStorage.getItem("activeSessionId");

      if (!savedSession || savedSession === "null") return;

const { data } = await supabase
  .from("attendance_sessions")
  .select("expires_at, created_by") // 🔥 tambah ini
  .eq("id", savedSession)
  .single();

// 🔥 VALIDATE OWNER
if (!data || data.created_by !== staffName) {
  localStorage.removeItem("activeSessionId");
  setSessionId(null);
  return;
}

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

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("activeSessionId", sessionId);
    }
  }, [sessionId]);

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

  useEffect(() => {
  if (!sessionId || isExpired) return;

  const refreshQR = async () => {
    const newToken = crypto.randomUUID();

    await supabase
      .from("attendance_sessions")
      .update({
        qr_token: newToken,
        qr_expiry: new Date(
          Date.now() + 30000
        ).toISOString(),
      })
      .eq("id", sessionId);

    setQrToken(newToken);
  };

  const interval = setInterval(refreshQR, 30000);

  return () => clearInterval(interval);
}, [sessionId, isExpired]);

  
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
      const token = crypto.randomUUID();

const { data } = await supabase
  .from("attendance_sessions")
  .insert([
    {
      class_start_at: startTime,
      late_after: lateAfter,
      expires_at: endTime,
      class_name: eventName.trim(),
      created_by: staffName,
      qr_token: token,
      qr_expiry: new Date(
        Date.now() + 30000
      ).toISOString(),
    },
  ])
        .select()
        .single();

      setSessionId(data.id);
      setQrToken(token);
      setSessions(prev => [data, ...prev]);
      localStorage.setItem("activeSessionId", data.id);
      setIsExpired(false);
      setEventName("");
    } catch {
      alert("Error creating session");
    }
  };

  return (
    <div style={container}>
      {page === "dashboard" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={header}>🚀 Event Check-in Dashboard</div>
            <button onClick={logout} style={buttonStyle}>
              Logout
            </button>
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
{page === "session" && (
  <div>
    <button onClick={() => setPage("dashboard")} style={buttonStyle}>
      ← Back
    </button>

    <h3>📱 Generate QR</h3>

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

    <button onClick={createEventSession} style={buttonStyle}>
      Generate QR
    </button>

    {isExpired && (
      <p style={{ color: "red", marginTop: 10 }}>
        ⚠️ Session has ended. Please generate a new QR.
      </p>
    )}


{sessionId && (
  <div
    style={{
      display: "flex",
      gap: "30px",
      alignItems: "flex-start",
      marginTop: 20,
      flexWrap: "wrap",
    }}
  >
    {/* QR */}
    {sessionId && !isExpired && (
      <div>
        <h3>📍 {currentEventName || "Event"}</h3>

       <img
  style={{ width: 350 }}
  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${window.location.origin}/attendance?session_id=${sessionId}&token=${qrToken}`
  )}&t=${Date.now()}`}
  alt="QR"
/>

<p><b>QR Token:</b> {qrToken}</p>

<p style={{ fontSize: "12px", wordBreak: "break-all" }}>
  {window.location.origin}/attendance?session_id={sessionId}&token={qrToken}
</p>
      </div>
    )}

    {/* Attendance */}
    <div style={{ flex: 1, minWidth: 300 }}>
      <h3>📋 Live Attendance</h3>

      <AttendanceList
        sessionId={sessionId}
        currentEventName={currentEventName}
      />
    </div>
  </div>
)}
  </div>
)}
{page === "setup" && (
  <div>
    <button onClick={() => setPage("dashboard")} style={buttonStyle}>
      ← Home
    </button>

    <h3 style={{ marginTop: 10 }}>📅 Create Event</h3>

    <SetupEvent staffName={staffName} />
  </div>
)}
      {page === "attendance" && (
        <div>
          <button onClick={() => setPage("dashboard")} style={buttonStyle}>
            ← Back
          </button>

          <h3>Check-in Records</h3>

          <p style={{ fontWeight: "600", marginBottom: "10px" }}>
            📌 {currentEventName || "No Event Selected"}
          </p>

          {/* ✅ FIXED SELECT */}
          <select
            name="program"
            value={sessionId ?? ""}
            onChange={(e) => {
              const selectedId = e.target.value;

              if (!selectedId) {
                setSessionId(null);
                setCurrentEventName("");
                return;
              }

              setSessionId(selectedId);

              const selected = sessions.find(s => s.id === selectedId);
              setCurrentEventName(selected?.class_name || "");
            }}
          >
            <option value="">Select Program</option>

            {sessions
              .filter((s) => s.id)
              .sort((a, b) => a.class_name.localeCompare(b.class_name))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.class_name || "Event"}
                </option>
              ))}
          </select>

          {sessionId ? (
            <AttendanceList
              sessionId={sessionId}
              currentEventName={currentEventName}
            />
          ) : (
            <p>Please select a program.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
