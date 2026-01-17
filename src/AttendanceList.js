import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

function AttendanceList({ sessionId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (!error) {
      setRecords(data || []);
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAttendance();

    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  if (loading) return <p>Memuatkan kehadiran...</p>;

  return (
    <div>
      <h3>Senarai Kehadiran</h3>

      {records.length === 0 ? (
        <p>Tiada rekod kehadiran setakat ini.</p>
      ) : (
        <table border="1" cellPadding="6" width="100%">
          <thead>
            <tr>
              <th>No</th>
              <th>No Matriks</th>
              <th>Masa</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
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
