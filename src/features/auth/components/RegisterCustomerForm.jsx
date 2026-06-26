import React, { useState } from "react";
import { toast } from 'react-toastify';
// 🟢 [IMPORT FIXED] ดึง useParams เข้ามาประจำการเพื่อสลักชื่อสาขา/บริษัทคั่น URL
import { useNavigate, useParams } from 'react-router-dom';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const RegisterCustomerForm = () => {
  // 🟢 [SLUG ACTIVATED] เรียกใช้งาน shopSlug จากระนาบ React Router
  const { shopSlug } = useParams();
  const navigate = useNavigate();

  const actionLoginEmployee = useEmployeeStore((state) => state.actionLoginEmployee);
  const employee = useEmployeeStore((state) => state.employee);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = async (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🟢 [ROUTING FIXED] ผูก Dynamic Slug ป้องกันระบบสะบัดหนีกลับเข้าหน้าหลักของยานแม่
  const roleRedirect = (role) => {
    const targetSlug = shopSlug || 'advancetech';
    if (role === 'admin') {
      navigate(`/${targetSlug}/pos`);
    } else {
      navigate(`/${targetSlug}/pos`);
    }
  };

  // 🟢 [ROUTING FIXED] จุดปุ่ม Register วิ่งเข้าเลนย่อย Multi-Tenant ถูกพิกัด
  const handleRegisterClick = (e) => {
    e.preventDefault(); // กันฟอร์มเด้ง Submit อัตโนมัติ
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/registerpos`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLoginEmployee(form);

      const role = res.data.payload.role;            
      const token = res.data.token;         
      roleRedirect(role);

      toast.success("Welcome back");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full shadow-md bg-white p-8 max-w-md rounded-2xl border border-slate-100">
        <h1 className="text-2xl text-center my-4 font-black tracking-tight text-slate-900">Login</h1>
        <form onSubmit={handleSubmit} >
          <div className="space-y-4">
            <input
              placeholder="Email"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium text-sm transition-all"
              onChange={handleChange}
              name="email"
              type="email"
            />

            <input
              placeholder="Password"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium text-sm transition-all"
              onChange={handleChange}
              name="password"
              type="password" 
            />

            <button
              type="submit"
              className="bg-slate-800 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-slate-900 active:scale-98 transform transition-all text-sm tracking-wide"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleRegisterClick}
              className="bg-slate-100 border border-slate-200 text-slate-700 rounded-xl w-full font-bold py-2.5 hover:bg-slate-200 active:scale-98 transform transition-all text-sm"
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