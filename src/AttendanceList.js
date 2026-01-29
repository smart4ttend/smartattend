import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    const fetchAttendance = async () => {
      setLoading(true);
      setErrMsg("");

      const { data, error } = await supabase
        .from("attendance_records")
        .select(`
          id,
          student_matric,
          timestamp,
          status,
          students!attendance_records_student_matric_fkey (
            name
          )
        `)
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("❌ Fetch error:", error);
        setErrMsg(error.message);
        setRecords([]);
        setLoading(false);
        return;
      }

      setRecords(data || []);
      setLoading(false);
    };

    fetchAttendance();
  }, [sessionId]);

  if (loading) return <p>Memuatkan kehadiran...</p>;
  if (errMsg) return <p style={{ color: "red" }}>❌ {errMsg}</p>;

  return (
    <div>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pelajar</th>
              <th>No Matriks</th>
              <th>Status</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.students?.name || "-"}</td>
                <td>{row.student_matric}</td>
                <td>{row.status}</td>
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
