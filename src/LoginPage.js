import React, { useState } from "react";
import { supabase } from "./supabase";

function LoginPage({ onLogin, onRegister }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  if (!userId.trim() || !password) {
    alert("Please enter Admin ID and Password");
    return;
  }

  const email = `${userId.trim()}@smartattend.com`;

  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  setLoading(false);

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  // ✅ LOGIN SUCCESS (tak ubah flow lain)
  onLogin("admin", userId.trim());
};

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #4f8cff, #6ed0f6)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "16px",
          width: "320px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        {/* 🔥 REBRAND TITLE */}
        <h2 style={{ marginBottom: "10px" }}>🚀 Check-in System</h2>

        <p style={{ marginBottom: "20px", color: "#666" }}>
          Admin Login
        </p>

        <input
          type="text"
          placeholder="Enter email"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "15px",
            outline: "none",
          }}
        />

<input
  type="password"
  placeholder="Enter Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "15px",
    outline: "none",
  }}
/>
        <button
          onClick={handleLogin}
          disabled={loading}
          onMouseOver={(e) => (e.target.style.background = "#3a73e0")}
          onMouseOut={(e) => (e.target.style.background = "#4f8cff")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#4f8cff",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {loading ? "Checking..." : "Login"}
        </button>

        <button
          onClick={onRegister}
          style={{
            marginTop: "12px",
            background: "none",
            border: "none",
            color: "#4f8cff",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Register Admin
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
