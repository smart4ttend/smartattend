import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRecords = async () => {
      console.log("Fetching records for session:", sessionId);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("student_matric, timestamp")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Fetch error:", error.message);
        setRecords([]);
      } else {
        console.log("DATA LOADED:", data);
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchRecords();
  }, [sessionId]);

  if (loading) {
    return <p>Memuatkan senarai kehadiran...</p>;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", marginTop: 10 }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Matric No</th>
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

