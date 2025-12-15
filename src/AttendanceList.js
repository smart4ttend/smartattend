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
    fetchRecords(); // first load

    // 🔁 auto refresh every 5 seconds
    const interval = setInterval(fetchRecords, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>📋 Senarai Kehadiran</h3>

      {loading && <p>Memuatkan data...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {records.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{
            borderCollapse: "collapse",
            marginTop: 10,
            width: "100%",
            maxWidth: 500,
          }}
        >
          <thead style={{ background: "#f2f2f2" }}>
            <tr>
              <th>No</th>
              <th>Matric No</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{r.student_matric}</td>
                <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;
