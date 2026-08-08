import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileWarning, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getInputTaxControlCenterErrorMessage,
  getInputTaxControlCenterOverview,
} from '../../inputTaxControlCenter/api/inputTaxControlCenterApi';

const today = new Date();
const toDateInput = (date) => date.toISOString().slice(0, 10);
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const integer = (value) => new Intl.NumberFormat('th-TH').format(Number(value || 0));
const money = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency: 'THB', minimumFractionDigits: 2,
}).format(Number(value || 0));

const issueMeta = [
  ['ไม่มีเลขผู้เสียภาษี Supplier', 'missingSupplierTaxIdCount'],
  ['ไม่มีเลขใบกำกับภาษี', 'missingInvoiceNumberCount'],
  ['ความเสี่ยงเอกสารซ้ำ', 'duplicateInvoiceRiskCount'],
  ['เอกสารทดแทน', 'replacementDocumentCount'],
  ['รายการที่ต้องติดตามทั้งหมด', 'attentionItemCount'],
];

const InputTaxQualityCenterPage = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [periodFrom, setPeriodFrom] = useState(toDateInput(firstDayOfMonth));
  const [periodTo, setPeriodTo] = useState(toDateInput(today));
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  const loadData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      setOverview(await getInputTaxControlCenterOverview({
        branchId, periodView: 'DOCUMENT', periodFrom, periodTo,
      }));
    } catch (requestError) {
      const message = getInputTaxControlCenterErrorMessage(requestError);
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
    loadData();
  }, [branchId, ensureSelectedBranchAction, loadData]);

  const documents = useMemo(() => {
    const rows = Array.isArray(overview?.recentDocuments) ? overview.recentDocuments : [];
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) => [row.documentNumber, row.supplierName, row.counterpartyName, row.documentType]
      .some((value) => String(value || '').toLowerCase().includes(keyword)));
  }, [overview, searchText]);

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดศูนย์ตรวจสอบภาษีซื้อ</span></div></div>;
  }

  const quality = overview?.quality || {};
  const readiness = overview?.filingReadiness || {};

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-700"><ShieldAlert size={18} /> Input Tax Quality Center</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">ศูนย์ตรวจสอบคุณภาพภาษีซื้อ · {currentBranch?.name || branchId}</h1>
            <p className="mt-1 text-sm text-slate-500">ติดตามข้อมูลขาดหาย ความเสี่ยงเอกสารซ้ำ เอกสารทดแทน และสาเหตุที่บล็อกการยื่น</p>
          </div>
          <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="space-y-1"><span className="text-xs font-bold text-slate-600">ตั้งแต่วันที่</span><input type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs font-bold text-slate-600">ถึงวันที่</span><input type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
          <label className="space-y-1"><span className="text-xs font-bold text-slate-600">ค้นหาเอกสารล่าสุด</span><div className="flex items-center rounded-xl border border-slate-300 px-3"><Search size={16} className="text-slate-400" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="เลขที่เอกสาร หรือ Supplier" className="w-full border-0 px-2 py-2.5 text-sm outline-none" /></div></label>
        </div>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {issueMeta.map(([label, key]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-900">{integer(quality[key])}</p></div>)}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><FileWarning size={18} className="text-amber-600" /><h2 className="font-black text-slate-900">สาเหตุที่บล็อกการยื่น</h2></div>
          <div className="mt-4 space-y-3">
            {(readiness.blockerSummary || []).map((item) => <div key={item.code} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"><div><p className="font-bold text-slate-800">{item.code}</p><p className="text-xs text-slate-500">{integer(item.documentCount)} เอกสาร</p></div><p className="font-black text-slate-900">{money(item.vatAmount)}</p></div>)}
            {!loading && !(readiness.blockerSummary || []).length && <p className="py-6 text-center text-sm text-slate-500">ไม่พบสาเหตุที่บล็อกในช่วงนี้</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-black text-blue-950">ขอบเขตการดำเนินการ</h2>
          <p className="mt-2 text-sm text-blue-900">หน้านี้ใช้ข้อมูล Projection จาก Backend สำหรับค้นหาและเจาะไปยังรายละเอียดเอกสารเท่านั้น การยืนยันว่าเป็นเอกสารซ้ำหรือแก้ไขสายเอกสารทดแทนจะเปิดใช้เมื่อ Backend มี HTTP mutation contract อย่างเป็นทางการ</p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5"><h2 className="font-black text-slate-900">เอกสารล่าสุดสำหรับตรวจสอบ</h2><p className="mt-1 text-xs text-slate-500">เปิดรายละเอียดเพื่อดู Source, Reconciliation และ Lifecycle</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-5 py-3">เลขที่เอกสาร</th><th className="px-5 py-3">Supplier</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3 text-right">VAT</th><th className="px-5 py-3">ตรวจสอบ</th></tr></thead><tbody className="divide-y divide-slate-100">
          {documents.map((document) => <tr key={document.id || document.taxDocumentId || document.documentNumber}><td className="px-5 py-3 font-bold text-slate-900">{document.documentNumber || '-'}</td><td className="px-5 py-3 text-slate-700">{document.supplierName || document.counterpartyName || '-'}</td><td className="px-5 py-3 text-slate-600">{document.documentType || '-'}</td><td className="px-5 py-3 text-right font-bold">{money(document.vatAmount)}</td><td className="px-5 py-3">{(document.id || document.taxDocumentId) ? <Link to={`../input-tax-documents/${document.id || document.taxDocumentId}`} className="font-bold text-blue-700 hover:underline">เปิดรายละเอียด</Link> : '-'}</td></tr>)}
          {!loading && documents.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">ยังไม่มีเอกสารสำหรับตรวจสอบในช่วงที่เลือก</td></tr>}
          {loading && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">กำลังโหลดข้อมูล...</td></tr>}
        </tbody></table></div>
      </section>
    </section>
  );
};

export default InputTaxQualityCenterPage;
