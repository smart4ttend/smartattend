import React, { useState } from "react";
import { supabase } from "./supabase";

function RegisterPage({ onBack }) {
  const [staffNo, setStaffNo] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!staffNo || !name) {
      alert("Sila lengkapkan semua maklumat");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("staff")
      .insert([
        {
          staff_no: staffNo.trim().toUpperCase(),
          name: name.trim(),
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Gagal daftar: " + error.message);
    } else {
      alert("✅ Pendaftaran berjaya!");
      onBack(); // balik login page
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>Daftar Pensyarah</h2>

      <input
        type="text"
        placeholder="ID Pensyarah (contoh: PTS.50010/1/43)"
        value={staffNo}
        onChange={(e) => setStaffNo(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="Nama Pensyarah"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Menyimpan..." : "Daftar"}
      </button>

      <br /><br />

      <button onClick={onBack}>
        ← Kembali ke Login
      </button>
    </div>
  );
}

export default RegisterPage;
