import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const thStyle = {
    padding: "12px",
    fontWeight: "600",
    fontSize: "14px",
  };

  const tdStyle = {
    padding: "12px",
    fontSize: "14px",
  };

  const getStatusStyle = (status) => {
    const s = String(status).toUpperCase();

    if (s === "HADIR") {
      return {
        backgroundColor: "#e6f7ec",
        color: "#1e7e34",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "13px",
        display: "inline-block",
      };
    }

    if (s === "LAMBAT") {
      return {
        backgroundColor: "#fff4e5",
        color: "#cc7a00",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "13px",
        display: "inline-block",
      };
    }

    return {};
  };

  const fetchAttendance = useCallback(async () => {
    if (!sessionId) return;

    // 🔥 Backend masih sama (attendance_records)
    const { data: attendanceData, error: aErr } = await supabase
      .from("attendance_records")
      .select("id, student_matric, timestamp, status")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: false });

    if (aErr) {
      setRows([]);
      setLoading(false);
      return;
    }

    const records = attendanceData || [];

    if (records.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    // 🔥 Ambil nama dari students (backend kekal)
    const matricList = [...new Set(records.map((r) => r.student_matric))];

    const { data: studentsData } = await supabase
      .from("students")
      .select("matric_no, name")
      .in("matric_no", matricList);

    const mapName = {};
    (studentsData || []).forEach((s) => {
      mapName[s.matric_no] = s.name;
    });

    // 🔥 MAP ke PARTICIPANT (frontend only)
    const merged = records.map((r) => ({
      id: r.id,
      participant_name: mapName[r.student_matric] || "-",
      identifier: r.student_matric,
      status: r.status,
      checkin_time: r.timestamp,
    }));

    setRows(merged);
    setLoading(false);
  }, [sessionId]);

  // AUTO REFRESH
  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  if (loading) return <p>Loading check-in records...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* 🔥 TITLE REBRAND */}
      <h3 style={{ marginBottom: "15px" }}>
        📋 Event Check-in Records
      </h3>

      {rows.length === 0 ? (
        <p>No check-in records yet.</p>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f6f8", textAlign: "left" }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Participant Name</th>
                <th style={thStyle}>Identifier</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Check-in Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{row.participant_name}</td>
                  <td style={tdStyle}>{row.identifier}</td>

                  <td style={tdStyle}>
                    <span style={getStatusStyle(row.status)}>
                      {row.status}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {new Date(row.checkin_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceList;
