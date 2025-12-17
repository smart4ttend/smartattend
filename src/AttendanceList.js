import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRecords = async () => {
      console.log("Fetching records for session:", sessionId);
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("id, student_matric, timestamp")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Fetch error:", error.message);
      } else {
        console.log("DATA LOADED:", data);
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
          <thead>
            <tr>
              <th>No</th>
              <th>Matric No</th>
              <th>Masa Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <tr key={r.id}>
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

