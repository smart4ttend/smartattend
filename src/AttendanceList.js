import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const loadRecords = async () => {
      setLoading(true);

      console.log("Fetching records for session:", sessionId);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("❌ ERROR FETCHING ATTENDANCE:", error);
      } else {
        console.log("✅ DATA LOADED:", data);
        setRecords(data);
      }

      setLoading(false);
    };

    loadRecords();
  }, [sessionId]);

  return (
    <div style={{ marginTop: 30, maxWidth: 600 }}>
      <h3>Senarai Kehadiran</h3>

      {loading && <p>Sedang memuatkan...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {!loading && records.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse", background: "white" }}
        >
          <thead style={{ background: "#f2f2f2" }}>
            <tr>
              <th>Bil</th>
              <th>Matric</th>
              <th>Masa</th>
            </tr>
          </thead>

          <tbody>
            {records.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.student_matric}</td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;
