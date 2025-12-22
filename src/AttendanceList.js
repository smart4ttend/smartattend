import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRecords = async () => {
      console.log("📥 Fetching attendance for session:", sessionId);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("student_matric, timestamp")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("❌ Fetch error:", error.message);
        setRecords([]);
      } else {
        console.log("✅ Attendance data:", data);
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchRecords();
  }, [sessionId]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Senarai Kehadiran</h3>

      {loading && <p>Memuatkan data...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {!loading && records.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", marginTop: 10 }}
        >
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>No</th>
              <th>No Matrik</th>
              <th>Masa Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
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
