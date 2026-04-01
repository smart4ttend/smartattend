import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupSemester({ staffName, onSelectCourse }) {
  const [semester, setSemester] = useState("2025/2026");
  const [courseCode, setCourseCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

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

      if (courseErr && courseErr.code !== "23505") {
        alert("Failed to add course: " + courseErr.message);
        return;
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
  // UI
  // ===============================
  return (
    <div style={{ padding: 20 }}>
      <h3>Semester Course Setup</h3>

      <p style={{ color: "#555" }}>
        Click a course to upload student list.
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

      {/* LIST */}
      <div style={{ marginTop: 25 }}>
        <h4>Course List</h4>

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
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCourse(c)} // 🔥 CLICK HERE
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f1f5ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td>{c.course_code}</td>
                  <td>{c.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SetupSemester;
