import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupEvent({ staffName }) {
  const [session, setSession] = useState("");
  const [eventName, setEventName] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH EVENT LIST
  // ===============================
  const fetchEvents = async () => {
    if (!staffName) return;

    let query = supabase
      .from("lecturer_courses")
      .select("*")
      .ilike("lecturer_name", staffName)
      .order("course_code", { ascending: true });

    // 🔥 filter session hanya kalau ada isi
    if (session.trim()) {
      query = query.eq("semester", session);
    }

    const { data, error } = await query;

    if (!error) setEvents(data || []);
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, staffName]);

  // ===============================
  // CREATE EVENT
  // ===============================
  const addEvent = async () => {
    if (!eventName.trim()) return alert("Please enter event name.");

    try {
      setLoading(true);

      const { error } = await supabase
        .from("lecturer_courses")
        .insert([
          {
            lecturer_name: staffName,
            course_code: eventName.trim().toUpperCase(), // 🔒 mapping
            semester: session.trim() || null, // optional
          },
        ]);

      if (error) {
        if (error.code !== "23505") {
          alert("Failed to create event: " + error.message);
          return;
        }
      }

      alert("✅ Event created successfully!");

      setEventName("");
      setSession("");
      fetchEvents();
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 20 }}>
      <h3>📅 Event Setup</h3>

      <p style={{ color: "#555" }}>
        Admin creates events.
      </p>

      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          maxWidth: 520,
        }}
      >
        {/* 🔥 SESSION OPTIONAL */}
        <label><b>Session (if applicable)</b></label>
        <input
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="e.g. 2025/2026 or leave blank"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        {/* 🔥 EVENT NAME */}
        <label><b>Event Name / Program / Course</b></label>
        <input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="e.g. Safety Training / DTM10333 / Annual Meeting"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <button
          onClick={addEvent}
          disabled={loading}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 10,
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Create Event"}
        </button>
      </div>

      {/* EVENT LIST */}
      <div style={{ marginTop: 25 }}>
        <h4>Event List</h4>

        {events.length === 0 ? (
          <p style={{ color: "#777" }}>No events created yet.</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              maxWidth: 700,
            }}
          >
            <thead>
              <tr>
                <th>Event</th>
                <th>Session</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.course_code}</td>
                  <td>{e.semester || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SetupEvent;
