import useEmployeeStore from '@/features/employee/store/employeeStore';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';

const RegisterEmployeeForm = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const actionRegisterEmployee = useEmployeeStore((state) => state.actionRegisterEmployee);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branchId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await actionRegisterEmployee(form);
      feedback.actionSuccess('สมัครบัญชีสำเร็จ กรุณาเข้าสู่ระบบ', 'auth-employee-register-success');
      const targetSlug = shopSlug || 'advancetech';
      navigate(`/${targetSlug}/pos/login`);
    } catch (error) {
      feedback.actionError(error, 'สมัครบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'auth-employee-register-error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 selection:bg-emerald-600 selection:text-white">
      <div className="w-full shadow-md bg-white p-8 max-w-md rounded-2xl border border-slate-100">
        <h1 className="text-2xl text-center my-4 font-black tracking-tight text-slate-900">Register as Employee</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              placeholder="Name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-all"
              required
            />
            <input
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-all"
              required
            />
            <input
              placeholder="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-all"
              required
            />
            <input
              placeholder="Branch ID"
              name="branchId"
              type="text"
              value={form.branchId}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-all"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-800 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-slate-900 active:scale-98 transform transition-all text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'กำลังสมัครบัญชี...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployeeForm;
