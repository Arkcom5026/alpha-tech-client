import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import {
  addQuickReceiptItem,
  cancelQuickReceipt,
  completeQuickReceipt,
  createQuickReceiptDraft,
  deleteQuickReceiptItem,
  finalizeQuickReceipt,
  getQuickReceipt,
  listQuickReceiptDrafts,
  loadQuickReceiptSuppliers,
  updateQuickReceiptDraft,
} from '../api/quickReceiptSessionApi';

const STORAGE_KEY = 'alpha-tech.quick-receipt.local-draft.v2';

const normalizeTaxDocumentMode = (value) =>
  value === 'RECEIVED_WITH_GOODS' ? 'RECEIVED' : (value || 'NOT_RECEIVED');

const emptyHeader = {
  supplierId: '',
  deliveryNoteNumber: '',
  deliveryNoteDate: '',
  note: '',
  taxDocumentMode: 'NOT_RECEIVED',
  supplierTaxInvoiceNumber: '',
  supplierTaxInvoiceDate: '',
  taxPricingMode: 'VAT_INCLUDED',
  documentSubtotal: '',
  documentVatAmount: '',
  documentTotalAmount: '',
};

const buildLine = ({ operationalProduct, barcodeQueue, defaultCost, priceForm, note }) => ({
  localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  productId: Number(operationalProduct.id),
  productName: operationalProduct.name,
  quantity: barcodeQueue.length,
  costPrice: Number(defaultCost ?? priceForm.costPrice),
  priceRetail: Number(priceForm.priceRetail),
  priceWholesale: priceForm.priceWholesale === '' ? null : Number(priceForm.priceWholesale),
  priceTechnician: priceForm.priceTechnician === '' ? null : Number(priceForm.priceTechnician),
  priceOnline: priceForm.priceOnline === '' ? null : Number(priceForm.priceOnline),
  note,
  items: barcodeQueue.map((item) => ({
    barcode: String(item.barcode || '').trim(),
    serialNumber: String(item.serialNumber || '').trim() || null,
  })),
});

const toHeader = (detail) => ({
  supplierId: String(detail?.supplierId || ''),
  deliveryNoteNumber: detail?.deliveryNoteNumber || '',
  deliveryNoteDate: detail?.deliveryNoteDate ? String(detail.deliveryNoteDate).slice(0, 10) : '',
  note: detail?.note || '',
  taxDocumentMode: normalizeTaxDocumentMode(detail?.taxDocumentMode),
  supplierTaxInvoiceNumber: detail?.supplierTaxInvoiceNumber || '',
  supplierTaxInvoiceDate: detail?.supplierTaxInvoiceDate ? String(detail.supplierTaxInvoiceDate).slice(0, 10) : '',
  taxPricingMode: detail?.taxPricingMode || 'VAT_INCLUDED',
  documentSubtotal: detail?.documentSubtotal ?? '',
  documentVatAmount: detail?.documentVatAmount ?? '',
  documentTotalAmount: detail?.documentTotalAmount ?? '',
});

