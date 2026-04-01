import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupSemester({ staffName }) {
  const [semester, setSemester] = useState("2025/2026");
  const [courseCode, setCourseCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeCourse, setActiveCourse] = useState(null); // ✅ NEW

  // ===============================
  // FETCH COURSE LIST
  // ===============================
  const fetchCourses = async () => {
    if (!staffName || !semester) return;

    const { data, error } = await supabase
      .from("lecturer_courses")
      .select("*")
      .eq("lecturer_name", staffName)
      .eq("semester", semester)
      .order("course_code", { ascending: true });

    if (!error) setCourses(data || []);
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester, staffName]);

  // ===============================
  // ADD COURSE + CLASSES
  // ===============================
  const addCourse = async () => {
    if (!courseCode.trim()) return alert("Please enter Course Code.");
    if (!semester.trim()) return alert("Please select semester.");
    if (!selectedClasses.trim())
      return alert("Please enter at least one class.");

    try {
      setLoading(true);

      const { error: courseErr } = await supabase
        .from("lecturer_courses")
        .insert([
          {
            lecturer_name: staffName,
            course_code: courseCode.trim().toUpperCase(),
            semester: semester.trim(),
          },
        ]);

      if (courseErr) {
        if (courseErr.code !== "23505") {
          alert("Failed to add course: " + courseErr.message);
          return;
        }
      }

      const classArray = selectedClasses
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const rowsToInsert = classArray.map((cls) => ({
        course_code: courseCode.trim().toUpperCase(),
        class_code: cls,
      }));

      const { error: classErr } = await supabase
        .from("course_classes")
        .upsert(rowsToInsert, {
          onConflict: "course_code,class_code",
        });

      if (classErr) {
        alert("Failed to save class list: " + classErr.message);
        return;
      }

      alert("✅ Course and classes saved successfully!");

      setCourseCode("");
      setSelectedClasses("");

      fetchCourses();
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CSV UPLOAD (LINK TO COURSE)
  // ===============================
  const handleFileUpload = async (e) => {
    if (!activeCourse) {
      alert("Please select a course first");
      return;
    }

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
            course_code: activeCourse, // 🔥 IMPORTANT
          };
        })
        .filter((s) => s.matric_no && s.name);

      const { error } = await supabase.from("students").insert(students);

      if (error) {
        alert("Upload failed: " + error.message);
      } else {
        alert(`Students uploaded for ${activeCourse}`);
      }
    } catch (err) {
      alert("Error reading CSV file");
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 20 }}>
      <h3>Semester Course Setup</h3>

      <p style={{ color: "#555" }}>
        Lecturer registers courses and uploads student list per course.
      </p>

      {/* FORM */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          maxWidth: 520,
        }}
      >
        <label><b>Semester</b></label>
        <input
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          placeholder="2025/2026"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label><b>Course Code</b></label>
        <input
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          placeholder="DTM10333"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label><b>Enter Class(es)</b></label>
        <input
          value={selectedClasses}
          onChange={(e) =>
            setSelectedClasses(e.target.value.toUpperCase())
          }
          placeholder="Example: DUP1A or DUP1A,DUP1B"
          style={{ width: "100%", padding: 8, marginBottom: 5 }}
        />

        <p style={{ fontSize: 12, color: "#777" }}>
          Separate multiple classes with comma (,)
        </p>

        <button
          onClick={addCourse}
          disabled={loading}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 10,
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Course"}
        </button>
      </div>

      {/* COURSE LIST */}
      <div style={{ marginTop: 25 }}>
        <h4>Course List for This Semester</h4>

        {courses.length === 0 ? (
          <p style={{ color: "#777" }}>No courses registered yet.</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              maxWidth: 700,
            }}
          >
            <thead>
              <tr>
                <th>Course</th>
                <th>Semester</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.course_code}</td>
                  <td>{c.semester}</td>
                  <td>
                    <button
                      onClick={() => setActiveCourse(c.course_code)}
                      style={{
                        padding: "6px 12px",
                        background: "#4f8cff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Upload Student List
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* UPLOAD SECTION */}
      {activeCourse && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            maxWidth: 400,
          }}
        >
          <h4>Upload Student List (CSV)</h4>
          <p style={{ fontSize: 13 }}>
            Course: <b>{activeCourse}</b>
          </p>

          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
      )}
    </div>
  );
}

export default SetupSemester;
