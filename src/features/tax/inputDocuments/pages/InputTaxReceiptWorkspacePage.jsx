import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilePlus2, Link2, RefreshCw, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { listTaxDocuments, registerTaxCandidate } from '../../intake/api/taxIntakeApi';
import {
  attachInputTaxDocumentReceiptLinks,
  cancelInputTaxDocumentReceiptLink,
  inputTaxReceiptLinkErrorMessage,
  listInputTaxDocumentReceiptLinks,
  listInputTaxReceiptCandidates,
  reallocateInputTaxDocumentReceiptLink,
} from '../api/inputTaxReceiptLinkApi';
import InputTaxReceiptCandidateTable from '../components/InputTaxReceiptCandidateTable';
import InputTaxReceiptFilters from '../components/InputTaxReceiptFilters';
import InputTaxDocumentLinkPanel from '../components/InputTaxDocumentLinkPanel';
import { formatTaxMoney, receiptIdentity, remainingReceiptAmount } from '../utils/inputTaxReceiptLink';

const initialFilters = {
  keyword: '',
  supplierId: '',
  sourceType: '',
  linkState: 'ACTION_REQUIRED',
  fromDate: '',
  toDate: '',
};

const makeCommandKey = () => globalThis.crypto?.randomUUID?.()
  || `input-tax-link-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const normalizeList = (result, key) => (
  Array.isArray(result?.[key]) ? result[key] : Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : []
);

const InputTaxReceiptWorkspacePage = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [filters, setFilters] = useState(initialFilters);
  const [receipts, setReceipts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLinkId, setBusyLinkId] = useState(null);
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [invoice, setInvoice] = useState({
    documentNumber: '', issuedAt: '', subtotalAmount: '', taxAmount: '', totalAmount: '',
  });

  const selectedReceipts = useMemo(() => Object.values(selected), [selected]);
  const selectedSupplierId = selectedReceipts[0]?.supplierId || null;
  const selectedSupplier = selectedReceipts[0] || null;
  const eligibleDocuments = useMemo(() => {
    if (!selectedSupplierId) return documents;
    return documents.filter((document) => (
      Number(document?.snapshot?.supplierId || 0) === Number(selectedSupplierId)
    ));
  }, [documents, selectedSupplierId]);
  const suppliers = useMemo(() => {
    const unique = new Map();
    receipts.forEach((receipt) => unique.set(Number(receipt.supplierId), {
      id: Number(receipt.supplierId), name: receipt.supplierName,
    }));
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }, [receipts]);

  const loadReceipts = useCallback(async (criteria = filters) => {
    if (!branchId) return;
    setLoading(true);
    try {
      const result = await listInputTaxReceiptCandidates({ branchId, ...criteria });
      setReceipts(normalizeList(result, 'receipts'));
      setSelected({});
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [branchId, filters]);

  const loadDocuments = useCallback(async () => {
    if (!branchId) return;
    try {
      const result = await listTaxDocuments({
        branchId, documentType: 'INPUT_TAX_INVOICE', limit: 200,
      });
      setDocuments(normalizeList(result, 'documents').filter((document) => (
        ['DRAFT', 'VALIDATED', 'ISSUED'].includes(String(document.status).toUpperCase())
      )));
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    }
  }, [branchId]);

  const loadLinks = useCallback(async (taxDocumentId = selectedDocumentId) => {
    if (!branchId || !taxDocumentId) {
      setLinks([]);
      return;
    }
    try {
      const result = await listInputTaxDocumentReceiptLinks({ branchId, taxDocumentId });
      setLinks(normalizeList(result, 'links'));
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    }
  }, [branchId, selectedDocumentId]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadReceipts();
    loadDocuments();
  }, [branchId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const changeFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const resetFilters = () => {
    setFilters(initialFilters);
    loadReceipts(initialFilters);
  };

  const toggleReceipt = (receipt) => {
    const key = receiptIdentity(receipt);
    setSelected((current) => {
      if (current[key]) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      const first = Object.values(current)[0];
      if (first && Number(first.supplierId) !== Number(receipt.supplierId)) {
        toast.warning('กรุณาเลือกใบรับสินค้าจาก Supplier เดียวกัน');
        return current;
      }
      return {
        ...current,
        [key]: {
          ...receipt,
          allocatedSubtotal: 0,
          allocatedVatAmount: 0,
          allocatedTotalAmount: remainingReceiptAmount(receipt),
        },
      };
    });
  };

  useEffect(() => {
    if (!selectedDocumentId || !selectedSupplierId) return;
    const stillEligible = eligibleDocuments.some((document) => String(document.id) === String(selectedDocumentId));
    if (!stillEligible) setSelectedDocumentId('');
  }, [eligibleDocuments, selectedDocumentId, selectedSupplierId]);

  const changeAllocation = (key, field, value) => setSelected((current) => ({
    ...current,
    [key]: { ...current[key], [field]: value },
  }));

  const attachSelected = async () => {
    if (!selectedDocumentId) return toast.warning('กรุณาเลือกใบกำกับภาษี');
    if (selectedReceipts.length === 0) return toast.warning('กรุณาเลือกใบรับสินค้าอย่างน้อย 1 ใบ');
    setSubmitting(true);
    try {
      await attachInputTaxDocumentReceiptLinks({
        branchId,
        taxDocumentId: selectedDocumentId,
        commandKey: makeCommandKey(),
        receiptReferences: selectedReceipts,
      });
      toast.success(`ผูกใบรับสินค้า ${selectedReceipts.length} ใบแล้ว`);
      setSelected({});
      await Promise.all([loadReceipts(), loadLinks()]);
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const createInputTaxDocument = async (event) => {
    event.preventDefault();
    if (!selectedSupplier) return toast.warning('เลือกใบรับสินค้าของ Supplier ก่อนสร้างใบกำกับภาษี');
    if (!invoice.documentNumber || !invoice.issuedAt) return toast.warning('กรุณากรอกเลขที่และวันที่ใบกำกับภาษี');
    setSubmitting(true);
    try {
      const result = await registerTaxCandidate({
        branchId,
        sourceType: 'MANUAL',
        sourceId: `INPUT_TAX:${selectedSupplier.supplierId}:${invoice.documentNumber}:${invoice.issuedAt}`,
        sourceDocumentNo: invoice.documentNumber,
        occurredAt: invoice.issuedAt,
        documentType: 'INPUT_TAX_INVOICE',
        snapshot: {
          supplierId: Number(selectedSupplier.supplierId),
          counterpartyName: selectedSupplier.supplierName,
          issuerTaxId: selectedSupplier.supplierTaxId || null,
          issuedAt: invoice.issuedAt,
          subtotalAmount: Number(invoice.subtotalAmount || 0),
          taxAmount: Number(invoice.taxAmount || 0),
          totalAmount: Number(invoice.totalAmount || 0),
          currency: 'THB',
        },
      });
      const document = result?.document;
      await loadDocuments();
      if (document?.id) setSelectedDocumentId(String(document.id));
      setShowCreateDocument(false);
      toast.success('สร้างใบกำกับภาษีซื้อแล้ว');
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const reallocate = async (link, allocation) => {
    setBusyLinkId(link.id);
    try {
      await reallocateInputTaxDocumentReceiptLink({
        branchId, taxDocumentId: selectedDocumentId, linkId: link.id, allocation,
        reason: 'ปรับยอดจัดสรรจากหน้าติดตามเอกสารภาษีซื้อ',
      });
      toast.success('ปรับยอดจัดสรรแล้ว');
      await Promise.all([loadLinks(), loadReceipts()]);
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setBusyLinkId(null);
    }
  };

  const cancelLink = async (link, reason) => {
    setBusyLinkId(link.id);
    try {
      await cancelInputTaxDocumentReceiptLink({
        branchId, taxDocumentId: selectedDocumentId, linkId: link.id, reason,
      });
      toast.success('ยกเลิกการผูกแล้ว โดยยังเก็บประวัติไว้');
      await Promise.all([loadLinks(), loadReceipts()]);
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setBusyLinkId(null);
    }
  };

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex items-center gap-3"><TriangleAlert /><span className="font-bold">กรุณาเลือกสาขาก่อนเปิดหน้าติดตามเอกสารภาษีซื้อ</span></div></div>;
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2 text-sm font-bold text-blue-700"><Link2 size={18} /> Input Tax Receipt Links</div><h1 className="mt-1 text-2xl font-black text-slate-900">ติดตามและผูกใบรับสินค้า</h1><p className="mt-1 text-sm text-slate-500">รวมใบรับตาม PO และรับด่วนเข้ากับใบกำกับภาษีซื้อ โดยแก้ไขหรือยกเลิกภายหลังได้</p></div>
        <button type="button" onClick={() => { loadReceipts(); loadDocuments(); loadLinks(); }} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่</button>
      </header>

      <InputTaxReceiptFilters filters={filters} suppliers={suppliers} loading={loading} onChange={changeFilter} onSearch={loadReceipts} onReset={resetFilters} />

      <div className="grid gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label><span className="mb-1 block text-xs font-bold text-slate-600">ใบกำกับภาษีซื้อที่จะผูก</span><select value={selectedDocumentId} onChange={(event) => setSelectedDocumentId(event.target.value)} className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm"><option value="">เลือกใบกำกับภาษี</option>{eligibleDocuments.map((document) => <option key={document.id} value={document.id}>{document.documentNumber} · {formatTaxMoney(document.totalAmount)} · {document.status}</option>)}</select></label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowCreateDocument((value) => !value)} disabled={!selectedSupplierId} className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-40"><FilePlus2 size={17} /> สร้างใบกำกับภาษี</button>
          <button type="button" onClick={attachSelected} disabled={submitting || !selectedDocumentId || selectedReceipts.length === 0} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">ผูก {selectedReceipts.length} ใบ</button>
        </div>
      </div>

      {showCreateDocument && (
        <form onSubmit={createInputTaxDocument} className="grid gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-5"><p className="font-black text-slate-900">สร้างใบกำกับภาษีซื้อของ {selectedSupplier?.supplierName}</p><p className="text-xs text-slate-500">สร้างเอกสารก่อน แล้วเลือกผูกใบรับสินค้าที่เลือกไว้</p></div>
          <label><span className="mb-1 block text-xs font-bold">เลขที่ใบกำกับภาษี</span><input required value={invoice.documentNumber} onChange={(event) => setInvoice((current) => ({ ...current, documentNumber: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          <label><span className="mb-1 block text-xs font-bold">วันที่ใบกำกับภาษี</span><input required type="date" value={invoice.issuedAt} onChange={(event) => setInvoice((current) => ({ ...current, issuedAt: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          {[
            ['subtotalAmount', 'มูลค่าก่อน VAT'],
            ['taxAmount', 'VAT'],
            ['totalAmount', 'ยอดรวม'],
          ].map(([field, label]) => <label key={field}><span className="mb-1 block text-xs font-bold">{label}</span><input type="number" min="0" step="0.01" value={invoice[field]} onChange={(event) => setInvoice((current) => ({ ...current, [field]: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-right" /></label>)}
          <div className="xl:col-span-5"><button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">บันทึกใบกำกับภาษีซื้อ</button></div>
        </form>
      )}

      <InputTaxReceiptCandidateTable receipts={receipts} selected={selected} selectedSupplierId={selectedSupplierId} loading={loading} onToggle={toggleReceipt} onAllocationChange={changeAllocation} />
      {selectedDocumentId && <InputTaxDocumentLinkPanel links={links} busyLinkId={busyLinkId} onReallocate={reallocate} onCancel={cancelLink} />}
    </section>
  );
};

export default InputTaxReceiptWorkspacePage;
