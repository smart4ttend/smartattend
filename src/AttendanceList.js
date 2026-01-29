import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    if (!sessionId) return;

    // 1) ambil attendance_records (confirm jalan)
    const { data: attendanceData, error: aErr } = await supabase
      .from("attendance_records")
      .select("id, student_matric, timestamp, status")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: false });

    console.log("Attendance fetch:", attendanceData, aErr);

    if (aErr) {
      setRows([]);
      setLoading(false);
      return;
    }

    const records = attendanceData || [];

    // kalau tiada data
    if (records.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    // 2) ambil nama dari students (pakai matric_no)
    const matricList = [...new Set(records.map((r) => r.student_matric))];

    const { data: studentsData, error: sErr } = await supabase
      .from("students")
      .select("matric_no, name")
      .in("matric_no", matricList);

    console.log("Students fetch:", studentsData, sErr);

    // kalau students fetch gagal, kita tetap boleh tunjuk matrik sahaja
    const mapName = {};
    (studentsData || []).forEach((s) => {
      mapName[s.matric_no] = s.name;
    });

    const merged = records.map((r) => ({
      ...r,
      student_name: mapName[r.student_matric] || "-", // kalau tiada nama, "-"
    }));

    setRows(merged);
    setLoading(false);
  }, [sessionId]);

  // ✅ AUTO REFRESH setiap 3 saat (macam kod lama anda)
  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  if (loading) return <p>Memuatkan kehadiran...</p>;

  return (
    <div>
      <h3>Senarai Kehadiran</h3>

      {rows.length === 0 ? (
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
