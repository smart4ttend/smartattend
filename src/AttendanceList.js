import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId, hideIfExpired = false, currentEventName }){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

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
        backgroundColor: "#dcfce7",
        color: "#166534",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "13px",
      };
    }

    if (s === "LAMBAT") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "13px",
      };
    }

    return {};
  };

  const exportToCSV = () => {
    if (rows.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ["No", "Participant Name", "Status", "Check-in Time"];

    const csvRows = rows.map((row, index) => [
      index + 1,
      row.participant_name || "-",
      row.status || "-",
      row.checkin_time
        ? new Date(row.checkin_time).toLocaleString()
        : "-",
    ]);

    const csvContent =
      [headers, ...csvRows]
        .map((e) => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

const fetchAttendance = useCallback(async () => {
  if (sessionId === null) return; // ✅ FIX 1

  const { data, error } = await supabase
    .from("attendance_records")
    .select("id, student_matric, timestamp, status")
    .eq("session_id", String(sessionId)) // ✅ FIX 2
    .order("timestamp", { ascending: false });

  if (error) {
    setRows([]);
    setLoading(false);
    return;
  }

  const records = data || [];

  if (records.length > 0 && records[0].id !== highlightId) {
    setHighlightId(records[0].id);

    setTimeout(() => {
      setHighlightId(null);
    }, 2000);
  }

  const formatted = records.map((r) => ({
    id: r.id,
    participant_name: r.student_matric,
    status: r.status,
    checkin_time: r.timestamp,
  }));

  setRows(formatted);
  setLoading(false);
}, [sessionId, highlightId]);

useEffect(() => {
  if (!sessionId) {
    setLoading(false);
    return;
  }

  fetchAttendance();
  const interval = setInterval(fetchAttendance, 3000);
  return () => clearInterval(interval);
}, [fetchAttendance, sessionId]);

  if (loading) return <p>Loading check-in records...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ marginBottom: "10px", fontWeight: "600" }}>
        Total Checked-in: {rows.length}
      </div>

      <h3 style={{ marginBottom: "10px" }}>
        📋 Event Check-in Records
      </h3>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={exportToCSV}
          style={{
            padding: "8px 14px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ⬇ Download Excel
        </button>
      </div>

      {/* 🔥 TAMBAH NAMA EVENT DI SINI */}
      <p
        style={{
          fontWeight: "600",
          marginBottom: "15px",
          background: "#eef2ff",
          padding: "8px 12px",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        📌 {currentEventName || "No Event Selected"}
      </p>

      {rows.length === 0 ? (
        <p>No check-in records yet.</p>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "10px",
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
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Check-in Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isHighlighted = row.id === highlightId;

                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: isHighlighted
                        ? "#d4edda"
                        : "transparent",
                      transition: "background-color 0.5s ease",
                    }}
                  >
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>
                      {row.participant_name || "-"}
                    </td>

                    <td style={tdStyle}>
                      <span style={getStatusStyle(row.status)}>
                        {row.status || "-"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {row.checkin_time
                        ? new Date(row.checkin_time).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceList;
