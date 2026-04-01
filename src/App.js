import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import StaffPage from "./StaffPage";
import AttendancePage from "./AttendancePage";
import RegisterPage from "./RegisterPage"; // ✅ TAMBAH

function App() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  const [page, setPage] = useState("login"); // ✅ TAMBAH

  // ===============================
  // 1️⃣ CHECK URL DULU (PENTING)
  // ===============================
  const isAttendancePage =
    window.location.pathname === "/attendance";

  useEffect(() => {
    if (isAttendancePage) return;

    const savedType = localStorage.getItem("userType");
    const savedId = localStorage.getItem("userId");

    if (savedType && savedId) {
      setUserType(savedType);
      setUserId(savedId);
    }
  }, [isAttendancePage]);

  // ===============================
  // 2️⃣ LOGIN HANDLER
  // ===============================
  const handleLogin = (type, id) => {
    setUserType(type);
    setUserId(id);
    localStorage.setItem("userType", type);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserType(null);
    setUserId(null);
    localStorage.clear();
    window.location.href = "/";
  };

  // ===============================
  // 3️⃣ ROUTING LOGIC
  // ===============================

  // 🎓 PELAJAR SCAN QR (TANPA LOGIN)
  if (isAttendancePage) {
    return <AttendancePage />;
  }

  // 🧑‍🏫 STAFF LOGIN SUCCESS
  if (userType === "staff") {
    return <StaffPage staffName={userId} logout={handleLogout} />;
  }

  // 🆕 REGISTER PAGE
  if (page === "register") {
    return (
      <RegisterPage
        onBack={() => setPage("login")}
      />
    );
  }

  // 🔐 LOGIN PAGE (DEFAULT)
  return (
    <LoginPage
      onLogin={handleLogin}
      onRegister={() => setPage("register")} // ✅ TAMBAH
    />
  );
}

export default App;
