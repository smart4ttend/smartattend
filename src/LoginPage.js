import React, { useState } from "react";

function LoginPage({ onLogin }) {
  const [userType, setUserType] = useState("student");
  const [userId, setUserId] = useState("");

  const handleSubmit = () => {
    if (!userId.trim()) {
      alert("Sila masukkan ID");
      return;
    }
    onLogin(userType, userId.trim());
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>SmartAttend Login</h2>

      <div>
        <label>
          <input
            type="radio"
            value="student"
            checked={userType === "student"}
            onChange={() => setUserType("student")}
          />
          Student
        </label>

        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            value="staff"
            checked={userType === "staff"}
            onChange={() => setUserType("staff")}
          />
          Staff
        </label>
      </div>

      <br />

      <input
        placeholder="ID (contoh: A001 / DrDicky)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ padding: 8, width: 250 }}
      />

      <br /><br />

      <button onClick={handleSubmit}>Login</button>
    </div>
  );
}

export default LoginPage;
