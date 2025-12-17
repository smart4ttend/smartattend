import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function AttendanceList({ qrToken }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!qrToken) return;

    const fetchRecords = async () => {
      setLoading(true);

      // 1️⃣ Cari session berdasarkan TOKEN
      const { data: sessions, error: sessionErr } = await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("token", qrToken)
        .limit(1);

      if (sessionErr || !sessions || sessions.length === 0) {
        console.error("Session not found for token");
        setLoading(false);
        return;
      }

      const sessionId = sessions[0].id;
      console.log("Resolved sessionId:", sessionId);

      // 2️⃣ Fetch attendance berdasarkan sessionId sebenar
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Fetch attendance error:", error.message);
      } else {
        console.log("DATA LOADED:", data);
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchRecords();
  }, [qrToken]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Senarai Kehadiran</h3>

      {loading && <p>Memuatkan data...</p>}

      {!loading && records.length === 0 && (
        <p>Tiada rekod kehadiran setakat ini.</p>
      )}

      {!loading && records.length > 0 && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Bil</th>
              <th>ID Pelajar</th>
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


