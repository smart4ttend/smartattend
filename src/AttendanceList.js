import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    console.log("📥 Fetching attendance for session:", sessionId);

    const fetchAttendance = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("❌ Fetch error:", error.message);
        setLoading(false);
        return;
      }

      console.log("✅ Attendance data:", data);
      setRecords(data || []);
      setLoading(false);
    };

    fetchAttendance();
  }, [sessionId]);

  // ================= UI =================
  if (loading) {
    return <p>Memuatkan kehadiran...</p>;
  }

  return (
    <div>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>No</th>
              <th>No Matriks</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.student_matric}</td>
                <td>{new Date(row.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;
