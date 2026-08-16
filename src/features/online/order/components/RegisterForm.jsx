import { registerUser } from "@/features/auth/api/authApi";
import { feedback } from '@/design-system';
import React, { useRef, useState } from "react";

const RegisterForm = ({ setShowRegister }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleChange = (e) => {
    if (submittingRef.current) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const payloadSnapshot = {
      name: form.name,
      phone: form.phone || null,
      email: form.email,
      password: form.password,
    };

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await registerUser(payloadSnapshot);
      feedback.actionSuccess(
        'สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ',
        'online-register:create:success',
      );
      setShowRegister(false);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
      feedback.actionError(
        err,
        'สมัครสมาชิกไม่สำเร็จ',
        'online-register:create:error',
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
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
          disabled={submitting}
          className="w-full border px-3 py-2 rounded disabled:opacity-60"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="เบอร์โทรศัพท์ (ไม่จำเป็น)"
          value={form.phone}
          onChange={handleChange}
          disabled={submitting}
          className="w-full border px-3 py-2 rounded disabled:opacity-60"
        />
        <input
          type="email"
          name="email"
          placeholder="อีเมลของคุณ"
          value={form.email}
          onChange={handleChange}
          disabled={submitting}
          className="w-full border px-3 py-2 rounded disabled:opacity-60"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          value={form.password}
          onChange={handleChange}
          disabled={submitting}
          className="w-full border px-3 py-2 rounded disabled:opacity-60"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="ยืนยันรหัสผ่าน"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={submitting}
          className="w-full border px-3 py-2 rounded disabled:opacity-60"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        มีบัญชีแล้วใช่ไหม?
        <button
          type="button"
          disabled={submitting}
          className="ml-1 text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            if (!submittingRef.current) setShowRegister(false);
          }}
        >
          เข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
