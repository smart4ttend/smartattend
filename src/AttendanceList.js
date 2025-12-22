import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ qrToken }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!qrToken) return;

    const fetchAttendance = async () => {
      setLoading(true);
      console.log("🔍 QR TOKEN:", qrToken);

      // 1️⃣ Cari session berdasarkan TOKEN
      const { data: sessionData, error: sessionErr } = await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("token", qrToken)
        .single();

      if (sessionErr || !sessionData) {
        console.error("❌ Session not found", sessionErr);
        setLoading(false);
        return;
      }

      console.log("✅ SESSION ID:", sessionData.id);

      // 2️⃣ Fetch attendance berdasarkan SESSION ID
      const { data, error } = await supabase
        .from("attendance_records")
        .select("student_matric, timestamp")
        .eq("session_id", sessionData.id)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("❌ Fetch attendance error:", error);
      } else {
        console.log("📦 ATTENDANCE DATA:", data);
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchAttendance();
  }, [qrToken]);

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>No</th>
              <th>Student ID</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.student_matric}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;