const useQuickReceiptSessionController = ({
  operationalProduct,
  barcodeQueue = [],
  defaultCost,
  priceForm = {},
  note,
  onCurrentLineSaved,
}) => {
  const [header, setHeader] = useState(emptyHeader);
  const [localLines, setLocalLines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [draftSearch, setDraftSearch] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const refreshDrafts = async () => {
    const rows = await listQuickReceiptDrafts({ status: 'DRAFT' });
    setDrafts(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHeader((current) => ({
          ...current,
          ...(parsed.header || {}),
          taxDocumentMode: normalizeTaxDocumentMode(parsed.header?.taxDocumentMode),
        }));
        setLocalLines(Array.isArray(parsed.lines) ? parsed.lines : []);
      } catch (_error) {}
    }

    Promise.all([loadQuickReceiptSuppliers(), listQuickReceiptDrafts({ status: 'DRAFT' })])
      .then(([supplierRows, draftRows]) => {
        setSuppliers(supplierRows);
        setDrafts(Array.isArray(draftRows) ? draftRows : []);
      })
      .catch((error) => toast.error(error?.message || 'โหลดข้อมูลใบรับด่วนไม่สำเร็จ'));
  }, []);

  useEffect(() => {
    if (receipt?.id) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ header, lines: localLines }));
  }, [header, localLines, receipt?.id]);

  const serverLines = receipt?.items || [];
  const allLines = [...serverLines, ...localLines];
  const totalQuantity = useMemo(
    () => allLines.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [allLines]
  );
  const visibleDrafts = useMemo(() => {
    const keyword = draftSearch.trim().toLowerCase();
    if (!keyword) return drafts;
    return drafts.filter((draft) =>
      `${draft.supplierName || ''} ${draft.deliveryNoteNumber || ''}`.toLowerCase().includes(keyword)
    );
  }, [draftSearch, drafts]);

  const updateHeader = (field, value) => setHeader((current) => ({ ...current, [field]: value }));
  const validateHeader = () => {
    if (!header.supplierId || !String(header.deliveryNoteNumber || '').trim()) {
      throw new Error('กรุณาเลือก Supplier และกรอกเลขที่ใบส่งของก่อน');
    }
  };

  const resetReceipt = () => {
    setReceipt(null);
    setHeader(emptyHeader);
    setLocalLines([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleAddCurrentLine = () => {
    if (!operationalProduct?.id) return toast.error('กรุณาเลือกสินค้าก่อน');
    if (!barcodeQueue.length) return toast.error('ยังไม่มีรายการ Barcode ใน Queue');

    const line = buildLine({ operationalProduct, barcodeQueue, defaultCost, priceForm, note });
    if (!line.costPrice || line.costPrice <= 0) return toast.error('กรุณากำหนดราคาทุน');
    if (!line.priceRetail || line.priceRetail <= 0) return toast.error('กรุณากำหนดราคาขายปลีก');

    setLocalLines((current) => [...current, line]);
    onCurrentLineSaved?.();
    toast.success(`เพิ่ม ${operationalProduct.name} ไว้ในรายการรับแล้ว`);
  };

  const uploadLocalLines = async (activeReceipt) => {
    let latest = activeReceipt;
    for (const line of localLines) {
      const { localId, productName, ...payload } = line;
      latest = await addQuickReceiptItem(latest.id, payload);
    }
    setReceipt(latest);
    setLocalLines([]);
    return latest;
  };

  const handleSaveForLater = async () => {
    setIsBusy(true);
    try {
      validateHeader();
      let active = receipt;
      if (!active?.id) {
        active = await createQuickReceiptDraft({ ...header, supplierId: Number(header.supplierId) });
      } else {
        active = await updateQuickReceiptDraft(active.id, { ...header, supplierId: Number(header.supplierId) });
      }
      active = await uploadLocalLines(active);
      setHeader(toHeader(active));
      await refreshDrafts();
      toast.success('เก็บรายการไว้รับต่อภายหลังแล้ว');
    } catch (error) {
      toast.error(error?.message || 'บันทึกรายการรับต่อภายหลังไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleFinalize = async () => {
    setIsBusy(true);
    try {
      validateHeader();
      if (!allLines.length) throw new Error('ยังไม่มีสินค้าในใบรับ');

      let completed;
      if (receipt?.id) {
        let active = await updateQuickReceiptDraft(receipt.id, { ...header, supplierId: Number(header.supplierId) });
        active = await uploadLocalLines(active);
        completed = await finalizeQuickReceipt(active.id);
      } else {
        completed = await completeQuickReceipt({
          ...header,
          supplierId: Number(header.supplierId),
          items: localLines.map(({ localId, productName, ...line }) => line),
        });
      }

      setReceipt(completed);
      setHeader(toHeader(completed));
      setLocalLines([]);
      localStorage.removeItem(STORAGE_KEY);
      await refreshDrafts();
      toast.success('ยืนยันรับสินค้าครบแล้ว และนำสินค้าเข้าสต๊อกเรียบร้อย');
    } catch (error) {
      toast.error(error?.message || 'ยืนยันรับสินค้าไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const resumeDraft = async (draft) => {
    setIsBusy(true);
    try {
      const detail = await getQuickReceipt(draft.id);
      setReceipt(detail);
      setLocalLines([]);
      setHeader(toHeader(detail));
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      toast.error(error?.message || 'เปิดรายการรับต่อไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const removeLocalLine = (localId) => {
    setLocalLines((current) => current.filter((line) => line.localId !== localId));
  };

  const removeServerLine = async (itemId) => {
    if (!receipt?.id) return;
    setIsBusy(true);
    try {
      const updated = await deleteQuickReceiptItem(receipt.id, itemId);
      setReceipt(updated);
      toast.success('ลบสินค้าออกจากใบรับแล้ว');
    } catch (error) {
      toast.error(error?.message || 'ลบสินค้าไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancelDraft = async () => {
    if (!receipt?.id || receipt.status !== 'DRAFT') return;
    setIsBusy(true);
    try {
      await cancelQuickReceipt(receipt.id, 'ยกเลิกจากหน้ารับสินค้าด่วน');
      resetReceipt();
      await refreshDrafts();
      toast.success('ยกเลิกรายการรับสินค้าด่วนแล้ว');
    } catch (error) {
      toast.error(error?.message || 'ยกเลิกรายการไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const locked = receipt?.status === 'COMPLETED' || receipt?.status === 'CANCELLED';

  return {
    header,
    suppliers,
    drafts,
    visibleDrafts,
    draftSearch,
    receipt,
    isBusy,
    locked,
    allLines,
    totalQuantity,
    setDraftSearch,
    updateHeader,
    resetReceipt,
    handleAddCurrentLine,
    handleSaveForLater,
    handleFinalize,
    resumeDraft,
    removeLocalLine,
    removeServerLine,
    handleCancelDraft,
  };
};

export default useQuickReceiptSessionController;
