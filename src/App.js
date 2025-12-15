import React, { useState, useEffect } from "react";
import StaffPage from "./StaffPage";
import AttendancePage from "./AttendancePage";
import LoginPage from "./LoginPage";

function App() {
  const [userType, setUserType] = useState(null); // "student" | "staff"
  const [userId, setUserId] = useState(null);

  // ✅ LOAD LOGIN DARI localStorage (AUTO LOGIN)
  useEffect(() => {
    const savedType = localStorage.getItem("userType");
    const savedId = localStorage.getItem("userId");

    if (savedType && savedId) {
      setUserType(savedType);
      setUserId(savedId);
    }
  }, []);

  // ✅ LOGIN
  const handleLogin = (type, id) => {
    localStorage.setItem("userType", type);
    localStorage.setItem("userId", id);

    setUserType(type);
    setUserId(id);
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");

    setUserType(null);
    setUserId(null);
  };

  // ===============================
  // ROUTING RINGKAS
  // ===============================

  if (userType === "staff") {
    return <StaffPage staffName={userId} logout={handleLogout} />;
  }

  if (userType === "student") {
    return <AttendancePage />;
  }

  return <LoginPage onLogin={handleLogin} />;
}

export default App;
