import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setErrorMsg("Session ID tidak sah.");
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)

      console.log("📊 Attendance fetch:", data, error);

      if (error) {
        setErrorMsg("Gagal memuatkan data kehadiran.");
        setLoading(false);
        return;
      }

      setRecords(data || []);
      setLoading(false);
    };

    fetchAttendance();
  }, [sessionId]);

  // ================= UI =================
  if (loading) {
    return <p>Memuatkan kehadiran...</p>;
  }

  if (errorMsg) {
    return <p style={{ color: "red" }}>{errorMsg}</p>;
  }

  return (
    <div>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table
          border="1"
          cellPadding="6"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>No</th>
              <th>No Matriks</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.student_matric}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;
