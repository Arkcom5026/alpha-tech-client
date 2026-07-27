import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileSearch, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getTaxDocumentDetail,
  getTaxIntakeErrorMessage,
  listTaxCandidates,
  listTaxDocuments,
} from '../api/taxIntakeApi';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
};

const formatMoney = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency: 'THB', minimumFractionDigits: 2,
}).format(Number(value || 0));

const badgeClass = (status) => ({
  DRAFT: 'bg-slate-100 text-slate-700',
  REGISTERED: 'bg-blue-50 text-blue-700',
  MAPPED: 'bg-amber-50 text-amber-700',
  CONVERTED: 'bg-emerald-50 text-emerald-700',
  UNDER_REVIEW: 'bg-violet-50 text-violet-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}[status] || 'bg-slate-100 text-slate-600');

const TaxIntakeWorkspacePage = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [candidates, setCandidates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateStatus, setCandidateStatus] = useState('');
  const [documentStatus, setDocumentStatus] = useState('');

  const loadData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const [candidateResult, documentResult] = await Promise.all([
        listTaxCandidates({ branchId, status: candidateStatus || undefined }),
        listTaxDocuments({ branchId, status: documentStatus || undefined }),
      ]);
      setCandidates(Array.isArray(candidateResult?.candidates) ? candidateResult.candidates : Array.isArray(candidateResult) ? candidateResult : []);
      setDocuments(Array.isArray(documentResult?.documents) ? documentResult.documents : Array.isArray(documentResult) ? documentResult : []);
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, candidateStatus, documentStatus]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadData();
  }, [branchId, ensureSelectedBranchAction, loadData]);

  useEffect(() => {
    setSelectedDocument(null);
  }, [branchId]);

  const openDocument = async (document) => {
    try {
      const detail = await getTaxDocumentDetail({ branchId, taxDocumentId: document.id });
      setSelectedDocument(detail);
    } catch (requestError) {
      toast.error(getTaxIntakeErrorMessage(requestError));
    }
  };

  const totals = useMemo(() => ({ candidates: candidates.length, documents: documents.length }), [candidates, documents]);

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดพื้นที่รับเอกสารภาษี</span></div></div>;
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><ShieldCheck size={18} /> Tax Intake Workspace</div>
          <h1 className="mt-1 text-2xl font-black text-slate-900">เอกสารภาษีของสาขา {currentBranch?.name || branchId}</h1>
          <p className="mt-1 text-sm text-slate-500">ติดตาม Candidate → Tax Document → Lifecycle จากข้อมูลต้นทาง</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium text-slate-500">Business Document Candidates</p><p className="mt-1 text-2xl font-black text-slate-900">{totals.candidates}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-medium text-slate-500">Tax Documents</p><p className="mt-1 text-2xl font-black text-slate-900">{totals.documents}</p></div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div><h2 className="font-black text-slate-900">Candidates</h2><p className="text-xs text-slate-500">เอกสารธุรกิจที่เข้าสู่ระบบภาษี</p></div>
            <select value={candidateStatus} onChange={(e) => setCandidateStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">ทุกสถานะ</option><option value="REGISTERED">REGISTERED</option><option value="MAPPED">MAPPED</option><option value="CONVERTED">CONVERTED</option><option value="REJECTED">REJECTED</option></select>
          </div>
          <div className="divide-y divide-slate-100">
            {candidates.map((item) => <div key={item.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{item.sourceDocumentNo || `${item.sourceType}-${item.sourceId}`}</p><p className="mt-1 text-xs text-slate-500">{item.sourceType} · {formatDateTime(item.occurredAt)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(item.status)}`}>{item.status}</span></div></div>)}
            {!loading && candidates.length === 0 && <div className="p-8 text-center text-sm text-slate-500">ยังไม่มี Candidate</div>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div><h2 className="font-black text-slate-900">Tax Documents</h2><p className="text-xs text-slate-500">เอกสารภาษีที่สร้างจาก Candidate</p></div>
            <select value={documentStatus} onChange={(e) => setDocumentStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">ทุกสถานะ</option><option value="DRAFT">DRAFT</option><option value="REGISTERED">REGISTERED</option><option value="UNDER_REVIEW">UNDER_REVIEW</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option><option value="CANCELLED">CANCELLED</option></select>
          </div>
          <div className="divide-y divide-slate-100">
            {documents.map((item) => <button type="button" key={item.id} onClick={() => openDocument(item)} className="block w-full p-4 text-left hover:bg-slate-50"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{item.documentNumber}</p><p className="mt-1 text-xs text-slate-500">{item.documentType} · {formatMoney(item.totalAmount)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(item.status)}`}>{item.status}</span></div></button>)}
            {!loading && documents.length === 0 && <div className="p-8 text-center text-sm text-slate-500">ยังไม่มี Tax Document</div>}
          </div>
        </div>
      </div>

      {selectedDocument && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><FileSearch size={18} className="text-blue-600" /><h2 className="font-black text-slate-900">รายละเอียดเอกสาร {selectedDocument.document?.documentNumber || selectedDocument.documentNumber}</h2></div><pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(selectedDocument, null, 2)}</pre></div>}
    </section>
  );
};

export default TaxIntakeWorkspacePage;
