import React, { useState } from "react";
import { supabase } from "./supabase";
import AttendanceList from "./AttendanceList";
import SetupSemester from "./SetupSemester";

const container = {
  padding: "30px",
  background: "#f4f6fb",
  minHeight: "100vh",
  fontFamily: "Segoe UI, sans-serif",
};

const header = {
  fontSize: "22px",
  fontWeight: "600",
  marginBottom: "25px",
};

const cardGrid = {
  display: "flex",
  gap: "20px",
  marginBottom: "25px",
};

const statCard = {
  flex: 1,
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const cardTitle = {
  fontSize: "13px",
  color: "#777",
};

const cardValue = {
  fontSize: "24px",
  fontWeight: "600",
};

function StaffPage({ staffName, logout }) {
  const [page, setPage] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [course, setCourse] = useState("");
  const [classStart, setClassStart] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [classEnd, setClassEnd] = useState("");

  const [sessionId, setSessionId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedClass, setSelectedClass] = useState("");

  const isStudentId = /^[A-Z]\d{3,}$/.test(staffName);
  if (!staffName || isStudentId) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Access Denied</h3>
        <p>This page is for staff only.</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  // ===============================
  // DELETE BY CLASS
  // ===============================
  const deleteByClass = async () => {
    if (!selectedClass) {
      alert("Please enter class name");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete all students from ${selectedClass}?`
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("class_name", selectedClass);

    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Students deleted successfully!");
    }
  };

  // ===============================
  // CREATE SESSION
  // ===============================
  const createSession = async () => {
    if (!course || !classStart || !lateAfter || !classEnd) {
      alert("Please fill in all fields.");
      return;
    }

    const classStartAt = new Date(classStart);
    const lateAfterAt = new Date(lateAfter);
    const expiresAtValue = new Date(classEnd);

    if (!(classStartAt < lateAfterAt && lateAfterAt < expiresAtValue)) {
      alert("Invalid time sequence.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([
          {
            course_code: course.trim().toUpperCase(),
            class_start_at: classStartAt,
            late_after: lateAfterAt,
            expires_at: expiresAtValue,
            class_name: "DUP1A",
          },
        ])
        .select()
        .single();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSessionId(data.id);
    } catch (err) {
      setErrorMsg("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      {/* DASHBOARD */}
      {page === "dashboard" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={header}>🎓 SmartAttend Lecturer Dashboard</div>
            <button onClick={logout}>Logout</button>
          </div>

          <h2>Welcome, {staffName}</h2>

          <div style={cardGrid}>
            <div style={statCard} onClick={() => setPage("setup")}>
              <div style={cardTitle}>Profile</div>
              <div style={cardValue}>Setup Semester</div>
            </div>

            <div style={statCard} onClick={() => setPage("session")}>
              <div style={cardTitle}>Create Session</div>
              <div style={cardValue}>Generate QR</div>
            </div>

            <div style={statCard} onClick={() => setPage("attendance")}>
              <div style={cardTitle}>Attendance Record</div>
              <div style={cardValue}>View Records</div>
            </div>
          </div>
        </>
      )}

      {/* SETUP */}
      {page === "setup" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Home</button>

          <h1>Setup Semester</h1>

          <SetupSemester
  staffName={staffName}
  onSelectCourse={(course) => {
    setSelectedCourse(course); // ✅ GUNA INI
    setPage("upload");
  }}
/>
        </div>
      )}

      {/* 🔥 UPLOAD PAGE */}
      {page === "upload" && (
        <div>
          <button onClick={() => setPage("setup")}>
            ← Back to Courses
          </button>

          <h2>Upload Student List</h2>

          <p><b>Course:</b> {selectedCourse?.course_code}</p>
          <p><b>Semester:</b> {selectedCourse?.semester}</p>

          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              try {
                const text = await file.text();
                const rows = text.split("\n").slice(1);

                const students = rows
                  .map((row) => {
                    const [matric_no, name, class_name] = row.split(",");
                    return {
                      matric_no: matric_no?.trim(),
                      name: name?.trim(),
                      class_name: class_name?.trim(),
                      course_code: selectedCourse.course_code,
                    };
                  })
                  .filter((s) => s.matric_no && s.name);

                const { error } = await supabase
                  .from("students")
                  .insert(students);

                if (error) {
                  alert("Upload failed: " + error.message);
                } else {
                  alert("✅ Student list uploaded!");
                }
              } catch (err) {
                alert("Error reading file");
              }
            }}
          />
        </div>
      )}

      {/* SESSION */}
      {page === "session" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>Create Attendance Session</h3>

          <input
            placeholder="Course Code"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />

          <input type="datetime-local" value={classStart} onChange={(e) => setClassStart(e.target.value)} />
          <input type="datetime-local" value={lateAfter} onChange={(e) => setLateAfter(e.target.value)} />
          <input type="datetime-local" value={classEnd} onChange={(e) => setClassEnd(e.target.value)} />

          <button onClick={createSession}>
            {loading ? "Creating..." : "Create Session"}
          </button>

          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          {sessionId && <AttendanceList sessionId={sessionId} />}
        </div>
      )}

      {/* ATTENDANCE */}
      {page === "attendance" && (
        <div>
          <button onClick={() => setPage("dashboard")}>← Back</button>

          <h3>Attendance Record</h3>

          <input
            placeholder="Enter Class"
            value={selectedClass}
            onChange={(e) =>
              setSelectedClass(e.target.value.toUpperCase())
            }
          />

          <button onClick={deleteByClass}>
            Delete by Class
          </button>

          {sessionId ? (
            <AttendanceList sessionId={sessionId} />
          ) : (
            <p>No active session.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StaffPage;
