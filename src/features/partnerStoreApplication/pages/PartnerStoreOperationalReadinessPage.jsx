import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import {
  certifyPartnerStoreOperationalReadiness,
  getPartnerStoreOperationalReadiness,
} from '../api/partnerStoreOperationalReadinessApi';

const messageFrom = (error) => error?.response?.data?.message || error?.message || 'ตรวจสอบความพร้อมร้านไม่สำเร็จ';

const checkDetail = (check) => {
  if (check?.ready || !check?.details) return '';
  if (check.key === 'serviceMode' && check.details.reason) return check.details.reason;
  return '';
};

export default function PartnerStoreOperationalReadinessPage() {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPartnerStoreOperationalReadiness();
      setData(response.data?.data || null);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">กำลังตรวจสอบความพร้อมร้าน…</main>;
  }

  if (!data?.isPartnerStoreOwner) {
    return <Navigate to={`/${shopSlug}/pos/dashboard`} replace />;
  }

  const application = data.application || {};
  const branch = application.provisionedBranch || {};
  const canonicalSlug = branch.slug || shopSlug;
  const assessment = data.assessment || {};
  const checks = assessment.checks || [];

  if (!data.requiresCertification || data.operationalReadinessStatus === 'CERTIFIED') {
    return <Navigate to={`/${canonicalSlug}/pos/dashboard`} replace />;
  }

  const certify = async () => {
    if (submitting || submittingRef.current) return;

    const readinessConfirmed = Boolean(assessment.allReady);
    const destinationSlug = canonicalSlug;
    const applicationCode = application.applicationCode || destinationSlug;
    if (!readinessConfirmed) {
      setError('ร้านยังมีรายการที่ต้องแก้ไขก่อนรับรองความพร้อม');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      await certifyPartnerStoreOperationalReadiness();
      feedback.actionSuccess(
        'รับรองความพร้อมร้านเรียบร้อยแล้ว',
        `partner-store:readiness:${applicationCode}:certify:success`,
      );
      navigate(`/${destinationSlug}/pos/dashboard`, { replace: true });
    } catch (requestError) {
      const message = messageFrom(requestError);
      await load();
      setError(message);
      feedback.actionError(
        requestError,
        message,
        `partner-store:readiness:${applicationCode}:certify:error`,
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Operational readiness</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">รับรองความพร้อมก่อนเริ่มใช้งานร้าน</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Onboarding เสร็จแล้ว ขั้นตอนนี้ตรวจเงื่อนไขขั้นต่ำของร้านอีกครั้งก่อนเปิดพื้นที่ทำงาน POS เต็มรูปแบบ</p>

        <div className="mt-6 rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-900">{branch.name || application.businessName}</h2>
          <p className="mt-1 text-sm text-slate-500">/{canonicalSlug} · Application {application.applicationCode}</p>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        <div className="mt-6 space-y-3">
          {checks.map((check) => {
            const detail = checkDetail(check);
            return (
              <div key={check.key} className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${check.ready ? 'border-emerald-100 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                <div>
                  <p className="text-sm font-black text-slate-800">{check.label}</p>
                  {detail ? <p className="mt-1 text-xs leading-5 text-amber-800">{detail}</p> : null}
                  <p className="mt-1 text-xs text-slate-500">{check.key}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${check.ready ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                  {check.ready ? 'พร้อม' : 'ต้องแก้ไข'}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={certify}
          disabled={submitting || submittingRef.current || !assessment.allReady}
          className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? 'กำลังรับรอง…' : 'รับรองความพร้อมและเข้าสู่ POS'}
        </button>

        {!assessment.allReady && (
          <p className="mt-4 text-center text-xs font-bold text-amber-700">ยังไม่สามารถรับรองได้จนกว่ารายการขั้นต่ำทั้งหมดจะแสดงว่า “พร้อม”</p>
        )}
        <p className="mt-3 text-center text-xs text-slate-400">การรับรองนี้เป็น Partner Store Operational Certification ไม่ใช่ system health verification ของแพลตฟอร์ม</p>
      </section>
    </main>
  );
}
