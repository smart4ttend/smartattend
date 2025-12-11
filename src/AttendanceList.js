import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance_records")
        .select("id, student_matric, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!error) setRecords(data || []);
      setLoading(false);
    };

    fetchData();

    // OPTIONAL: realtime update
    const channel = supabase
      .channel("attendance_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance_records" },
        (payload) => {
          if (payload.new.session_id === sessionId) {
            setRecords((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Senarai Kehadiran</h3>

      {loading && <p>Loading...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {records.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 10,
            fontSize: "15px",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Bil</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>
                Matric
              </th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>
                Masa Rekod
              </th>
            </tr>
          </thead>

          <tbody>
            {records.map((rec, index) => (
              <tr key={rec.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {index + 1}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {rec.student_matric}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {new Date(rec.created_at).toLocaleString()}
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

