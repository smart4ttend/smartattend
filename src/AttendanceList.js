import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
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
        backgroundColor: "#e6f7ec",
        color: "#1e7e34",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "600",
        fontSize: "13px",
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
      };
    }

    return {};
  };

  // ===============================
  // 🔥 EXPORT CSV
  // ===============================
  const exportToCSV = () => {
    if (rows.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["No", "Participant Name", "Status", "Check-in Time"];

    const csvRows = rows.map((row, index) => [
      index + 1,
      row.participant_name,
      row.status,
      new Date(row.checkin_time).toLocaleString(),
    ]);

    const csvContent =
      [headers, ...csvRows]
        .map((e) => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${sessionId}.csv`;
    link.click();
  };

  const fetchAttendance = useCallback(async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from("attendance_records")
      .select("id, student_matric, timestamp, status")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: false });

    if (error) {
      setRows([]);
      setLoading(false);
      return;
    }

    const records = data || [];

    // 🔥 highlight latest
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
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  if (loading) return <p>Loading check-in records...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* 🔥 COUNTER + EXPORT */}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: "600" }}>
          Total Checked-in: {rows.length}
        </div>

        <button
          onClick={exportToCSV}
          style={{
            padding: "8px 12px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Export Excel
        </button>
      </div>

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
                    <td style={tdStyle}>{row.participant_name}</td>

                    <td style={tdStyle}>
                      <span style={getStatusStyle(row.status)}>
                        {row.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {new Date(row.checkin_time).toLocaleString()}
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
