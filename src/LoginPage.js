import React, { useState } from "react";
import { supabase } from "./supabase";

function LoginPage({ onLogin }) {
  const [userType, setUserType] = useState("student");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId.trim()) {
      alert("Sila masukkan ID");
      return;
    }

    const idTrim = userId.trim().toUpperCase();
    setLoading(true);

    // =====================
    // LOGIN STAFF
    // =====================
    if (userType === "staff") {
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
        alert("❌ ID staff tidak sah");
        return;
      }

      // ✅ staff sah
      onLogin("staff", data[0].name);
      return;
    }

    // =====================
    // LOGIN STUDENT
    // =====================
    if (userType === "student") {
      setLoading(false);
      onLogin("student", idTrim);
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>SmartAttend Login</h2>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input
            type="radio"
            value="student"
            checked={userType === "student"}
            onChange={() => setUserType("student")}
          />{" "}
          Student
        </label>

        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            value="staff"
            checked={userType === "staff"}
            onChange={() => setUserType("staff")}
          />{" "}
          Staff
        </label>
      </div>

      <input
        style={{ padding: 8, width: "100%" }}
        placeholder="ID (contoh: A001 / L001)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <br /><br />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ padding: "8px 16px" }}
      >
        {loading ? "Checking..." : "Login"}
      </button>
    </div>
  );
}

export default LoginPage;
