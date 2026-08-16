import React, { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { claimPartnerStoreActivation } from '../api/partnerStoreActivationApi';

const messageFrom = (error) => error?.response?.data?.message || error?.message || 'เปิดใช้งานบัญชีไม่สำเร็จ';

export default function PartnerStoreActivationPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activated, setActivated] = useState(null);
  const submittingRef = useRef(false);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting || submittingRef.current) return;

    const activationToken = token;
    const nextPassword = password;
    const nextConfirmPassword = confirmPassword;

    setError('');
    if (!activationToken) return setError('ลิงก์เปิดใช้งานไม่สมบูรณ์');
    if (nextPassword.length < 8) return setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    if (nextPassword !== nextConfirmPassword) return setError('ยืนยันรหัสผ่านไม่ตรงกัน');

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await claimPartnerStoreActivation({
        token: activationToken,
        password: nextPassword,
      });
      setActivated(response.data?.data || {});
      setPassword('');
      setConfirmPassword('');
      feedback.actionSuccess(
        'เปิดใช้งานบัญชีเจ้าของร้านเรียบร้อยแล้ว',
        'partner-store:activation:success',
      );
    } catch (requestError) {
      const message = messageFrom(requestError);
      setError(message);
      feedback.actionError(
        requestError,
        message,
        'partner-store:activation:error',
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (activated) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <section className="mx-auto max-w-lg rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Activation complete</p>
          <h1 className="mt-3 text-2xl font-black text-slate-900">เปิดใช้งานบัญชีเจ้าของร้านสำเร็จ</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">บัญชีของคุณพร้อมเข้าสู่ระบบแล้ว การเข้าสู่ระบบครั้งแรกและการตั้งค่าร้านจะดำเนินการในขั้นตอนถัดไป</p>
          <Link to="/login" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white">ไปหน้าเข้าสู่ระบบ</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-lg rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Merchant activation</p>
        <h1 className="mt-3 text-2xl font-black text-slate-900">ตั้งรหัสผ่านสำหรับบัญชีเจ้าของร้าน</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">ลิงก์นี้ใช้ได้ครั้งเดียวและมีวันหมดอายุ ระบบจะสร้างบัญชีเจ้าของร้านเมื่อคุณยืนยันรหัสผ่านสำเร็จเท่านั้น</p>

        {!token && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">ไม่พบโทเคนเปิดใช้งานในลิงก์นี้</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            รหัสผ่านใหม่
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                if (!submittingRef.current) setPassword(event.target.value);
              }}
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            ยืนยันรหัสผ่าน
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                if (!submittingRef.current) setConfirmPassword(event.target.value);
              }}
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
            />
          </label>
          <button type="submit" disabled={submitting || !token} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">
            {submitting ? 'กำลังเปิดใช้งาน…' : 'เปิดใช้งานบัญชี'}
          </button>
        </form>
      </section>
    </main>
  );
}
