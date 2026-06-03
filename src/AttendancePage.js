import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const token = params.get("token");
  const [participantName, setParticipantName] = useState("");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ===============================
  // 1️⃣ FETCH EVENT
  // ===============================
  useEffect(() => {
    if (!sessionId) {
      setErrorMsg("Invalid event. Please scan a valid QR code.");
      return;
    }

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select(
  "class_start_at, late_after, expires_at, qr_token, qr_expiry"
)
        .eq("id", sessionId)
        .single();

      if (error || !data) {
  setErrorMsg("Event not found.");
  return;
}

// 🔥 QR lama tanpa token
if (!token) {
  setErrorMsg(
    "Invalid QR Code. Please scan the latest QR."
  );
  return;
}

// 🔥 QR expired atau token salah
if (
  token !== data.qr_token ||
  new Date() > new Date(data.qr_expiry)
) {
  setErrorMsg(
    "QR Code expired. Please scan the latest QR code."
  );
  return;
}
      setEvent(data);
    };

    fetchEvent();
  }, [sessionId, token]);

  // ===============================
  // 2️⃣ SUBMIT CHECK-IN
  // ===============================
  const submitCheckin = async () => {
    if (!participantName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!event) {
      alert("Invalid event");
      return;
    }

    const now = new Date();
    const expiresAt = new Date(event.expires_at);
    const lateAfter = event.late_after
      ? new Date(event.late_after)
      : null;

    if (now > expiresAt) {
      alert("❌ This event has ended. Check-in rejected.");
      return;
    }

    let status = "HADIR";
    if (lateAfter && now > lateAfter) {
      status = "LAMBAT";
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("attendance_records")
        .insert([
          {
            session_id: sessionId,
            student_matric: participantName.trim(), // 🔒 backend kekal
            status,
          },
        ]);

      if (error) {
        if (error.code === "23505") {
          alert("❌ You have already checked in for this event.");
        } else {
          alert("❌ Failed: " + error.message);
        }
        return;
      }

      alert(
        status === "LAMBAT"
          ? "⚠️ Check-in recorded as LATE."
          : "✅ Check-in successful."
      );

      setParticipantName("");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI STATES
  // ===============================
  if (errorMsg) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Error</h3>
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: 30 }}>
        <p>Loading event...</p>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 30, maxWidth: 420 }}>
      <h3>📍 Event Check-in</h3>

      <p>
        Please enter your <b>Name</b>
      </p>

      <input
        type="text"
        placeholder="Enter your name"
        value={participantName}
        onChange={(e) => setParticipantName(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={submitCheckin}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        {loading ? "Checking in..." : "Check-in"}
      </button>
    </div>
  );
}

export default AttendancePage;
