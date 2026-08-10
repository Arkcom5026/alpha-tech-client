import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldAlert, TriangleAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { getUnifiedTaxReadiness, getUnifiedTaxReadinessErrorMessage } from '../api/unifiedTaxReadinessApi';

const UnifiedTaxReadinessPage = () => {
  const navigate = useNavigate();
  const { shopSlug, taxPeriodId } = useParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      setData(await getUnifiedTaxReadiness({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = getUnifiedTaxReadinessErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const domains = Array.isArray(data?.domains) ? data.domains : [];
  const exceptions = Array.isArray(data?.exceptions) ? data.exceptions : [];
  const blockers = useMemo(() => exceptions.filter((entry) => entry.severity === 'BLOCKER'), [exceptions]);
  const reviews = useMemo(() => exceptions.filter((entry) => entry.severity !== 'BLOCKER'), [exceptions]);

  const goToTarget = (relativePath) => {
    if (!relativePath) return;
    navigate(`/${shopSlug || 'advancetech'}/pos/finance/${relativePath}`);
  };

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="ย้อนกลับ"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Unified Tax Readiness</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">ศูนย์ตรวจความพร้อมภาษี</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {data?.period?.periodCode || taxPeriodId} · {currentBranch?.name || `สาขา #${branchId || '-'}`}</p>
              <p className="mt-1 text-xs text-slate-400">รวม blocker จาก authority เดิม โดยไม่สร้างข้อมูลบัญชีซ้ำ</p>
            </div>
          </div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังรวม Tax Readiness...</div>
      ) : data ? (
        <>
          <section className={`rounded-3xl border p-5 ${data.summary?.readyForAccountant ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-700">Tax Readiness</p>
                <p className="mt-1 text-5xl font-black text-slate-950">{Number(data.summary?.readinessPercent || 0)}%</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">พร้อม {Number(data.summary?.readyDomainCount || 0)} จาก {Number(data.summary?.domainCount || 0)} authority domains</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">{data.summary?.readyForAccountant ? 'READY FOR ACCOUNTANT' : 'ยังมีรายการที่ต้องจัดการ'}</p>
                <p className="mt-1 text-xs text-slate-500">Blocker {Number(data.summary?.blockerCount || 0)} · Review {Number(data.summary?.reviewCount || 0)}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {domains.map((domain) => (
              <button key={domain.key} type="button" onClick={() => goToTarget(domain.target)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${domain.ready ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2"><CheckCircle2 size={17} className={domain.ready ? 'text-emerald-600' : 'text-slate-300'} /><span className="font-black text-slate-900">{domain.label}</span></div>
                <p className={`mt-2 text-sm font-bold ${domain.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{domain.ready ? 'พร้อม' : 'ต้องตรวจสอบ'}</p>
              </button>
            ))}
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800"><ShieldAlert size={18} /><h2 className="font-black">Tax Exceptions</h2></div>
            {blockers.length === 0 ? <p className="mt-3 text-sm font-semibold text-emerald-700">ไม่มี blocker ของรอบนี้</p> : (
              <div className="mt-3 space-y-2">
                {blockers.map((entry) => (
                  <button key={`${entry.code}:${entry.source}`} type="button" onClick={() => goToTarget(entry.target?.relativePath)} className="block w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-left hover:border-amber-400">
                    <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-black text-amber-900">{entry.code}</span><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800">{entry.count} รายการ</span></div>
                    <p className="mt-1 text-sm text-slate-600">{entry.message || entry.source}</p>
                    <p className="mt-1 text-xs font-bold text-blue-700">กดเพื่อไปแก้ที่ต้นทาง</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {reviews.length > 0 && (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-800"><TriangleAlert size={18} /><h2 className="font-black">รายการที่ควร Review</h2></div>
              <div className="mt-3 space-y-2">{reviews.map((entry) => <button key={`${entry.code}:${entry.source}`} type="button" onClick={() => goToTarget(entry.target?.relativePath)} className="block w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-left"><div className="font-black text-blue-900">{entry.code}</div><p className="mt-1 text-sm text-slate-600">{entry.message || entry.source}</p></button>)}</div>
            </section>
          )}
        </>
      ) : null}
    </section>
  );
};

export default UnifiedTaxReadinessPage;
