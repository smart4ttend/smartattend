import React, { useState } from "react";
import { supabase } from "./supabase";

function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId.trim()) {
      alert("Sila masukkan ID pensyarah");
      return;
    }

    const idTrim = userId.trim().toUpperCase();
    setLoading(true);

    // =====================
    // LOGIN STAFF SAHAJA
    // =====================
    const { data, error } = await supabase
      .from("staff")
      .select("name")
      .eq("staff_no", idTrim)
      .limit(1);

    setLoading(false);

    if (error) {
      alert("Error sistem: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("❌ ID pensyarah tidak sah");
      return;
    }

    // ✅ LOGIN BERJAYA
    onLogin("staff", data[0].name);
  };

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>SmartAttend Login</h2>

      <p style={{ marginBottom: "10px", fontWeight: "500" }}>
        Login Pensyarah
      </p>

      <input
        type="text"
        placeholder="Masukkan ID Pensyarah (contoh: PTS.50010/1/43)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: "8px 16px",
          width: "100%",
        }}
      >
        {loading ? "Checking..." : "Login"}
      </button>
    </div>
  );
}

export default LoginPage;
