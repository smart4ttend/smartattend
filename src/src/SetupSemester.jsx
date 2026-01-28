import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function SetupSemester({ staffName }) {
  const [semester, setSemester] = useState("2025/2026");
  const [courseCode, setCourseCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Senarai kelas (anda boleh ubah ikut institusi)
  const CLASS_OPTIONS = ["DUP1A", "DUP1B", "DUP1C", "DRT1"];

  // ===============================
  // FETCH COURSE LIST (SEMESTER)
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
    if (!courseCode.trim()) return alert("Sila isi Course Code.");
    if (!semester.trim()) return alert("Sila pilih semester.");
    if (selectedClasses.length === 0)
      return alert("Sila pilih sekurang-kurangnya 1 kelas.");

    try {
      setLoading(true);

      // 1) INSERT lecturer_courses
      const { data: courseRow, error: courseErr } = await supabase
        .from("lecturer_courses")
        .insert([
          {
            lecturer_name: staffName,
            course_code: courseCode.trim().toUpperCase(),
            semester: semester.trim(),
          },
        ])
        .select()
        .single();

      // Jika kursus sudah ada (duplicate)
      if (courseErr) {
        if (courseErr.code === "23505") {
          // sudah wujud, kita teruskan add kelas
        } else {
          alert("Gagal tambah kursus: " + courseErr.message);
          return;
        }
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
        alert("Gagal simpan kelas kursus: " + classErr.message);
        return;
      }

      alert("✅ Kursus & kelas berjaya disimpan!");

      // reset
      setCourseCode("");
      setSelectedClasses([]);

      // refresh list
      fetchCourses();
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE COURSE (SEMESTER)
  // ===============================
  const deleteCourse = async (course) => {
    const confirmDelete = window.confirm(
      `Padam kursus ${course.course_code} untuk semester ${course.semester}?`
    );
    if (!confirmDelete) return;

    setLoading(true);

    // delete lecturer_courses row
    const { error } = await supabase
      .from("lecturer_courses")
      .delete()
      .eq("id", course.id);

    setLoading(false);

    if (error) {
      alert("Gagal padam: " + error.message);
      return;
    }

    fetchCourses();
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ padding: 20 }}>
      <h3>Setup Kursus Semester</h3>
      <p style={{ color: "#555" }}>
        Pensyarah daftar kursus yang diajar & pilih kelas terlibat (sekali awal
        semester).
      </p>

      {/* ===== FORM ===== */}
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

        <label><b>Pilih Kelas Terlibat</b></label>
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
          {loading ? "Saving..." : "Simpan Kursus"}
        </button>
      </div>

      {/* ===== LIST ===== */}
      <div style={{ marginTop: 25 }}>
        <h4>Senarai Kursus Semester Ini</h4>

        {courses.length === 0 ? (
          <p style={{ color: "#777" }}>Tiada kursus didaftarkan lagi.</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", width: "100%", maxWidth: 700 }}
          >
            <thead>
              <tr>
                <th>Kursus</th>
                <th>Semester</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.course_code}</td>
                  <td>{c.semester}</td>
                  <td>
                    <button onClick={() => deleteCourse(c)}>Padam</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p style={{ marginTop: 10, color: "#555", fontSize: 13 }}>
          📌 Nota: Kelas terlibat disimpan dalam table <b>course_classes</b>.
          Pada langkah 2B nanti, Create Session akan auto ambil kelas dari situ.
        </p>
      </div>
    </div>
  );
}

export default SetupSemester;
