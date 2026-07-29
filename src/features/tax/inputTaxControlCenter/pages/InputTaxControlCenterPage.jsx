import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarRange,
  FileCheck2,
  FileWarning,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getInputTaxControlCenterErrorMessage,
  getInputTaxControlCenterOverview,
  INPUT_TAX_PERIOD_VIEWS,
} from '../api/inputTaxControlCenterApi';

const today = new Date();
const toDateInput = (date) => date.toISOString().slice(0, 10);
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const money = (value, currency = 'THB') => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency,
  minimumFractionDigits: 2,
}).format(Number(value || 0));

const integer = (value) => new Intl.NumberFormat('th-TH').format(Number(value || 0));

const periodViewLabels = {
  DOCUMENT: 'วันที่เอกสาร',
  RECEIVED: 'วันที่รับเอกสาร',
  CLAIM: 'วันที่เลือกใช้สิทธิ์',
  FILED: 'วันที่ยื่นจริง',
};

const StatCard = ({ title, value, helper, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
        {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
      </div>
      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Icon size={20} /></div>
    </div>
  </div>
);

const SummaryPanel = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="font-black text-slate-900">{title}</h2>
    <div className="mt-4 space-y-3">{children}</div>
  </section>
);

const SummaryRow = ({ label, value, emphasis = false }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
    <span className="text-sm text-slate-600">{label}</span>
    <span className={`text-sm ${emphasis ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>{value}</span>
  </div>
);

const InputTaxControlCenterPage = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [periodView, setPeriodView] = useState('DOCUMENT');
  const [periodFrom, setPeriodFrom] = useState(toDateInput(firstDayOfMonth));
  const [periodTo, setPeriodTo] = useState(toDateInput(today));
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const result = await getInputTaxControlCenterOverview({ branchId, periodView, periodFrom, periodTo });
      setOverview(result);
    } catch (requestError) {
      const message = getInputTaxControlCenterErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, periodFrom, periodTo, periodView]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadOverview();
  }, [branchId, ensureSelectedBranchAction, loadOverview]);

  const currency = overview?.scope?.currency || 'THB';
  const headline = overview?.headline || {};
  const comparison = overview?.comparison || {};
  const quality = overview?.quality || {};
  const readiness = overview?.filingReadiness || {};
  const reconciliation = overview?.reconciliation || {};
  const recentDocuments = Array.isArray(overview?.recentDocuments) ? overview.recentDocuments : [];

  const comparisonText = useMemo(() => {
    const percent = comparison.claimableVatAmountChangePercent;
    if (percent === null || percent === undefined) return 'ยังไม่มีฐานเปรียบเทียบ';
    const numeric = Number(percent || 0);
    return `${numeric > 0 ? '+' : ''}${numeric.toFixed(2)}% จากช่วงก่อนหน้า`;
  }, [comparison.claimableVatAmountChangePercent]);

  if (!branchId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดศูนย์ควบคุมภาษีซื้อ</span></div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><ShieldCheck size={18} /> Input Tax Control Center</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">ศูนย์ควบคุมภาษีซื้อ · {currentBranch?.name || branchId}</h1>
            <p className="mt-1 text-sm text-slate-500">ภาพรวม TaxDocument, คุณภาพข้อมูล, การกระทบยอด และความพร้อมยื่นภาษี</p>
          </div>
          <button type="button" onClick={loadOverview} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-bold text-slate-600">มุมมองช่วงเวลา</span>
            <select value={periodView} onChange={(event) => setPeriodView(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold">
              {INPUT_TAX_PERIOD_VIEWS.map((view) => <option key={view} value={view}>{periodViewLabels[view]}</option>)}
            </select>
          </label>
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="เอกสารทั้งหมด" value={integer(headline.documentCount)} helper={`ยังมีผล ${integer(headline.activeDocumentCount)} · ยกเลิก ${integer(headline.cancelledDocumentCount)}`} icon={CalendarRange} />
        <StatCard title="VAT ทั้งหมด" value={money(headline.vatAmount, currency)} helper={comparisonText} icon={WalletCards} />
        <StatCard title="VAT ใช้สิทธิ์ได้" value={money(headline.claimableVatAmount, currency)} helper={`พร้อมยื่น ${integer(readiness.readyDocumentCount)} เอกสาร`} icon={FileCheck2} />
        <StatCard title="VAT ถูกบล็อก" value={money(headline.blockedVatAmount, currency)} helper={`${integer(readiness.blockedDocumentCount)} เอกสารต้องตรวจสอบ`} icon={FileWarning} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SummaryPanel title="การกระทบยอด">
          <SummaryRow label="ผูกครบ" value={integer(reconciliation.fullyLinkedDocumentCount)} />
          <SummaryRow label="ผูกบางส่วน" value={integer(reconciliation.partiallyLinkedDocumentCount)} />
          <SummaryRow label="ยังไม่ผูก Source" value={integer(reconciliation.unlinkedDocumentCount)} />
          <SummaryRow label="ยอดไม่ตรง" value={integer(reconciliation.allocationMismatchDocumentCount)} emphasis />
          <SummaryRow label="VAT ยังไม่กระทบยอด" value={money(reconciliation.unreconciledVatAmount, currency)} />
        </SummaryPanel>

        <SummaryPanel title="คุณภาพข้อมูล">
          <SummaryRow label="ไม่มีเลขผู้เสียภาษี Supplier" value={integer(quality.missingSupplierTaxIdCount)} />
          <SummaryRow label="ไม่มีเลขใบกำกับภาษี" value={integer(quality.missingInvoiceNumberCount)} />
          <SummaryRow label="ความเสี่ยงเอกสารซ้ำ" value={integer(quality.duplicateInvoiceRiskCount)} />
          <SummaryRow label="เอกสารทดแทน" value={integer(quality.replacementDocumentCount)} />
          <SummaryRow label="ต้องติดตามทั้งหมด" value={integer(quality.attentionItemCount)} emphasis />
        </SummaryPanel>

        <SummaryPanel title="ความพร้อมยื่นภาษี">
          <SummaryRow label="พร้อม" value={`${integer(readiness.readyDocumentCount)} · ${money(readiness.readyVatAmount, currency)}`} />
          <SummaryRow label="เลือกแล้ว" value={`${integer(readiness.selectedDocumentCount)} · ${money(readiness.selectedVatAmount, currency)}`} />
          <SummaryRow label="ยื่นแล้ว" value={`${integer(readiness.filedDocumentCount)} · ${money(readiness.filedVatAmount, currency)}`} />
          <SummaryRow label="เลื่อนใช้สิทธิ์" value={`${integer(readiness.deferredDocumentCount)} · ${money(readiness.deferredVatAmount, currency)}`} />
          <SummaryRow label="ถูกบล็อก" value={`${integer(readiness.blockedDocumentCount)} · ${money(readiness.blockedVatAmount, currency)}`} emphasis />
        </SummaryPanel>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-black text-slate-900">เอกสารล่าสุด</h2>
          <p className="mt-1 text-xs text-slate-500">รายการล่าสุดตามมุมมอง {periodViewLabels[periodView]}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr><th className="px-5 py-3">เลขที่เอกสาร</th><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3 text-right">VAT</th><th className="px-5 py-3">สถานะ</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDocuments.map((document) => (
                <tr key={document.id || document.taxDocumentId || document.documentNumber}>
                  <td className="px-5 py-3 font-bold text-slate-900">{document.documentNumber || '-'}</td>
                  <td className="px-5 py-3 text-slate-700">{document.supplierName || document.counterpartyName || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{document.documentType || '-'}</td>
                  <td className="px-5 py-3 text-right font-bold">{money(document.vatAmount, currency)}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{document.filingStatus || document.status || '-'}</span></td>
                </tr>
              ))}
              {!loading && recentDocuments.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">ยังไม่มีเอกสารภาษีซื้อในช่วงที่เลือก</td></tr>}
              {loading && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">กำลังโหลดข้อมูล...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default InputTaxControlCenterPage;
