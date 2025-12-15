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
        .select("student_matric, timestamp")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error loading records:", error);
        return;
      }

      console.log("DATA LOADED:", data);
      setRecords(data);
      setLoading(false);
    };

    fetchRecords();
  }, [sessionId]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Senarai Kehadiran</h3>

      {loading && <p>Memuatkan...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {records.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", width: "100%", marginTop: 10 }}
        >
          <thead>
            <tr>
              <th>Student Matric</th>
              <th>Masa Rekod</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <tr key={index}>
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
