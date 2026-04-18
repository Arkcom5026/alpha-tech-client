
// src/features/auth/pages/ForgotPasswordPage.jsx

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const requestPasswordResetAction = useAuthStore((state) => state.requestPasswordResetAction);
  const isSubmitting = useAuthStore((state) => state.isRequestPasswordResetLoading || false);
  const requestError = useAuthStore((state) => state.requestPasswordResetError || '');
  const requestSuccessMessage = useAuthStore(
    (state) =>
      state.requestPasswordResetSuccessMessage ||
      'หากข้อมูลของคุณมีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่แล้ว'
  );

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState('');

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(normalizedEmail), [normalizedEmail]);

  const emailErrorMessage = useMemo(() => {
    if (!touched || normalizedEmail.length === 0) return '';
    if (!isEmailValid) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    return '';
  }, [touched, normalizedEmail, isEmailValid]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (localError) {
      setLocalError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    setSubmitted(false);
    setLocalError('');

    if (!normalizedEmail) {
      setLocalError('กรุณากรอกอีเมล');
      return;
    }

    if (!isEmailValid) {
      setLocalError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    try {
      await requestPasswordResetAction({ email: normalizedEmail });
      setSubmitted(true);
    } catch (_error) {
      // ให้ store เป็นผู้จัดการ error หลัก เพื่อคงมาตรฐานของระบบ
    }
  };

  const displayError = localError || requestError;
  const showSuccess = submitted && !displayError;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ลืมรหัสผ่าน</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              กรอกอีเมลที่ใช้เข้าสู่ระบบ แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
            </p>
          </div>

          {displayError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {displayError}
            </div>
          ) : null}

          {showSuccess ? (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {requestSuccessMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setTouched(true)}
                placeholder="name@example.com"
                disabled={isSubmitting}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  emailErrorMessage || localError
                    ? 'border-red-300 bg-red-50/40 focus:border-red-400'
                    : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isSubmitting ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
              />
              {emailErrorMessage ? (
                <p className="mt-2 text-sm text-red-600">{emailErrorMessage}</p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'กำลังส่งลิงก์รีเซ็ตรหัสผ่าน...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
