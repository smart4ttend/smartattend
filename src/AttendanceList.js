import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

      if (!error) setRecords(data || []);
    };

    fetchRecords();

    const channel = supabase
      .channel("attendance-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_records",
          filter: `session_id=eq.${sessionId}`,
        },
        fetchRecords
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sessionId]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 && <p>Tiada rekod kehadiran setakat ini.</p>}

      {records.length > 0 && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>#</th>
              <th>No Matrik</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{r.student_matric}</td>
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


