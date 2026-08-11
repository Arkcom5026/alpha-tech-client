import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { isTaxDocumentMutable } from '../../policies/taxDocumentMutability';
import { listTaxDocuments, registerTaxCandidate } from '../../intake/api/taxIntakeApi';
import {
  attachInputTaxDocumentReceiptLinks,
  cancelInputTaxDocumentReceiptLink,
  inputTaxReceiptLinkErrorMessage,
  listInputTaxDocumentReceiptLinks,
  listInputTaxReceiptCandidates,
  reallocateInputTaxDocumentReceiptLink,
} from '../api/inputTaxReceiptLinkApi';
import {
  projectDocumentAllocation,
  receiptAllocationPrefill,
  receiptIdentity,
} from '../utils/inputTaxReceiptLink';

export const inputTaxReceiptInitialFilters = Object.freeze({
  keyword: '',
  supplierId: '',
  sourceType: '',
  linkState: 'ACTION_REQUIRED',
  fromDate: '',
  toDate: '',
});

const initialInvoice = Object.freeze({
  documentNumber: '',
  issuedAt: '',
  subtotalAmount: '',
  taxAmount: '',
  totalAmount: '',
});

const makeCommandKey = () => globalThis.crypto?.randomUUID?.()
  || `input-tax-link-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const normalizeList = (result, key) => (
  Array.isArray(result?.[key])
    ? result[key]
    : Array.isArray(result?.items)
      ? result.items
      : Array.isArray(result)
        ? result
        : []
);

const useInputTaxReceiptWorkspaceController = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [filters, setFilters] = useState(inputTaxReceiptInitialFilters);
  const [receipts, setReceipts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLinkId, setBusyLinkId] = useState(null);
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [invoice, setInvoice] = useState({ ...initialInvoice });

  const selectedReceipts = useMemo(() => Object.values(selected), [selected]);
  const selectedSupplierId = selectedReceipts[0]?.supplierId || null;
  const selectedSupplier = selectedReceipts[0] || null;
  const selectedDocument = useMemo(() => documents.find(
    (document) => String(document.id) === String(selectedDocumentId),
  ) || null, [documents, selectedDocumentId]);
  const selectedDocumentMutable = selectedDocument
    ? isTaxDocumentMutable(selectedDocument.status)
    : false;
  const allocationProjection = useMemo(() => (
    selectedDocument
      ? projectDocumentAllocation({
        document: selectedDocument,
        activeLinks: links,
        pendingReceipts: selectedReceipts,
      })
      : null
  ), [links, selectedDocument, selectedReceipts]);
  const eligibleDocuments = useMemo(() => {
    const mutableDocuments = documents.filter((document) => isTaxDocumentMutable(document.status));
    if (!selectedSupplierId) return mutableDocuments;
    return mutableDocuments.filter((document) => (
      Number(document?.supplierId || document?.snapshot?.supplierId || 0) === Number(selectedSupplierId)
    ));
  }, [documents, selectedSupplierId]);
  const suppliers = useMemo(() => {
    const unique = new Map();
    receipts.forEach((receipt) => unique.set(Number(receipt.supplierId), {
      id: Number(receipt.supplierId),
      name: receipt.supplierName,
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
        branchId,
        documentType: 'INPUT_TAX_INVOICE',
        limit: 200,
      });
      setDocuments(normalizeList(result, 'documents'));
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    }
  }, [branchId]);

  const loadLinks = useCallback(async (taxDocumentId = selectedDocumentId) => {
    if (!branchId || !taxDocumentId) {
      setLinks([]);
      setLinksLoading(false);
      return;
    }
    setLinks([]);
    setLinksLoading(true);
    try {
      const result = await listInputTaxDocumentReceiptLinks({ branchId, taxDocumentId });
      setLinks(normalizeList(result, 'links'));
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setLinksLoading(false);
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

  useEffect(() => {
    if (!selectedDocumentId || !selectedSupplierId) return;
    const stillEligible = eligibleDocuments.some(
      (document) => String(document.id) === String(selectedDocumentId),
    );
    if (!stillEligible) setSelectedDocumentId('');
  }, [eligibleDocuments, selectedDocumentId, selectedSupplierId]);

  const changeFilter = useCallback((field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(inputTaxReceiptInitialFilters);
    loadReceipts(inputTaxReceiptInitialFilters);
  }, [loadReceipts]);

  const toggleReceipt = useCallback((receipt) => {
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
          ...receiptAllocationPrefill(receipt),
        },
      };
    });
  }, []);

  const changeAllocation = useCallback((key, field, value) => {
    setSelected((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }));
  }, []);

  const selectExistingDocument = useCallback((documentId) => {
    setShowCreateDocument(false);
    setSelectedDocumentId(String(documentId || ''));
  }, []);

  const attachSelected = useCallback(async () => {
    if (!selectedDocumentId) return toast.warning('กรุณาเลือกใบกำกับภาษี');
    if (!selectedDocumentMutable) return toast.warning('เอกสารนี้อยู่ในสถานะอ่านอย่างเดียว');
    if (linksLoading) return toast.warning('กำลังตรวจสอบยอดที่ผูกอยู่ กรุณารอสักครู่');
    if (selectedReceipts.length === 0) return toast.warning('กรุณาเลือกใบรับสินค้าอย่างน้อย 1 ใบ');
    if (allocationProjection?.overflow) return toast.warning('ยอดจัดสรรรวมเกินยอดใบกำกับภาษี');

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
  }, [
    allocationProjection?.overflow,
    branchId,
    linksLoading,
    loadLinks,
    loadReceipts,
    selectedDocumentId,
    selectedDocumentMutable,
    selectedReceipts,
  ]);

  const createInputTaxDocument = useCallback(async (event) => {
    event.preventDefault();
    if (!selectedSupplier) return toast.warning('เลือกใบรับสินค้าของ Supplier ก่อนสร้างใบกำกับภาษี');
    if (!invoice.documentNumber || !invoice.issuedAt) {
      return toast.warning('กรุณากรอกเลขที่และวันที่ใบกำกับภาษี');
    }

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
  }, [branchId, invoice, loadDocuments, selectedSupplier]);

  const reallocate = useCallback(async (link, allocation) => {
    setBusyLinkId(link.id);
    try {
      await reallocateInputTaxDocumentReceiptLink({
        branchId,
        taxDocumentId: selectedDocumentId,
        linkId: link.id,
        allocation,
        reason: 'ปรับยอดจัดสรรจากหน้าติดตามเอกสารภาษีซื้อ',
      });
      toast.success('ปรับยอดจัดสรรแล้ว');
      await Promise.all([loadLinks(), loadReceipts()]);
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setBusyLinkId(null);
    }
  }, [branchId, loadLinks, loadReceipts, selectedDocumentId]);

  const cancelLink = useCallback(async (link, reason) => {
    setBusyLinkId(link.id);
    try {
      await cancelInputTaxDocumentReceiptLink({
        branchId,
        taxDocumentId: selectedDocumentId,
        linkId: link.id,
        reason,
      });
      toast.success('ยกเลิกการผูกแล้ว โดยยังเก็บประวัติไว้');
      await Promise.all([loadLinks(), loadReceipts()]);
    } catch (error) {
      toast.error(inputTaxReceiptLinkErrorMessage(error));
    } finally {
      setBusyLinkId(null);
    }
  }, [branchId, loadLinks, loadReceipts, selectedDocumentId]);

  const refreshWorkspace = useCallback(() => {
    loadReceipts();
    loadDocuments();
    loadLinks();
  }, [loadDocuments, loadLinks, loadReceipts]);

  const changeInvoice = useCallback((field, value) => {
    setInvoice((current) => ({ ...current, [field]: value }));
  }, []);

  return {
    branchId,
    currentBranch,
    filters,
    receipts,
    documents,
    selected,
    selectedReceipts,
    selectedSupplierId,
    selectedSupplier,
    selectedDocumentId,
    selectedDocument,
    selectedDocumentMutable,
    eligibleDocuments,
    suppliers,
    links,
    linksLoading,
    allocationProjection,
    loading,
    submitting,
    busyLinkId,
    showCreateDocument,
    invoice,
    setSelectedDocumentId,
    setShowCreateDocument,
    selectExistingDocument,
    changeFilter,
    resetFilters,
    loadReceipts,
    toggleReceipt,
    changeAllocation,
    attachSelected,
    createInputTaxDocument,
    reallocate,
    cancelLink,
    refreshWorkspace,
    changeInvoice,
  };
};

export default useInputTaxReceiptWorkspaceController;
