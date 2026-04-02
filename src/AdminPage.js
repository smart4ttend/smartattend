import React, { useState } from "react";
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
};

const cardTitle = {
  fontSize: "13px",
  color: "#777",
};

const cardValue = {
  fontSize: "20px",
  fontWeight: "600",
};

function AdminPage({ staffName, logout }) {
  const [page, setPage] = useState("dashboard");
  

  const [eventCode, setEventCode] = useState("");
  const [startTime, setStartTime] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [endTime, setEndTime] = useState("");

  const [sessionId, setSessionId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedGroup, setSelectedGroup] = useState("");

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
  // DELETE BY GROUP (backend still class)
  // ===============================
  const deleteByGroup = async () => {
    if (!selectedGroup) {
      alert("Please enter group name");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete all participants from ${selectedGroup}?`
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("students") // 🔒 kekal
      .delete()
      .eq("class_name", selectedGroup);

    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Participants deleted successfully!");
    }
  };

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
            course_code: eventCode.trim().toUpperCase(), // 🔒 mapping
            class_start_at: start,
            late_after: late,
            expires_at: end,
            class_name: "GROUP", // boleh improve later
          },
        ])
        .select()
        .single();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSessionId(data.id);
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
              <div style={cardTitle}>Event Setup</div>
              <div style={cardValue}>Create Event</div>
            </div>

            <div style={statCard} onClick={() => setPage("session")}>
              <div style={cardTitle}>QR Check-in</div>
              <div style={cardValue}>Generate QR</div>
            </div>

            <div style={statCard} onClick={() => setPage("attendance")}>
              <div style={cardTitle}>Records</div>
              <div style={cardValue}>View Check-ins</div>
            </div>
          </div>
        </>
      )}

      {/* SETUP */}
      {page === "setup" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Home</button>

          <h1>Event Setup</h1>

          <SetupEvent staffName={staffName} />
        </div>
      )}

      {/* SESSION */}
      {page === "session" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>Create Event Session</h3>

          <input
            placeholder="Event Code"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value)}
          />

          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input type="datetime-local" value={lateAfter} onChange={(e) => setLateAfter(e.target.value)} />
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

          <button onClick={createEventSession}>
            {loading ? "Creating..." : "Generate QR Session"}
          </button>

          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          {sessionId && <AttendanceList sessionId={sessionId} />}
        </div>
      )}

      {/* ATTENDANCE */}
      {page === "attendance" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>Check-in Records</h3>

          <input
            placeholder="Enter Group"
            value={selectedGroup}
            onChange={(e) =>
              setSelectedGroup(e.target.value.toUpperCase())
            }
          />

          <button onClick={deleteByGroup}>
            Delete by Group
          </button>

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
