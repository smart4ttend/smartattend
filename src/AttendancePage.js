import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function AttendancePage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [session, setSession] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("token", token)
        .single();

      if (!error) setSession(data);
    };

    if (token) fetchSession();
  }, [token]);

  const submitAttendance = async () => {
    if (!studentId || !studentName) {
      alert("Sila isi No Matrik dan Nama");
      return;
    }

    await supabase.from("attendance").insert([
      {
        session_id: session.id,
        student_id: studentId,
        student_name: studentName,
      },
    ]);

    alert("Kehadiran direkod");
  };

  if (!token) return <p>QR tidak sah</p>;
  if (!session) return <p>Loading session...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h3>{session.course_code}</h3>

      <input
        placeholder="No Matrik"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Nama"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />

      <br /><br />

      <button onClick={submitAttendance}>Hadir</button>
    </div>
  );
}
