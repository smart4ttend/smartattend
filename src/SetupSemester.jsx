import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupSemester({ staffName }) {
  const [semester, setSemester] = useState("2025/2026");
  const [courseCode, setCourseCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Class list (customize based on institution)
  const CLASS_OPTIONS = ["DUP1A", "DUP1B", "DUP1C", "DRT1"];

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
    if (selectedClasses.length === 0)
      return alert("Please select at least one class.");

    try {
      setLoading(true);

      // 1) INSERT lecturer_courses
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
        // if duplicate, continue to save classes
      }

      // 2) INSERT course_classes (upsert)
      const rowsToInsert = selectedClasses.map((cls) => ({
        course_code: courseCode.trim().toUpperCase(),
        class_code: cls,
      }));

      const { error: classErr } = await supabase
        .from("course_classes")
        .upsert(rowsToInsert, { onConflict: "course_code,class_code" });

      if (classErr) {
        alert("Failed to save class list: " + classErr.message);
        return;
      }

      alert("✅ Course and classes saved successfully!");

      // reset
      setCourseCode("");
      setSelectedClasses([]);

      // refresh
      fetchCourses();
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE COURSE
  // ===============================
  const deleteCourse = async (course) => {
    const confirmDelete = window.confirm(
      `Delete course ${course.course_code} for semester ${course.semester}?`
    );
    if (!confirmDelete) return;

    setLoading(true);

    const { error } = await supabase
      .from("lecturer_courses")
      .delete()
      .eq("id", course.id);

    setLoading(false);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    fetchCourses();
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 20 }}>
      <h3>Semester Course Setup</h3>
      <p style={{ color: "#555" }}>
        Lecturer registers courses taught and selects involved classes (once at
        the beginning of the semester).
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
        <label>
          <b>Semester</b>
        </label>
        <input
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          placeholder="2025/2026"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>
          <b>Course Code</b>
        </label>
        <input
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          placeholder="DTM10333"
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>
          <b>Select Classes</b>
        </label>
        <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
          {CLASS_OPTIONS.map((cls) => (
            <label key={cls} style={{ display: "flex", gap: 8 }}>
              <input
                type="checkbox"
                checked={selectedClasses.includes(cls)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedClasses([...selectedClasses, cls]);
                  } else {
                    setSelectedClasses(
                      selectedClasses.filter((c) => c !== cls)
                    );
                  }
                }}
              />
              {cls}
            </label>
          ))}
        </div>

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
        <h4>Course List for This Semester</h4>

        {courses.length === 0 ? (
          <p style={{ color: "#777" }}>No courses registered yet.</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", width: "100%", maxWidth: 700 }}
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
                    <button onClick={() => deleteCourse(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p style={{ marginTop: 10, color: "#555", fontSize: 13 }}>
        </p>
      </div>
    </div>
  );
}

export default SetupSemester;
