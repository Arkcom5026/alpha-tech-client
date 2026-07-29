import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarRange,
  FileCheck2,
  FileClock,
  FileWarning,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getInputTaxControlCenterErrorMessage,
  getInputTaxControlCenterOverview,
} from '../../inputTaxControlCenter/api/inputTaxControlCenterApi';
import {
  getTaxPeriodErrorMessage,
  getTaxPeriodSummary,
} from '../../periods/api/taxPeriodApi';

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const toDateInput = (date) => date.toISOString().slice(0, 10);

const formatMoney = (value, currency = 'THB') => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency,
  minimumFractionDigits: 2,
}).format(Number(value || 0));

const formatNumber = (value) => new Intl.NumberFormat('th-TH').format(Number(value || 0));

const STATUS_META = {
  OPEN: { label: 'เปิดใช้งาน', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  REOPENED: { label: 'เปิดใหม่', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  CLOSED: { label: 'ปิดรอบแล้ว', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  LOCKED: { label: 'ล็อกแล้ว', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  SUBMITTED: { label: 'ยื่นแล้ว', className: 'border-violet-200 bg-violet-50 text-violet-700' },
};

const StatCard = ({ label, count, amount, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(count)}</p>
        <p className="mt-1 text-xs font-bold text-slate-600">{amount}</p>
      </div>
      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Icon size={20} /></div>
    </div>
  </div>
);

const InputTaxFilingWorkspacePage = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [periodFrom, setPeriodFrom] = useState(toDateInput(monthStart));
  const [periodTo, setPeriodTo] = useState(toDateInput(today));
  const [overview, setOverview] = useState(null);
  const [periodSummary, setPeriodSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadWorkspace = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const [overviewResult, periodResult] = await Promise.all([
        getInputTaxControlCenterOverview({
          branchId,
          periodView: 'CLAIM',
          periodFrom,
          periodTo,
        }),
        getTaxPeriodSummary({ branchId, referenceDate: periodTo }),
      ]);
      setOverview(overviewResult || null);
      setPeriodSummary(periodResult || null);
    } catch (requestError) {
      const message = requestError?.response?.config?.url?.includes('/tax/periods')
        ? getTaxPeriodErrorMessage(requestError)
        : getInputTaxControlCenterErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, periodFrom, periodTo]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadWorkspace();
  }, [branchId, ensureSelectedBranchAction, loadWorkspace]);

  const readiness = overview?.filingReadiness || {};
  const currency = overview?.scope?.currency || 'THB';
  const currentPeriod = periodSummary?.currentPeriod || null;
  const periodStatus = currentPeriod?.status || null;
  const mutationBlocked = ['CLOSED', 'LOCKED', 'SUBMITTED'].includes(periodStatus);
  const blockerSummary = Array.isArray(readiness.blockerSummary) ? readiness.blockerSummary : [];
  const recentDocuments = useMemo(
    () => (Array.isArray(overview?.recentDocuments) ? overview.recentDocuments : []),
    [overview],
  );

  if (!branchId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดพื้นที่จัดเตรียมยื่นภาษีซื้อ</span></div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><ShieldCheck size={18} /> Input Tax Filing Workspace</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">พื้นที่จัดเตรียมยื่นภาษีซื้อ · {currentBranch?.name || branchId}</h1>
            <p className="mt-1 text-sm text-slate-500">อ่าน Filing Readiness และ Period Authority จาก Backend โดยตรง</p>
          </div>
          <button type="button" onClick={loadWorkspace} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-bold text-slate-600">ตั้งแต่วันที่</span>
            <input type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-slate-600">ถึงวันที่</span>
            <input type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
        </div>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Period Authority</p>
            <h2 className="mt-1 text-lg font-black text-slate-900">{currentPeriod?.periodCode || 'ไม่พบรอบภาษีปัจจุบัน'}</h2>
          </div>
          {periodStatus && (
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${STATUS_META[periodStatus]?.className || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {STATUS_META[periodStatus]?.label || periodStatus}
            </span>
          )}
        </div>
        <div className={`mt-4 rounded-xl border p-4 text-sm font-semibold ${mutationBlocked ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {mutationBlocked
            ? 'รอบภาษีนี้ปิดหรือล็อกแล้ว ระบบ Backend จะปฏิเสธการเพิ่มหรือนำเอกสารออกจากชุดยื่นภาษี'
            : 'รอบภาษีนี้ยังแก้ไขได้ตาม authority ของ Backend'}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="พร้อมเลือก" count={readiness.readyDocumentCount} amount={formatMoney(readiness.readyVatAmount, currency)} icon={FileCheck2} />
        <StatCard label="เลือกแล้ว" count={readiness.selectedDocumentCount} amount={formatMoney(readiness.selectedVatAmount, currency)} icon={FileClock} />
        <StatCard label="ยื่นแล้ว" count={readiness.filedDocumentCount} amount={formatMoney(readiness.filedVatAmount, currency)} icon={FileCheck2} />
        <StatCard label="เลื่อนใช้สิทธิ์" count={readiness.deferredDocumentCount} amount={formatMoney(readiness.deferredVatAmount, currency)} icon={CalendarRange} />
        <StatCard label="ถูกบล็อก" count={readiness.blockedDocumentCount} amount={formatMoney(readiness.blockedVatAmount, currency)} icon={FileWarning} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-slate-900">สาเหตุที่บล็อกการยื่น</h2>
          <div className="mt-4 space-y-3">
            {blockerSummary.map((item, index) => (
              <div key={item.code || item.reason || index} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
                <span className="text-sm font-semibold text-slate-700">{item.label || item.reason || item.code || 'ไม่ระบุสาเหตุ'}</span>
                <span className="text-sm font-black text-slate-900">{formatNumber(item.documentCount ?? item.count)}</span>
              </div>
            ))}
            {!loading && blockerSummary.length === 0 && <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">ไม่พบสาเหตุที่บล็อกในช่วงเวลานี้</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-black text-blue-900">สถานะความพร้อมของ Filing Mutation</h2>
          <p className="mt-2 text-sm leading-6 text-blue-800">
            หน้านี้แสดงข้อมูล readiness และ period authority ที่ Backend รับรองแล้ว ส่วนคำสั่งเลือกเอกสารออกจากชุดยื่นและยืนยันยื่นจริงจะเปิดใช้งานเมื่อ HTTP route/controller ของ Filing Service ถูกเผยแพร่เป็น Contract อย่างเป็นทางการ เพื่อไม่สร้าง business rule ปลอมใน Browser
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-black text-slate-900">เอกสารล่าสุดในมุมมองเลือกใช้สิทธิ์</h2>
          <p className="mt-1 text-xs text-slate-500">ใช้สำหรับตรวจสอบรายการก่อนเข้าสู่ชุดยื่นภาษี</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr><th className="px-5 py-3">เลขที่เอกสาร</th><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">สถานะ</th><th className="px-5 py-3 text-right">VAT</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDocuments.map((document) => (
                <tr key={document.id || document.taxDocumentId || document.documentNumber}>
                  <td className="px-5 py-3 font-bold text-slate-900">{document.documentNumber || '-'}</td>
                  <td className="px-5 py-3 text-slate-700">{document.supplierName || document.counterpartyName || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{document.filingStatus || document.status || '-'}</td>
                  <td className="px-5 py-3 text-right font-bold">{formatMoney(document.vatAmount, currency)}</td>
                </tr>
              ))}
              {!loading && recentDocuments.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">ไม่พบเอกสารในช่วงเวลานี้</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default InputTaxFilingWorkspacePage;
