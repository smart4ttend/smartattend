import React, { useState } from "react";
import { supabase } from "./supabase";
import StaffPage from "./StaffPage";
import AttendancePage from "./AttendancePage";

function App() {
  const [role, setRole] = useState("student");
  const [idNo, setIdNo] = useState("");
  const [msg, setMsg] = useState("");

  const [showStaffPage, setShowStaffPage] = useState(false);
  const [staffName, setStaffName] = useState("");

  // =========================
  //          LOGIN
  // =========================
  const login = async () => {
    setMsg("Checking...");

    try {
      const idTrim = (idNo || "").trim().toUpperCase();

      if (!idTrim) {
        setMsg("❌ Sila masukkan ID (contoh: A001 atau L001)");
        return;
      }

      if (role === "student") {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("matric_no", idTrim)
          .limit(1);

        if (error) {
          setMsg("❌ Error: " + error.message);
          return;
        }

        if (data && data.length > 0) {
          setMsg("✅ Student login success: " + data[0].name);
        } else {
          setMsg("❌ Student not found");
        }

      } else {
        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .eq("staff_no", idTrim)
          .limit(1);

        if (error) {
          setMsg("❌ Error: " + error.message);
          return;
        }

        if (data && data.length > 0) {
          setStaffName(data[0].name);
          setShowStaffPage(true);
        } else {
          setMsg("❌ Staff not found");
        }
      }
    } catch (e) {
      setMsg("❌ Unexpected error: " + e.message);
    }
  };

  // =========================
  //   SHOW STAFF PAGE
  // =========================
  if (showStaffPage) {
    return <StaffPage staffName={staffName} />;
  }

  // =========================
  //      LOGIN PAGE UI
  // =========================
  if (window.location.pathname === "/attendance") {
  return <AttendancePage />;
}
  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h2>SmartAttend Login</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          <input
            type="radio"
            name="role"
            value="student"
            checked={role === "student"}
            onChange={() => setRole("student")}
          />{" "}
          Student
        </label>
        <label style={{ marginLeft: 12 }}>
          <input
            type="radio"
            name="role"
            value="staff"
            checked={role === "staff"}
            onChange={() => setRole("staff")}
          />{" "}
          Staff
        </label>
      </div>

      <div>
        <input
          style={{ padding: 8, width: 260 }}
          placeholder={
            role === "student" ? "Matric No (eg. A001)" : "Staff No (eg. L001)"
          }
          value={idNo}
          onChange={(e) => setIdNo(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={login} style={{ padding: "8px 16px" }}>
          Login
        </button>
      </div>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </div>
  );
}

export default App;
