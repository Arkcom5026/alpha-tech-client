
// src/features/auth/pages/ResetPasswordPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';


const MIN_PASSWORD_LENGTH = 6;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetPasswordAction = useAuthStore((state) => state.resetPasswordAction);
  const clearResetPasswordStateAction = useAuthStore((state) => state.clearResetPasswordStateAction);
  const isSubmitting = useAuthStore((state) => state.isResetPasswordLoading || false);
  const resetError = useAuthStore((state) => state.resetPasswordError || '');
  const resetSuccessMessage = useAuthStore(
    (state) => state.resetPasswordSuccessMessage || 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง'
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState('');

  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);
  const isTokenMissing = token.length === 0;

  useEffect(() => {
    return () => {
      if (typeof clearResetPasswordStateAction === 'function') {
        clearResetPasswordStateAction();
      }
    };
  }, [clearResetPasswordStateAction]);

  const passwordErrorMessage = useMemo(() => {
    if (!touchedPassword || password.length === 0) return '';
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `รหัสผ่านต้องมีความยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`;
    }
    return '';
  }, [touchedPassword, password]);

  const confirmPasswordErrorMessage = useMemo(() => {
    if (!touchedConfirmPassword || confirmPassword.length === 0) return '';
    if (confirmPassword !== password) {
      return 'ยืนยันรหัสผ่านไม่ตรงกัน';
    }
    return '';
  }, [touchedConfirmPassword, confirmPassword, password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouchedPassword(true);
    setTouchedConfirmPassword(true);
    setSubmitted(false);
    setLocalError('');

    if (isTokenMissing) {
      setLocalError('ลิงก์นี้ไม่ถูกต้องหรือไม่ครบถ้วน กรุณาขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง');
      return;
    }

    if (!password || !confirmPassword) {
      setLocalError('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`รหัสผ่านต้องมีความยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('ยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      await resetPasswordAction({
        token,
        password,
        confirmPassword,
      });

      setSubmitted(true);

      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (_error) {
      // ให้ store เป็นผู้จัดการ error หลักตามมาตรฐานของระบบ
    }
  };

  const displayError = localError || resetError;
  const showSuccess = submitted && !displayError;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ และใช้รหัสผ่านใหม่นี้ในการเข้าสู่ระบบครั้งถัดไป
            </p>
          </div>

          {isTokenMissing ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              ลิงก์นี้ไม่ถูกต้องหรือไม่ครบถ้วน กรุณาขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง
            </div>
          ) : null}

          {displayError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {displayError}
            </div>
          ) : null}

          {showSuccess ? (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resetSuccessMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                รหัสผ่านใหม่
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (localError) setLocalError('');
                }}
                onBlur={() => setTouchedPassword(true)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                disabled={isSubmitting || isTokenMissing}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  passwordErrorMessage || localError
                    ? 'border-red-300 bg-red-50/40 focus:border-red-400'
                    : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isSubmitting || isTokenMissing ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
              />
              {passwordErrorMessage ? (
                <p className="mt-2 text-sm text-red-600">{passwordErrorMessage}</p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  เพื่อความปลอดภัย ควรใช้รหัสผ่านที่เดายาก และไม่ซ้ำกับรหัสผ่านเดิม
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (localError) setLocalError('');
                }}
                onBlur={() => setTouchedConfirmPassword(true)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                disabled={isSubmitting || isTokenMissing}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  confirmPasswordErrorMessage || localError
                    ? 'border-red-300 bg-red-50/40 focus:border-red-400'
                    : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isSubmitting || isTokenMissing ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
              />
              {confirmPasswordErrorMessage ? (
                <p className="mt-2 text-sm text-red-600">{confirmPasswordErrorMessage}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isTokenMissing}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'กำลังบันทึกรหัสผ่านใหม่...' : 'บันทึกรหัสผ่านใหม่'}
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

export default ResetPasswordPage;
