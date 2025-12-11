import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    const fetchAttendance = async () => {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("attendance_records")
        .select("id, student_matric, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setRows(data || []);
      setLoading(false);
    };

    fetchAttendance();
  }, [sessionId]);

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        border: "1px solid #e6e6e6",
        borderRadius: 10,
        background: "#fff",
        maxWidth: 600,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Senarai Kehadiran</h3>

      {loading && <p>Sedang memuatkan kehadiran...</p>}
      {errorMsg && <p style={{ color: "red" }}>Error: {errorMsg}</p>}

      {!loading && !errorMsg && rows.length === 0 && (
        <p>Belum ada pelajar yang merekod kehadiran.</p>
      )}

      {!loading && rows.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  padding: "6px 4px",
                }}
              >
                #
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  padding: "6px 4px",
                }}
              >
                Matric No
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  padding: "6px 4px",
                }}
              >
                Masa Hadir
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, index) => (
              <tr key={r.id}>
                <td
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    padding: "4px 4px",
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    padding: "4px 4px",
                  }}
                >
                  {r.student_matric}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    padding: "4px 4px",
                  }}
                >
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceList;
