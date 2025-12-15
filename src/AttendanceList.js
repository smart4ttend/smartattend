import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    console.log("Fetching records for session:", sessionId);

    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", String(sessionId))   // 🔥 FIX PENTING DI SINI
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
      }

      console.log("DATA LOADED:", data);
      setRecords(data || []);
      setLoading(false);
    };

    fetchRecords();
  }, [sessionId]);

  return (
    <div style={{ marginTop: 25 }}>
      <h3>Senarai Kehadiran</h3>

      {loading ? (
        <p>Sedang memuat...</p>
      ) : records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>{rec.student_matric}</td>
                <td>{new Date(rec.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;
