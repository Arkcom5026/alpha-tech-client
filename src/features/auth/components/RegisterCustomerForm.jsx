import React, { useEffect, useRef, useState } from 'react';
import { feedback } from '@/design-system';
import { useNavigate, useParams } from 'react-router-dom';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const RegisterCustomerForm = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const actionLoginEmployee = useEmployeeStore((state) => state.actionLoginEmployee);

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const shopSlugRef = useRef(shopSlug || 'advancetech');
  const loginRequestRef = useRef(0);

  useEffect(() => {
    const nextSlug = shopSlug || 'advancetech';
    if (shopSlugRef.current === nextSlug) return;
    shopSlugRef.current = nextSlug;
    loginRequestRef.current += 1;
    submittingRef.current = false;
    setSubmitting(false);
  }, [shopSlug]);

  const handleChange = (event) => {
    if (submittingRef.current) return;
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRegisterClick = (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    navigate(`/${shopSlugRef.current}/pos/registerpos`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const targetSlug = shopSlugRef.current;
    const credentialsSnapshot = { ...form };
    const requestId = loginRequestRef.current + 1;
    loginRequestRef.current = requestId;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      await actionLoginEmployee(credentialsSnapshot);
      feedback.actionSuccess(
        'เข้าสู่ระบบเรียบร้อยแล้ว',
        `auth-employee-login:${targetSlug}:success`,
      );

      if (shopSlugRef.current !== targetSlug || loginRequestRef.current !== requestId) {
        feedback.actionError(
          new Error('Login completed after the route context changed.'),
          'เข้าสู่ระบบสำเร็จแล้ว แต่หน้าร้านเปลี่ยนระหว่างดำเนินการ กรุณาไปยังพื้นที่ร้านปัจจุบันต่อ',
          `auth-employee-login:${targetSlug}:context-changed:error`,
        );
        return;
      }

      navigate(`/${targetSlug}/pos`);
    } catch (error) {
      if (shopSlugRef.current !== targetSlug || loginRequestRef.current !== requestId) return;
      feedback.actionError(
        error,
        'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน',
        `auth-employee-login:${targetSlug}:error`,
      );
    } finally {
      if (loginRequestRef.current === requestId && shopSlugRef.current === targetSlug) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  const interactionBusy = submitting || submittingRef.current;

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
              disabled={interactionBusy}
            />
            <input
              placeholder="Password"
              className="border w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-sm transition-all"
              onChange={handleChange}
              name="password"
              type="password"
              value={form.password}
              required
              disabled={interactionBusy}
            />
            <button
              type="submit"
              disabled={interactionBusy}
              className="bg-slate-800 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-slate-900 active:scale-98 transform transition-all text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleRegisterClick}
              disabled={interactionBusy}
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
