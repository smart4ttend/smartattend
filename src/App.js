import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import AdminPage from "./AdminPage"; // 🔥 tukar sini
import AttendancePage from "./AttendancePage";
import RegisterPage from "./RegisterPage";

function App() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState("login");

  // ===============================
  // 1️⃣ CHECK URL (QR CHECK-IN)
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
   localStorage.removeItem("userType");
   localStorage.removeItem("userId");
// ❌ JANGAN remove activeSessionId
    window.location.href = "/";
  };

  // ===============================
  // 3️⃣ ROUTING LOGIC
  // ===============================

  // 📍 PARTICIPANT CHECK-IN (NO LOGIN)
  if (isAttendancePage) {
    return <AttendancePage />;
  }

  // 🔐 ADMIN LOGIN SUCCESS
  if (userType === "admin") {
    return (
      <AdminPage
        staffName={userId} // backend masih guna staffName
        logout={handleLogout}
      />
    );
  }

  // 🆕 REGISTER PAGE
  if (page === "register") {
    return (
      <RegisterPage
        onBack={() => setPage("login")}
      />
    );
  }

  // 🔐 LOGIN PAGE
  return (
    <LoginPage
      onLogin={handleLogin}
      onRegister={() => setPage("register")}
    />
  );
}

export default App;
