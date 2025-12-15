import React, { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import StaffPage from "./StaffPage";
import AttendancePage from "./AttendancePage";

function App() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  // 🔁 Load login from localStorage
  useEffect(() => {
    const savedType = localStorage.getItem("userType");
    const savedId = localStorage.getItem("userId");

    if (savedType && savedId) {
      setUserType(savedType);
      setUserId(savedId);
    }
  }, []);

  // ✅ Called after successful login
  const handleLogin = (type, id) => {
    setUserType(type);
    setUserId(id);
    localStorage.setItem("userType", type);
    localStorage.setItem("userId", id);
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.clear();
    setUserType(null);
    setUserId(null);
  };

  // ======================
  // ROUTING LOGIC
  // ======================
  if (!userType) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userType === "staff") {
    return (
      <>
        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            padding: "6px 12px",
          }}
        >
          Logout
        </button>

        <StaffPage staffName={userId} />
      </>
    );
  }

  if (userType === "student") {
    return (
      <>
        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            padding: "6px 12px",
          }}
        >
          Logout
        </button>

        <AttendancePage />
      </>
    );
  }

  return null;
}

export default App;
