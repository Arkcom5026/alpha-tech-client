import { registerUser } from "@/features/auth/api/authApi";
import React, { useState } from "react";


const RegisterForm = ({ setShowRegister }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const payload = {
        name: form.name,
        phone: form.phone || null,
        email: form.email,
        password: form.password,
      };
      await registerUser(payload);
      setSuccess(true);
      setShowRegister(false); // ✅ กลับไปหน้า Login หลังสมัครเสร็จ
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-center text-lg font-semibold">สมัครสมาชิก</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="ชื่อของคุณ"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="เบอร์โทรศัพท์ (ไม่จำเป็น)"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="อีเมลของคุณ"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="ยืนยันรหัสผ่าน"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">สมัครสมาชิกสำเร็จ</p>}

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded"
        >
          สมัครสมาชิก
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        มีบัญชีแล้วใช่ไหม?
        <button
          type="button"
          className="ml-1 text-blue-600 hover:underline"
          onClick={() => setShowRegister(false)}
        >
          เข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
