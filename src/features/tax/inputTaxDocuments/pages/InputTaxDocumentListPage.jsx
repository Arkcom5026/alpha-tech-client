import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileSearch, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { getInputTaxDocumentErrorMessage, listInputTaxDocuments } from '../api/inputTaxDocumentApi';

const money = (value, currency = 'THB') => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency, minimumFractionDigits: 2,
}).format(Number(value || 0));

const date = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const InputTaxDocumentListPage = () => {
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const result = await listInputTaxDocuments({
        branchId,
        status: status || undefined,
        documentType: documentType || undefined,
        limit: 200,
      });
      setDocuments(Array.isArray(result?.documents) ? result.documents : Array.isArray(result) ? result : []);
    } catch (requestError) {
      const message = getInputTaxDocumentErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, documentType, status]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadDocuments();
  }, [branchId, ensureSelectedBranchAction, loadDocuments]);

  const summary = useMemo(() => documents.reduce((acc, item) => ({
    count: acc.count + 1,
    vat: acc.vat + Number(item.taxAmount || item.vatAmount || 0),
    total: acc.total + Number(item.totalAmount || 0),
  }), { count: 0, vat: 0, total: 0 }), [documents]);

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดรายการเอกสารภาษีซื้อ</span></div></div>;
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><FileSearch size={18} /> TaxDocument Register</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">รายการเอกสารภาษีซื้อ · {currentBranch?.name || branchId}</h1>
            <p className="mt-1 text-sm text-slate-500">ข้อมูลจำกัดเฉพาะสาขาปัจจุบัน และเปิดดูรายละเอียดจาก TaxDocument authority</p>
          </div>
          <button type="button" onClick={loadDocuments} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="space-y-1"><span className="text-xs font-bold text-slate-600">สถานะ</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="">ทุกสถานะ</option><option value="DRAFT">DRAFT</option><option value="REGISTERED">REGISTERED</option><option value="UNDER_REVIEW">UNDER_REVIEW</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option><option value="CANCELLED">CANCELLED</option></select></label>
          <label className="space-y-1"><span className="text-xs font-bold text-slate-600">ประเภทเอกสาร</span><input value={documentType} onChange={(event) => setDocumentType(event.target.value)} placeholder="เช่น TAX_INVOICE" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">จำนวนเอกสาร</p><p className="mt-1 text-2xl font-black">{summary.count}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">VAT รวมในรายการ</p><p className="mt-1 text-2xl font-black">{money(summary.vat)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">ยอดรวมเอกสาร</p><p className="mt-1 text-2xl font-black">{money(summary.total)}</p></div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-5 py-3">เลขที่เอกสาร</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3">วันที่เอกสาร</th><th className="px-5 py-3">เลขผู้เสียภาษีคู่ค้า</th><th className="px-5 py-3 text-right">ยอดก่อน VAT</th><th className="px-5 py-3 text-right">VAT</th><th className="px-5 py-3 text-right">ยอดรวม</th><th className="px-5 py-3">สถานะ</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((item) => (
                <tr key={item.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`${item.id}`)}>
                  <td className="px-5 py-3 font-bold text-blue-700">{item.documentNumber || '-'}</td><td className="px-5 py-3">{item.documentType || '-'}</td><td className="px-5 py-3">{date(item.issuedAt || item.occurredAt)}</td><td className="px-5 py-3">{item.counterpartyTaxId || '-'}</td><td className="px-5 py-3 text-right">{money(item.subtotalAmount, item.currency || 'THB')}</td><td className="px-5 py-3 text-right font-bold">{money(item.taxAmount, item.currency || 'THB')}</td><td className="px-5 py-3 text-right">{money(item.totalAmount, item.currency || 'THB')}</td><td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{item.status || '-'}</span></td>
                </tr>
              ))}
              {!loading && documents.length === 0 && <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-500">ยังไม่มีเอกสารที่ตรงกับตัวกรอง</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default InputTaxDocumentListPage;
