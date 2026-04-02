import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupEvent({ staffName }) {
  const [session, setSession] = useState("2025/2026");
  const [eventCode, setEventCode] = useState("");
  const [groups, setGroups] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH EVENT LIST
  // ===============================
  const fetchEvents = async () => {
    if (!staffName || !session) return;

    const { data, error } = await supabase
      .from("lecturer_courses") // backend kekal
      .select("*")
      .ilike("lecturer_name", staffName)
      .eq("semester", session)
      .order("course_code", { ascending: true });

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
    if (!eventCode.trim()) return alert("Please enter Event Code.");
    if (!session.trim()) return alert("Please enter session.");
    if (!groups.trim())
      return alert("Please enter at least one group.");

    try {
      setLoading(true);

      const { error: courseErr } = await supabase
        .from("lecturer_courses")
        .insert([
          {
            lecturer_name: staffName,
            course_code: eventCode.trim().toUpperCase(),
            semester: session.trim(),
          },
        ]);

      if (courseErr) {
        if (courseErr.code !== "23505") {
          alert("Failed to create event: " + courseErr.message);
          return;
        }
      }

      const groupArray = groups
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      const rowsToInsert = groupArray.map((grp) => ({
        course_code: eventCode.trim().toUpperCase(),
        class_code: grp,
      }));

      const { error: classErr } = await supabase
        .from("course_classes")
        .upsert(rowsToInsert, {
          onConflict: "course_code,class_code",
        });

      if (classErr) {
        alert("Failed to save groups: " + classErr.message);
        return;
      }

      alert("✅ Event created successfully!");

      setEventCode("");
      setGroups("");

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

      {/* FORM */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          maxWidth: 520,
        }}
      >
        <label><b>Session</b></label>
        <input
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="2025/2026"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label><b>Event Code</b></label>
        <input
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value)}
          placeholder="EVT001"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label><b>Enter Group(s)</b></label>
        <input
          value={groups}
          onChange={(e) =>
            setGroups(e.target.value.toUpperCase())
          }
          placeholder="Example: GroupA or GroupA,GroupB"
          style={{ width: "100%", padding: 8, marginBottom: 5 }}
        />

        <p style={{ fontSize: 12, color: "#777" }}>
          Separate multiple groups with comma (,)
        </p>

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
                <th>Event Code</th>
                <th>Session</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.course_code}</td>
                  <td>{e.semester}</td>
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
