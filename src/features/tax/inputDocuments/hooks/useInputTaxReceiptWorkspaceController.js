import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { feedback as toast } from '@/design-system';
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
  documentCanFitReceiptAllocations,
  projectDocumentAllocation,
  receiptAllocationPrefill,
  receiptIdentity,
} from '../utils/inputTaxReceiptLink';

export const inputTaxReceiptInitialFilters = Object.freeze({
  keyword: '', supplierId: '', sourceType: '', linkState: 'ACTION_REQUIRED', fromDate: '', toDate: '',
});

const initialInvoice = Object.freeze({ documentNumber: '', issuedAt: '', subtotalAmount: '', taxAmount: '', totalAmount: '' });
const makeCommandKey = () => globalThis.crypto?.randomUUID?.() || `input-tax-link-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const normalizeList = (result, key) => Array.isArray(result?.[key]) ? result[key] : Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : [];

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
  const mutationRef = useRef(false);
  const branchIdRef = useRef(branchId);
  branchIdRef.current = branchId;

  const selectedReceipts = useMemo(() => Object.values(selected), [selected]);
  const selectedSupplierId = selectedReceipts[0]?.supplierId || null;
  const selectedSupplier = selectedReceipts[0] || null;
  const selectedDocument = useMemo(() => documents.find((document) => String(document.id) === String(selectedDocumentId)) || null, [documents, selectedDocumentId]);
  const selectedDocumentMutable = selectedDocument ? isTaxDocumentMutable(selectedDocument.status) : false;
  const allocationProjection = useMemo(() => selectedDocument ? projectDocumentAllocation({ document: selectedDocument, activeLinks: links, pendingReceipts: selectedReceipts }) : null, [links, selectedDocument, selectedReceipts]);
  const eligibleDocuments = useMemo(() => {
    const mutableDocuments = documents.filter((document) => isTaxDocumentMutable(document.status));
    const supplierDocuments = selectedSupplierId ? mutableDocuments.filter((document) => Number(document?.supplierId || document?.snapshot?.supplierId || 0) === Number(selectedSupplierId)) : mutableDocuments;
    if (selectedReceipts.length === 0) return supplierDocuments;
    return supplierDocuments.filter((document) => documentCanFitReceiptAllocations(document, selectedReceipts));
  }, [documents, selectedReceipts, selectedSupplierId]);
  const suppliers = useMemo(() => {
    const unique = new Map();
    receipts.forEach((receipt) => unique.set(Number(receipt.supplierId), { id: Number(receipt.supplierId), name: receipt.supplierName }));
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }, [receipts]);

  const loadReceipts = useCallback(async (criteria = filters, { reportError = true, branchIdOverride } = {}) => {
    const branchIdSnapshot = Number(branchIdOverride || branchId || 0) || null;
    if (!branchIdSnapshot) return { ok: false, stale: true };
    setLoading(true);
    try {
      const result = await listInputTaxReceiptCandidates({ branchId: branchIdSnapshot, ...criteria });
      if (Number(branchIdRef.current || 0) !== branchIdSnapshot) return { ok: false, stale: true };
      const data = normalizeList(result, 'receipts');
      setReceipts(data);
      setSelected({});
      return { ok: true, data };
    } catch (error) {
      if (reportError && Number(branchIdRef.current || 0) === branchIdSnapshot) toast.error(inputTaxReceiptLinkErrorMessage(error));
      return { ok: false, error };
    } finally {
      if (Number(branchIdRef.current || 0) === branchIdSnapshot) setLoading(false);
    }
  }, [branchId, filters]);

  const loadDocuments = useCallback(async ({ reportError = true, branchIdOverride } = {}) => {
    const branchIdSnapshot = Number(branchIdOverride || branchId || 0) || null;
    if (!branchIdSnapshot) return { ok: false, stale: true };
    try {
      const result = await listTaxDocuments({ branchId: branchIdSnapshot, documentType: 'INPUT_TAX_INVOICE', limit: 200 });
      if (Number(branchIdRef.current || 0) !== branchIdSnapshot) return { ok: false, stale: true };
      const data = normalizeList(result, 'documents');
      setDocuments(data);
      return { ok: true, data };
    } catch (error) {
      if (reportError && Number(branchIdRef.current || 0) === branchIdSnapshot) toast.error(inputTaxReceiptLinkErrorMessage(error));
      return { ok: false, error };
    }
  }, [branchId]);

  const loadLinks = useCallback(async (taxDocumentId = selectedDocumentId, { reportError = true, branchIdOverride } = {}) => {
    const branchIdSnapshot = Number(branchIdOverride || branchId || 0) || null;
    const taxDocumentIdSnapshot = String(taxDocumentId || '');
    if (!branchIdSnapshot || !taxDocumentIdSnapshot) {
      setLinks([]); setLinksLoading(false); return { ok: true, data: [] };
    }
    setLinks([]); setLinksLoading(true);
    try {
      const result = await listInputTaxDocumentReceiptLinks({ branchId: branchIdSnapshot, taxDocumentId: taxDocumentIdSnapshot });
      if (Number(branchIdRef.current || 0) !== branchIdSnapshot) return { ok: false, stale: true };
      const data = normalizeList(result, 'links');
      setLinks(data);
      return { ok: true, data };
    } catch (error) {
      if (reportError && Number(branchIdRef.current || 0) === branchIdSnapshot) toast.error(inputTaxReceiptLinkErrorMessage(error));
      return { ok: false, error };
    } finally {
      if (Number(branchIdRef.current || 0) === branchIdSnapshot) setLinksLoading(false);
    }
  }, [branchId, selectedDocumentId]);

  useEffect(() => {
    if (!branchId) { Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {}); return; }
    loadReceipts(); loadDocuments();
  }, [branchId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadLinks(); }, [loadLinks]);
  useEffect(() => { if (selectedDocumentId && selectedSupplierId && !eligibleDocuments.some((document) => String(document.id) === String(selectedDocumentId))) setSelectedDocumentId(''); }, [eligibleDocuments, selectedDocumentId, selectedSupplierId]);

  const changeFilter = useCallback((field, value) => setFilters((current) => ({ ...current, [field]: value })), []);
  const resetFilters = useCallback(() => { setFilters(inputTaxReceiptInitialFilters); loadReceipts(inputTaxReceiptInitialFilters); }, [loadReceipts]);
  const toggleReceipt = useCallback((receipt) => {
    const key = receiptIdentity(receipt);
    setSelected((current) => {
      if (current[key]) { const next = { ...current }; delete next[key]; return next; }
      const first = Object.values(current)[0];
      if (first && Number(first.supplierId) !== Number(receipt.supplierId)) { toast.warning('กรุณาเลือกใบรับสินค้าจากผู้จำหน่ายรายเดียวกัน'); return current; }
      return { ...current, [key]: { ...receipt, ...receiptAllocationPrefill(receipt) } };
    });
  }, []);
  const changeAllocation = useCallback((key, field, value) => setSelected((current) => ({ ...current, [key]: { ...current[key], [field]: value } })), []);
  const selectExistingDocument = useCallback((documentId) => { setShowCreateDocument(false); setSelectedDocumentId(String(documentId || '')); }, []);

  const reportRefreshFailure = useCallback((error, message, eventKey) => {
    toast.actionError(error || new Error(message), message, eventKey);
  }, []);

  const attachSelected = useCallback(async () => {
    if (mutationRef.current) return;
    if (!selectedDocumentId) return toast.warning('กรุณาเลือกใบกำกับภาษีซื้อ');
    if (!selectedDocumentMutable) return toast.warning('ใบกำกับภาษีซื้อนี้ไม่อนุญาตให้ผูกเพิ่ม');
    if (linksLoading) return toast.warning('กำลังตรวจสอบยอดที่ผูกไว้ กรุณารอสักครู่');
    if (selectedReceipts.length === 0) return toast.warning('กรุณาเลือกใบรับสินค้าอย่างน้อย 1 ใบ');
    if (allocationProjection?.overflow) return toast.warning('ยอดที่จะผูกรวมเกินยอดใบกำกับภาษีซื้อ');
    const branchIdSnapshot = branchId;
    const taxDocumentIdSnapshot = selectedDocumentId;
    const receiptReferencesSnapshot = selectedReceipts.map((receipt) => ({ ...receipt }));
    mutationRef.current = true; setSubmitting(true);
    try {
      await attachInputTaxDocumentReceiptLinks({ branchId: branchIdSnapshot, taxDocumentId: taxDocumentIdSnapshot, commandKey: makeCommandKey(), receiptReferences: receiptReferencesSnapshot });
      toast.actionSuccess(`ผูกใบรับสินค้า ${receiptReferencesSnapshot.length} ใบกับใบกำกับภาษีซื้อแล้ว`, `input-tax-receipt:${taxDocumentIdSnapshot}:attach:success`);
      if (Number(branchIdRef.current || 0) !== Number(branchIdSnapshot)) {
        reportRefreshFailure(null, 'ผูกใบรับสินค้าสำเร็จแล้ว แต่เปลี่ยนสาขาก่อนรีเฟรชข้อมูลล่าสุด', `input-tax-receipt:${taxDocumentIdSnapshot}:attach:context-changed:error`); return;
      }
      setSelected({});
      const [receiptsRefresh, linksRefresh] = await Promise.all([
        loadReceipts(filters, { reportError: false, branchIdOverride: branchIdSnapshot }),
        loadLinks(taxDocumentIdSnapshot, { reportError: false, branchIdOverride: branchIdSnapshot }),
      ]);
      if (!receiptsRefresh.ok || !linksRefresh.ok) reportRefreshFailure(receiptsRefresh.error || linksRefresh.error, 'ผูกใบรับสินค้าสำเร็จแล้ว แต่รีเฟรชข้อมูลล่าสุดไม่สำเร็จ', `input-tax-receipt:${taxDocumentIdSnapshot}:attach:refresh:error`);
    } catch (error) {
      toast.actionError(error, inputTaxReceiptLinkErrorMessage(error), `input-tax-receipt:${taxDocumentIdSnapshot}:attach:error`);
    } finally { mutationRef.current = false; setSubmitting(false); }
  }, [allocationProjection?.overflow, branchId, filters, linksLoading, loadLinks, loadReceipts, reportRefreshFailure, selectedDocumentId, selectedDocumentMutable, selectedReceipts]);

  const createInputTaxDocument = useCallback(async (event) => {
    event.preventDefault();
    if (mutationRef.current) return;
    if (!selectedSupplier) return toast.warning('กรุณาเลือกใบรับสินค้าของผู้จำหน่ายก่อนสร้างใบกำกับภาษีซื้อ');
    if (!invoice.documentNumber || !invoice.issuedAt) return toast.warning('กรุณากรอกเลขที่และวันที่ใบกำกับภาษีซื้อ');
    const branchIdSnapshot = branchId;
    const supplierSnapshot = { ...selectedSupplier };
    const invoiceSnapshot = { ...invoice };
    mutationRef.current = true; setSubmitting(true);
    try {
      const result = await registerTaxCandidate({
        branchId: branchIdSnapshot, sourceType: 'MANUAL',
        sourceId: `INPUT_TAX:${supplierSnapshot.supplierId}:${invoiceSnapshot.documentNumber}:${invoiceSnapshot.issuedAt}`,
        sourceDocumentNo: invoiceSnapshot.documentNumber, occurredAt: invoiceSnapshot.issuedAt, documentType: 'INPUT_TAX_INVOICE',
        snapshot: { supplierId: Number(supplierSnapshot.supplierId), counterpartyName: supplierSnapshot.supplierName, issuerTaxId: supplierSnapshot.supplierTaxId || null, issuedAt: invoiceSnapshot.issuedAt, subtotalAmount: Number(invoiceSnapshot.subtotalAmount || 0), taxAmount: Number(invoiceSnapshot.taxAmount || 0), totalAmount: Number(invoiceSnapshot.totalAmount || 0), currency: 'THB' },
      });
      const document = result?.document;
      const documentId = document?.id || 'new';
      toast.actionSuccess('สร้างใบกำกับภาษีซื้อแล้ว', `input-tax-receipt:${documentId}:document:create:success`);
      if (Number(branchIdRef.current || 0) !== Number(branchIdSnapshot)) {
        reportRefreshFailure(null, 'สร้างใบกำกับภาษีซื้อสำเร็จแล้ว แต่เปลี่ยนสาขาก่อนรีเฟรชรายการเอกสาร', `input-tax-receipt:${documentId}:document:create:context-changed:error`); return;
      }
      const refresh = await loadDocuments({ reportError: false, branchIdOverride: branchIdSnapshot });
      if (!refresh.ok) reportRefreshFailure(refresh.error, 'สร้างใบกำกับภาษีซื้อสำเร็จแล้ว แต่รีเฟรชรายการเอกสารไม่สำเร็จ', `input-tax-receipt:${documentId}:document:create:refresh:error`);
      if (document?.id) setSelectedDocumentId(String(document.id));
      setShowCreateDocument(false);
    } catch (error) {
      toast.actionError(error, inputTaxReceiptLinkErrorMessage(error), 'input-tax-receipt:document:create:error');
    } finally { mutationRef.current = false; setSubmitting(false); }
  }, [branchId, invoice, loadDocuments, reportRefreshFailure, selectedSupplier]);

  const reallocate = useCallback(async (link, allocation) => {
    if (mutationRef.current) return;
    const branchIdSnapshot = branchId;
    const taxDocumentIdSnapshot = selectedDocumentId;
    const linkIdSnapshot = link.id;
    const allocationSnapshot = { ...allocation };
    mutationRef.current = true; setBusyLinkId(linkIdSnapshot);
    try {
      await reallocateInputTaxDocumentReceiptLink({ branchId: branchIdSnapshot, taxDocumentId: taxDocumentIdSnapshot, linkId: linkIdSnapshot, allocation: allocationSnapshot, reason: 'ปรับยอดที่ผูกจากหน้าติดตามเอกสารภาษีซื้อ' });
      toast.actionSuccess('ปรับยอดที่ผูกแล้ว', `input-tax-receipt:${linkIdSnapshot}:reallocate:success`);
      const [linksRefresh, receiptsRefresh] = await Promise.all([
        loadLinks(taxDocumentIdSnapshot, { reportError: false, branchIdOverride: branchIdSnapshot }),
        loadReceipts(filters, { reportError: false, branchIdOverride: branchIdSnapshot }),
      ]);
      if (!linksRefresh.ok || !receiptsRefresh.ok) reportRefreshFailure(linksRefresh.error || receiptsRefresh.error, 'ปรับยอดที่ผูกสำเร็จแล้ว แต่รีเฟรชข้อมูลล่าสุดไม่สำเร็จ', `input-tax-receipt:${linkIdSnapshot}:reallocate:refresh:error`);
    } catch (error) { toast.actionError(error, inputTaxReceiptLinkErrorMessage(error), `input-tax-receipt:${linkIdSnapshot}:reallocate:error`); }
    finally { mutationRef.current = false; setBusyLinkId(null); }
  }, [branchId, filters, loadLinks, loadReceipts, reportRefreshFailure, selectedDocumentId]);

  const cancelLink = useCallback(async (link, reason) => {
    if (mutationRef.current) return;
    const branchIdSnapshot = branchId;
    const taxDocumentIdSnapshot = selectedDocumentId;
    const linkIdSnapshot = link.id;
    const reasonSnapshot = String(reason || '').trim();
    mutationRef.current = true; setBusyLinkId(linkIdSnapshot);
    try {
      await cancelInputTaxDocumentReceiptLink({ branchId: branchIdSnapshot, taxDocumentId: taxDocumentIdSnapshot, linkId: linkIdSnapshot, reason: reasonSnapshot });
      toast.actionSuccess('ยกเลิกการผูกแล้ว โดยยังเก็บประวัติไว้', `input-tax-receipt:${linkIdSnapshot}:cancel:success`);
      const [linksRefresh, receiptsRefresh] = await Promise.all([
        loadLinks(taxDocumentIdSnapshot, { reportError: false, branchIdOverride: branchIdSnapshot }),
        loadReceipts(filters, { reportError: false, branchIdOverride: branchIdSnapshot }),
      ]);
      if (!linksRefresh.ok || !receiptsRefresh.ok) reportRefreshFailure(linksRefresh.error || receiptsRefresh.error, 'ยกเลิกการผูกสำเร็จแล้ว แต่รีเฟรชข้อมูลล่าสุดไม่สำเร็จ', `input-tax-receipt:${linkIdSnapshot}:cancel:refresh:error`);
    } catch (error) { toast.actionError(error, inputTaxReceiptLinkErrorMessage(error), `input-tax-receipt:${linkIdSnapshot}:cancel:error`); }
    finally { mutationRef.current = false; setBusyLinkId(null); }
  }, [branchId, filters, loadLinks, loadReceipts, reportRefreshFailure, selectedDocumentId]);

  const refreshWorkspace = useCallback(() => { if (mutationRef.current) return; loadReceipts(); loadDocuments(); loadLinks(); }, [loadDocuments, loadLinks, loadReceipts]);
  const changeInvoice = useCallback((field, value) => { if (!mutationRef.current) setInvoice((current) => ({ ...current, [field]: value })); }, []);

  return { branchId, currentBranch, filters, receipts, documents, selected, selectedReceipts, selectedSupplierId, selectedSupplier, selectedDocumentId, selectedDocument, selectedDocumentMutable, eligibleDocuments, suppliers, links, linksLoading, allocationProjection, loading, submitting, busyLinkId, showCreateDocument, invoice, setSelectedDocumentId, setShowCreateDocument, selectExistingDocument, changeFilter, resetFilters, loadReceipts, toggleReceipt, changeAllocation, attachSelected, createInputTaxDocument, reallocate, cancelLink, refreshWorkspace, changeInvoice };
};

export default useInputTaxReceiptWorkspaceController;
