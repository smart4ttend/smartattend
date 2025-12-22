import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";

function StaffPage({ staffName, logout }) {

  // ===============================
  // 1️⃣ STATE (HOOKS WAJIB DI ATAS)
  // ===============================
  const [course, setCourse] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // 2️⃣ SAFETY CHECK – STAFF SAHAJA
  // ===============================
  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);

  if (!staffName || staffName.trim() === "" || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Akses Ditolak</h3>
        <p>Halaman ini hanya untuk staff sahaja.</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // ===============================
  // 3️⃣ CREATE ATTENDANCE SESSION
  // ===============================
  const createSession = async () => {
    if (!course.trim()) {
      alert("Sila masukkan Course Code.");
      return;
    }

    try {
      setLoading(true);

      const token = crypto.randomUUID();
      const expiresAtValue = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: course.trim(),
            token: token,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setQrToken(token);
      setExpiresAt(expiresAtValue);
      setLoading(false);

    } catch (err) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  // ===============================
  // 4️⃣ QR URL & IMAGE
  // ===============================
  const qrUrl = qrToken
    ? `${window.location.origin}/attendance?token=${qrToken}`
    : "";

  const qrImage = qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        qrUrl
      )}`
    : "";

  // ===============================
  // 5️⃣ UI
  // ===============================
  return (
    <div style={{ padding: 30, maxWidth: 900 }}>
      <h2>Welcome, {staffName}</h2>

      {/* ===== TOP ACTION BAR ===== */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={logout}
          style={{
            background: "#d32f2f",
            color: "white",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

        <input
          placeholder="Course Code (DIT101)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          style={{ padding: 6 }}
        />

        <button onClick={createSession} disabled={loading}>
          {loading ? "Creating..." : "Create Session"}
        </button>
      </div>

      {/* ===== QR CARD ===== */}
      {qrToken && (
        <div
          style={{
            marginTop: 25,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 10,
            maxWidth: 420,
          }}
        >
          <h3>QR Code untuk Attendance</h3>

          <img src={qrImage} alt="QR Code" />

          <p><b>Session ID:</b> {sessionId}</p>
          <p><b>QR Token:</b> {qrToken}</p>

          <p>
            <b>Link:</b><br />
            <a href={qrUrl} target="_blank" rel="noreferrer">
              {qrUrl}
            </a>
          </p>

          <p>
            <b>QR Tamat:</b>{" "}
            {expiresAt ? new Date(expiresAt).toLocaleTimeString() : "-"}
          </p>

          <p style={{ color: "#555" }}>
            📌 Pelajar perlu scan QR ini untuk rekod kehadiran.
          </p>
        </div>
      )}

      {/* ===== SENARAI KEHADIRAN (INI PALING PENTING) ===== */}
      {sessionId && (
        <div style={{ marginTop: 30 }}>
          <AttendanceList sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}

export default StaffPage;
