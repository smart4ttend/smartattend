import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendancePage() {
  const [status, setStatus] = useState("Loading...");
  const [session, setSession] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Get token from URL
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("token", token)
        .limit(1);

      if (error) {
        setStatus("❌ Error: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        setStatus("❌ Invalid or expired QR code");
        return;
      }

      setSession(data[0]);
      setStatus("");
    };

    fetchSession();
  }, [token]);

  const submitAttendance = async () => {
    if (!studentId.trim()) {
      alert("Sila masukkan ID pelajar (contoh: A001)");
      return;
    }

    const idTrim = studentId.trim().toUpperCase();

    const { error } = await supabase
      .from("attendance_records")
      .insert([
        {
          student_matric: idTrim,
          session_id: session.id,
        },
      ]);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: 30 }}>
        <h2>✔️ Attendance Recorded Successfully</h2>
        <p>Thank you!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Attendance Check-In</h2>

      {status && <p>{status}</p>}

      {session && (
        <>
          <p>
            <b>Course:</b> {session.course_code}
          </p>

          <input
            style={{ padding: 8, width: 260 }}
            placeholder="Enter Matric No (A001)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <br />
          <br />

          <button onClick={submitAttendance} style={{ padding: "8px 16px" }}>
            Submit Attendance
          </button>
        </>
      )}
    </div>
  );
}

export default AttendancePage;
