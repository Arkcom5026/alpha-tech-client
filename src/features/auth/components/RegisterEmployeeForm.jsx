// src/pages/RegisterEmployee.jsx
// 🏛️ Tenant-Safe Registration Platform: (Fixed Parameter Drift, Unified Dynamic Redirect)
import useEmployeeStore from '@/features/employee/store/employeeStore';
import React, { useState } from 'react';
// 🟢 [IMPORT FIXED] ดึง useParams มาเตรียมดักจับค่าบริษัทคั่น URL
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterEmployeeForm = () => {
  // 🟢 [SLUG ACTIVATED] แกะคีย์ชื่อร้านค้าปัจจุบันจากระนาบ Dynamic Router
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const actionRegisterEmployee = useEmployeeStore((state) => state.actionRegisterEmployee);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branchId: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actionRegisterEmployee(form);
      toast.success('Registration successful! Please login.');
      
      // 🟢 [ROUTING FIXED] แปลงท่อส่งหน้าจอหลังสมัครเสร็จ ให้พุ่งตรงดิ่งไปที่หน้าล็อกอินของสาขานั้นๆ ไม่หลงทาง
      const targetSlug = shopSlug || 'advancetech';
      navigate(`/${targetSlug}/pos/login`);
    } catch (err) {
      console.error(err);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 selection:bg-orange-500 selection:text-white">
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
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
              required
            />
            <input
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
              required
            />
            <input
              placeholder="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
              required
            />
            <input
              placeholder="Branch ID"
              name="branchId"
              type="text"
              value={form.branchId}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
              required
            />
            <button
              type="submit"
              className="bg-slate-800 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-slate-900 active:scale-98 transform transition-all text-sm tracking-wide"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployeeForm;