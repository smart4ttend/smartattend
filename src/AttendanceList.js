import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const loadRecords = async () => {
      console.log("Fetching records for session:", sessionId);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)   // ⬅ AMBIL SEMUA PELAJAR UNTUK SESSION
        .order("timestamp", { ascending: true });

      if (error) {
        console.log("Error:", error);
        setLoading(false);
        return;
      }

      console.log("DATA LOADED:", data);
      setRecords(data || []);
      setLoading(false);
    };

    loadRecords();
  }, [sessionId]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Senarai Kehadiran</h3>

      {loading && <p>Loading...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {records.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", marginTop: 10 }}
        >
          <thead>
            <tr>
              <th>No</th>
              <th>Matric</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id}>
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
