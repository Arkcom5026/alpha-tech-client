import React, { useState } from 'react';
import { feedback } from '@/design-system';
import { useNavigate, useParams } from 'react-router-dom';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const RegisterCustomerForm = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const actionLoginEmployee = useEmployeeStore((state) => state.actionLoginEmployee);

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const roleRedirect = () => {
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos`);
  };

  const handleRegisterClick = (event) => {
    event.preventDefault();
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/registerpos`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await actionLoginEmployee(form);
      feedback.actionSuccess('เข้าสู่ระบบเรียบร้อยแล้ว', 'auth-employee-login-success');
      roleRedirect();
    } catch (error) {
      feedback.actionError(error, 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน', 'auth-employee-login-error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full shadow-md bg-white p-8 max-w-md rounded-2xl border border-slate-100">
        <h1 className="text-2xl text-center my-4 font-black tracking-tight text-slate-900">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              placeholder="Email"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-sm transition-all"
              onChange={handleChange}
              name="email"
              type="email"
              value={form.email}
              required
            />
            <input
              placeholder="Password"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-sm transition-all"
              onChange={handleChange}
              name="password"
              type="password"
              value={form.password}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-800 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-slate-900 active:scale-98 transform transition-all text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleRegisterClick}
              disabled={submitting}
              className="bg-slate-100 border border-slate-200 text-slate-700 rounded-xl w-full font-bold py-2.5 hover:bg-slate-200 active:scale-98 transform transition-all text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCustomerForm;
