import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!sessionId) return;

    console.log("Fetching records for session:", sessionId);

    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching attendance:", error.message);
      return;
    }

    console.log("DATA LOADED:", data);
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords(); // fetch awal

    const interval = setInterval(() => {
      fetchRecords(); // auto refresh setiap 5 saat
    }, 5000);

    return () => clearInterval(interval);
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
              <th>Matrik Pelajar</th>
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


