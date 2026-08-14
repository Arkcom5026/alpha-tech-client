import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  completePartnerStoreOnboarding,
  getPartnerStoreOnboarding,
} from '../api/partnerStoreOnboardingApi';

const messageFrom = (error) => error?.response?.data?.message || error?.message || 'ดำเนินการเริ่มใช้งานร้านไม่สำเร็จ';

export default function PartnerStoreOnboardingPage() {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmStoreProfile, setConfirmStoreProfile] = useState(false);
  const [confirmOwnerContact, setConfirmOwnerContact] = useState(false);

  useEffect(() => {
    let active = true;
    getPartnerStoreOnboarding()
      .then((response) => {
        if (!active) return;
        setData(response.data?.data || null);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(messageFrom(requestError));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">กำลังเตรียมการเริ่มใช้งานร้าน…</main>;
  }

  if (!data?.isPartnerStoreOwner) {
    return <Navigate to={`/${shopSlug}/pos/dashboard`} replace />;
  }

  const application = data.application || {};
  const branch = application.provisionedBranch || {};
  const canonicalSlug = branch.slug || shopSlug;

  if (!data.requiresOnboarding || data.onboardingStatus === 'COMPLETED') {
    return <Navigate to={`/${canonicalSlug}/pos/dashboard`} replace />;
  }

  const submit = async () => {
    if (!confirmStoreProfile || !confirmOwnerContact) {
      setError('กรุณาตรวจสอบและยืนยันข้อมูลทั้งสองส่วนก่อนเริ่มใช้งานร้าน');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await completePartnerStoreOnboarding({ confirmStoreProfile, confirmOwnerContact });
      navigate(`/${canonicalSlug}/pos/dashboard`, { replace: true });
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">First login onboarding</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">ยืนยันข้อมูลก่อนเริ่มใช้งานร้าน</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">บัญชีเจ้าของร้านเปิดใช้งานแล้ว ขั้นตอนนี้ใช้ตรวจสอบว่าบัญชีและร้านที่กำลังเข้าใช้งานตรงกัน ก่อนเข้าสู่พื้นที่ทำงานของร้าน</p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">ร้าน</p>
            <h2 className="mt-2 text-lg font-black text-slate-900">{branch.name || application.businessName}</h2>
            <p className="mt-2 text-sm text-slate-600"><b>Branch:</b> {branch.id || application.provisionedBranchId}</p>
            <p className="mt-1 text-sm text-slate-600"><b>URL ร้าน:</b> /{canonicalSlug}</p>
            <p className="mt-1 text-sm text-slate-600"><b>ที่อยู่:</b> {branch.address || application.businessAddress || '-'}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">เจ้าของร้าน</p>
            <h2 className="mt-2 text-lg font-black text-slate-900">{application.contactName}</h2>
            <p className="mt-2 text-sm text-slate-600"><b>อีเมล:</b> {application.contactEmail || '-'}</p>
            <p className="mt-1 text-sm text-slate-600"><b>โทรศัพท์:</b> {application.contactPhone || '-'}</p>
            <p className="mt-1 text-sm text-slate-600"><b>Application:</b> {application.applicationCode}</p>
          </section>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-emerald-50 p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={confirmStoreProfile} onChange={(event) => setConfirmStoreProfile(event.target.checked)} className="mt-1" />
            <span>ฉันตรวจสอบแล้วว่าร้านและสาขาที่แสดงเป็นร้านที่ฉันกำลังจะเข้าใช้งาน</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={confirmOwnerContact} onChange={(event) => setConfirmOwnerContact(event.target.checked)} className="mt-1" />
            <span>ฉันตรวจสอบชื่อ อีเมล และเบอร์โทรศัพท์ของบัญชีเจ้าของร้านแล้ว</span>
          </label>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting || !confirmStoreProfile || !confirmOwnerContact}
          className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? 'กำลังบันทึก…' : 'ยืนยันและเข้าสู่ระบบร้าน'}
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">การผ่านขั้นตอนนี้หมายถึง First Login Onboarding เสร็จสมบูรณ์ ยังไม่ใช่ Operational Certification ของร้าน</p>
      </section>
    </main>
  );
}
