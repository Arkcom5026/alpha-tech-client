import React, { useState } from "react";
import { feedback } from '@/design-system/feedback';
import { useNavigate, useParams } from 'react-router-dom';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const RegisterCustomerForm = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();

  const actionLoginEmployee = useEmployeeStore((state) => state.actionLoginEmployee);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const roleRedirect = () => {
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos`);
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/registerpos`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLoginEmployee(form);
      roleRedirect(res?.data?.payload?.role);
      feedback.success("เข้าสู่ระบบสำเร็จ");
    } catch (err) {
      console.error(err);
      feedback.error(err?.response?.data?.message || err?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 selection:bg-emerald-500 selection:text-white">
      <div className="w-full shadow-md bg-white p-8 max-w-md rounded-2xl border border-slate-100">
        <h1 className="text-2xl text-center my-4 font-black tracking-tight text-slate-900">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              placeholder="Email"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm transition-all"
              onChange={handleChange}
              name="email"
              type="email"
            />

            <input
              placeholder="Password"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm transition-all"
              onChange={handleChange}
              name="password"
              type="password"
            />

            <button
              type="submit"
              className="bg-emerald-700 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-98 transform transition-all text-sm tracking-wide"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleRegisterClick}
              className="bg-slate-100 border border-slate-200 text-slate-700 rounded-xl w-full font-bold py-2.5 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-98 transform transition-all text-sm"
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