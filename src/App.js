import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import StaffPage from "./StaffPage";
import AttendancePage from "./AttendancePage";

function App() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  // 🔹 Restore login selepas refresh
  useEffect(() => {
    const savedType = localStorage.getItem("userType");
    const savedId = localStorage.getItem("userId");

    if (savedType && savedId) {
      setUserType(savedType);
      setUserId(savedId);
    }
  }, []);

  const handleLogin = (type, id) => {
    setUserType(type);
    setUserId(id);
    localStorage.setItem("userType", type);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserType(null);
    setUserId(null);
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
  };

  // 🔹 STAFF
  if (userType === "staff") {
    return <StaffPage staffName={userId} logout={handleLogout} />;
  }

  // 🔹 STUDENT (QR attendance)
  if (userType === "student") {
    return <AttendancePage />;
  }

  // 🔹 LOGIN
  return <LoginPage onLogin={handleLogin} />;
}

export default App;

