import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    const fetchAttendance = async () => {
      setLoading(true);
      setErrMsg("");

      // 1) Fetch attendance_records
      const { data: attendanceData, error: aErr } = await supabase
        .from("attendance_records")
        .select("id, student_matric, timestamp, status")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (aErr) {
        console.error("❌ attendance_records error:", aErr);
        setErrMsg("Gagal load attendance_records: " + aErr.message);
        setLoading(false);
        return;
      }

      const records = attendanceData || [];

      // kalau tiada attendance lagi
      if (records.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      // 2) Fetch students for those matric numbers
      const matricList = [...new Set(records.map((r) => r.student_matric))];

      const { data: studentsData, error: sErr } = await supabase
        .from("students")
        .select("matric_no, name")
        .in("matric_no", matricList);

      if (sErr) {
        console.error("❌ students error:", sErr);
        setErrMsg("Gagal load students: " + sErr.message);
        setLoading(false);
        return;
      }

      // Build map matric_no -> name
      const mapName = {};
      (studentsData || []).forEach((s) => {
        mapName[s.matric_no] = s.name;
      });

      // merge
      const merged = records.map((r) => ({
        ...r,
        student_name: mapName[r.student_matric] || "-",
      }));

      setRows(merged);
      setLoading(false);
    };

    fetchAttendance();
  }, [sessionId]);

  if (loading) return <p>Memuatkan kehadiran...</p>;
  if (errMsg) return <p style={{ color: "red" }}>❌ {errMsg}</p>;

  return (
    <div>
      <h3>Senarai Kehadiran</h3>

      {rows.length === 0 ? (
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
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.student_name}</td>
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
