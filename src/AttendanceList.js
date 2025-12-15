import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!sessionId) return;

    console.log("Fetching records for session:", sessionId);
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        id,
        student_matric,
        timestamp,
        students (
          name
        )
      `)
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      setLoading(false);
      return;
    }

    console.log("DATA LOADED:", data);
    setRecords(data || []);
    setLoading(false);
  };

  // 🔄 Auto refresh
  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 3000);
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
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th>#</th>
              <th>Matric No</th>
              <th>Nama Pelajar</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, index) => (
              <tr key={r.id}>
                <td>{index + 1}</td>
                <td>{r.student_matric}</td>
                <td>{r.students?.name || "-"}</td>
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


