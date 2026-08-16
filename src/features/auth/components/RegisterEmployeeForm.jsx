import useEmployeeStore from '@/features/employee/store/employeeStore';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';

const initialForm = {
  name: '',
  email: '',
  password: '',
  branchId: '',
};

const RegisterEmployeeForm = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const actionRegisterEmployee = useEmployeeStore((state) => state.actionRegisterEmployee);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const shopSlugRef = useRef(shopSlug || 'advancetech');
  const registerRequestRef = useRef(0);

  useEffect(() => {
    const nextSlug = shopSlug || 'advancetech';
    if (shopSlugRef.current === nextSlug) return;
    shopSlugRef.current = nextSlug;
    registerRequestRef.current += 1;
    submittingRef.current = false;
    setSubmitting(false);
    setForm(initialForm);
  }, [shopSlug]);

  const handleChange = (event) => {
    if (submittingRef.current) return;
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || submittingRef.current) return;

    const targetSlug = shopSlug || 'advancetech';
    const requestId = registerRequestRef.current + 1;
    registerRequestRef.current = requestId;
    const payload = {
      name: String(form.name || '').trim(),
      email: String(form.email || '').trim().toLowerCase(),
      password: form.password,
      branchId: form.branchId,
    };

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await actionRegisterEmployee(payload);

      const contextStillOwned =
        registerRequestRef.current === requestId &&
        shopSlugRef.current === targetSlug;
      if (!contextStillOwned) {
        feedback.actionError(
          null,
          'สมัครบัญชีสำเร็จแล้ว แต่บริบทของร้านเปลี่ยนไประหว่างดำเนินการ จึงไม่ได้เปลี่ยนหน้าอัตโนมัติ',
          `auth-employee-register:${targetSlug}:context-changed:error`,
        );
        return;
      }

      feedback.actionSuccess(
        'สมัครบัญชีสำเร็จ กรุณาเข้าสู่ระบบ',
        `auth-employee-register:${targetSlug}:success`,
      );
      setForm(initialForm);
      navigate(`/${targetSlug}/pos/login`);
    } catch (error) {
      if (
        registerRequestRef.current !== requestId ||
        shopSlugRef.current !== targetSlug
      ) return;
      feedback.actionError(
        error,
        'สมัครบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
        `auth-employee-register:${targetSlug}:error`,
      );
    } finally {
      if (
        registerRequestRef.current === requestId &&
        shopSlugRef.current === targetSlug
      ) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  const interactionBusy = submitting || submittingRef.current;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 selection:bg-emerald-600 selection:text-white">
      <div className="w-full shadow-md bg-white p-8 max-w-md rounded-2xl border border-slate-100">
        <h1 className="text-2xl text-center my-4 font-black tracking-tight text-slate-900">Register as Employee</h1>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={interactionBusy} className="space-y-4 disabled:opacity-70">
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
              disabled={interactionBusy}
              className="bg-slate-800 rounded-xl w-full text-white font-black py-2.5 shadow-sm hover:bg-slate-900 active:scale-98 transform transition-all text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
            >
              {interactionBusy ? 'กำลังสมัครบัญชี...' : 'Register'}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployeeForm;
