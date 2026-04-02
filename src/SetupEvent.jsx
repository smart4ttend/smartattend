import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupEvent({ staffName }) {
  const [session, setSession] = useState("2025/2026"); // semester → session
  const [eventCode, setEventCode] = useState(""); // courseCode → eventCode
  const [groups, setGroups] = useState(""); // classes → groups

  const [events, setEvents] = useState([]); // courses → events
  const [loading, setLoading] = useState(false);

  const [activeEvent, setActiveEvent] = useState(null);

  // ===============================
  // FETCH EVENT LIST (backend masih lecturer_courses)
  // ===============================
  const fetchEvents = async () => {
    if (!staffName || !session) return;

    const { data, error } = await supabase
      .from("lecturer_courses") // 🔒 kekal
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
  // ADD EVENT (backend masih course)
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
            course_code: eventCode.trim().toUpperCase(), // mapping sahaja
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
  // CSV UPLOAD (Participant)
  // ===============================
  const handleFileUpload = async (e) => {
    if (!activeEvent) {
      alert("Please select an event first");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split("\n").slice(1);

      const participants = rows
        .map((row) => {
          const [id, name, group] = row.split(",");
          return {
            matric_no: id?.trim(), // 🔒 backend kekal
            name: name?.trim(),
            class_name: group?.trim(),
            course_code: activeEvent,
          };
        })
        .filter((p) => p.matric_no && p.name);

      const { error } = await supabase.from("students").insert(participants);

      if (error) {
        alert("Upload failed: " + error.message);
      } else {
        alert(`Participants uploaded for ${activeEvent}`);
      }
    } catch (err) {
      alert("Error reading CSV file");
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 20 }}>
      <h3>📅 Event Setup</h3>

      <p style={{ color: "#555" }}>
        Admin creates events and uploads participant list.
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.course_code}</td>
                  <td>{e.semester}</td>
                  <td>
                    <button
                      onClick={() => setActiveEvent(e.course_code)}
                      style={{
                        padding: "6px 12px",
                        background: "#4f8cff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Upload Participant List
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* UPLOAD */}
      {activeEvent && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            maxWidth: 400,
          }}
        >
          <h4>Upload Participant List (CSV)</h4>
          <p style={{ fontSize: 13 }}>
            Event: <b>{activeEvent}</b>
          </p>

          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
      )}
    </div>
  );
}

export default SetupEvent;
