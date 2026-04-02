import React, { useState } from "react";
import { supabase } from "./supabase";

function RegisterPage({ onBack }) {
  const [adminId, setAdminId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!adminId || !name) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    // 🔒 Backend kekal (staff table)
    const { error } = await supabase
      .from("staff")
      .insert([
        {
          staff_no: adminId.trim().toUpperCase(),
          name: name.trim(),
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Registration failed: " + error.message);
    } else {
      alert("✅ Registration successful!");
      onBack(); // balik login
    }
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
        {/* 🔥 TITLE */}
        <h2 style={{ marginBottom: "10px" }}>📝 Register Admin</h2>

        <p style={{ marginBottom: "20px", color: "#666" }}>
          Create a new admin account
        </p>

        <input
          type="text"
          placeholder="Enter Admin ID (e.g. ADM001)"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "12px",
            outline: "none",
          }}
        />

        <input
          type="text"
          placeholder="Enter Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          onClick={handleRegister}
          disabled={loading}
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
          {loading ? "Saving..." : "Register"}
        </button>

        <button
          onClick={onBack}
          style={{
            marginTop: "12px",
            background: "none",
            border: "none",
            color: "#4f8cff",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
