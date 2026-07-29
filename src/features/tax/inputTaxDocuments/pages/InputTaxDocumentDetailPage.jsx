import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, FileText, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { getInputTaxDocumentDetail, getInputTaxDocumentErrorMessage } from '../api/inputTaxDocumentApi';

const money = (value, currency = 'THB') => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency, minimumFractionDigits: 2,
}).format(Number(value || 0));

const dateTime = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(parsed);
};

const DetailRow = ({ label, value }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[190px_1fr]">
    <span className="text-sm font-semibold text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-800 break-words">{value ?? '-'}</span>
  </div>
);

const InputTaxDocumentDetailPage = () => {
  const navigate = useNavigate();
  const { taxDocumentId } = useParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    if (!branchId || !taxDocumentId) return;
    setLoading(true);
    setError('');
    try {
      const result = await getInputTaxDocumentDetail({ branchId, taxDocumentId });
      setDocument(result);
    } catch (requestError) {
      const message = getInputTaxDocumentErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxDocumentId]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadDetail();
  }, [branchId, ensureSelectedBranchAction, loadDetail]);

  const reconciliation = document?.inputTaxReconciliation || {};
  const events = Array.isArray(document?.lifecycleEvents) ? document.lifecycleEvents : [];
  const candidate = document?.candidate || null;
  const currency = document?.currency || 'THB';
  const sourceLabel = useMemo(() => {
    if (!candidate) return '-';
    return candidate.sourceDocumentNo || `${candidate.sourceType || 'SOURCE'}-${candidate.sourceId || candidate.id || '-'}`;
  }, [candidate]);

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดรายละเอียดเอกสารภาษีซื้อ</span></div></div>;
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button type="button" onClick={() => navigate('..')} className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"><ArrowLeft size={17} /> กลับไปรายการ</button>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><FileText size={18} /> TaxDocument Detail</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">{document?.documentNumber || `เอกสาร #${taxDocumentId}`}</h1>
            <p className="mt-1 text-sm text-slate-500">รายละเอียดภายใต้อำนาจของสาขา {currentBranch?.name || branchId}</p>
          </div>
          <button type="button" onClick={loadDetail} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่</button>
        </div>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {!error && document && (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-900">ข้อมูลเอกสาร</h2>
              <div className="mt-3"><DetailRow label="ประเภท" value={document.documentType} /><DetailRow label="สถานะ" value={document.status} /><DetailRow label="วันที่เอกสาร" value={dateTime(document.issuedAt)} /><DetailRow label="วันที่เกิดรายการ" value={dateTime(document.occurredAt)} /><DetailRow label="เลขผู้เสียภาษีคู่ค้า" value={document.counterpartyTaxId} /><DetailRow label="Source" value={sourceLabel} /></div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-900">มูลค่าเอกสาร</h2>
              <div className="mt-3"><DetailRow label="ยอดก่อน VAT" value={money(document.subtotalAmount, currency)} /><DetailRow label="VAT" value={money(document.taxAmount, currency)} /><DetailRow label="ยอดรวม" value={money(document.totalAmount, currency)} /><DetailRow label="สกุลเงิน" value={currency} /></div>
            </section>
          </div>

          <section className={`rounded-2xl border p-5 shadow-sm ${reconciliation.canApprove ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">การกระทบยอด Input Tax</h2><p className="mt-1 text-sm text-slate-600">{reconciliation.canApprove ? 'ยอดตรงกัน พร้อมดำเนินการตาม Lifecycle' : 'ยังมีเงื่อนไขที่ต้องตรวจสอบก่อนอนุมัติ'}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">{reconciliation.status || '-'}</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl bg-white/80 p-3"><p className="text-xs text-slate-500">ใบรับสินค้าที่ผูก</p><p className="mt-1 text-xl font-black">{Number(reconciliation.receiptCount || 0)}</p></div><div className="rounded-xl bg-white/80 p-3"><p className="text-xs text-slate-500">VAT เอกสาร</p><p className="mt-1 text-xl font-black">{money(reconciliation.documentAmount?.vatAmount, currency)}</p></div><div className="rounded-xl bg-white/80 p-3"><p className="text-xs text-slate-500">VAT ที่ผูก</p><p className="mt-1 text-xl font-black">{money(reconciliation.allocatedAmount?.vatAmount, currency)}</p></div><div className="rounded-xl bg-white/80 p-3"><p className="text-xs text-slate-500">ผลต่าง VAT</p><p className="mt-1 text-xl font-black">{money(reconciliation.variance?.vatAmount, currency)}</p></div></div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-900">ประวัติ Lifecycle</h2>
            <div className="mt-4 space-y-3">
              {events.map((event) => <div key={event.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-slate-800">{event.fromStatus || 'CREATED'} → {event.toStatus}</p><p className="text-xs text-slate-500">{dateTime(event.occurredAt)}</p></div>{event.reason && <p className="mt-2 text-sm text-slate-600">เหตุผล: {event.reason}</p>}</div>)}
              {events.length === 0 && <div className="py-8 text-center text-sm text-slate-500">ยังไม่มีประวัติ Lifecycle</div>}
            </div>
          </section>
        </>
      )}

      {loading && !document && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">กำลังโหลดรายละเอียดเอกสาร...</div>}
    </section>
  );
};

export default InputTaxDocumentDetailPage;
