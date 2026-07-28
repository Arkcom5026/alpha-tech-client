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

const QuickReceiptSessionPanel = ({
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

  const removeLocalLine = (localId) => setLocalLines((current) => current.filter((line) => line.localId !== localId));

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

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">ใบรับสินค้าด่วนตามใบส่งของ</h2>
          <p className="text-sm text-slate-600">รวบรวมสินค้าให้ครบก่อน แล้วเลือกเก็บไว้รับต่อหรือยืนยันทั้งใบครั้งเดียว</p>
        </div>
        <div className="flex items-center gap-2">
          {receipt?.code && <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">{receipt.code} · {receipt.status}</div>}
          {locked && <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={resetReceipt}>เริ่มใบรับใหม่</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <select className="rounded-lg border px-3 py-2 text-sm" value={header.supplierId} disabled={isBusy || locked} onChange={(e) => updateHeader('supplierId', e.target.value)}>
          <option value="">เลือก Supplier</option>
          {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </select>
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="เลขที่ใบส่งของ" value={header.deliveryNoteNumber} disabled={isBusy || locked} onChange={(e) => updateHeader('deliveryNoteNumber', e.target.value)} />
        <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={header.deliveryNoteDate} disabled={isBusy || locked} onChange={(e) => updateHeader('deliveryNoteDate', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <select className="rounded-lg border px-3 py-2 text-sm" value={header.taxDocumentMode} disabled={isBusy || locked} onChange={(e) => updateHeader('taxDocumentMode', e.target.value)}>
          <option value="NOT_RECEIVED">ยังไม่มีใบกำกับภาษี</option>
          <option value="RECEIVED">ได้รับใบกำกับภาษีพร้อมสินค้า</option>
          <option value="NON_VAT_DOCUMENT">ไม่มี VAT</option>
          <option value="NO_INPUT_TAX_CLAIM">ไม่ใช้สิทธิภาษีซื้อ</option>
        </select>
        {header.taxDocumentMode === 'RECEIVED' && <>
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="เลขที่ใบกำกับภาษี" value={header.supplierTaxInvoiceNumber} disabled={isBusy || locked} onChange={(e) => updateHeader('supplierTaxInvoiceNumber', e.target.value)} />
          <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={header.supplierTaxInvoiceDate} disabled={isBusy || locked} onChange={(e) => updateHeader('supplierTaxInvoiceDate', e.target.value)} />
        </>}
      </div>

      {!!drafts.length && !receipt?.id && (
        <div className="rounded-lg border border-slate-200 p-3 space-y-2">
          <p className="text-sm font-medium text-slate-700">รายการที่ยังรับไม่ครบ</p>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="ค้นหาจาก Supplier หรือเลขที่ใบส่งของ" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {visibleDrafts.slice(0, 20).map((draft) => (
              <button key={draft.id} type="button" className="rounded-lg border px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => resumeDraft(draft)}>
                {draft.supplierName || `Supplier #${draft.supplierId}`} · {draft.deliveryNoteNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {!!allLines.length && (
        <div className="rounded-lg border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>สินค้า {allLines.length} ประเภท</span><span>รวม {totalQuantity} ชิ้น</span>
          </div>
          {allLines.map((item) => (
            <div key={item.id || item.localId} className="mt-2 flex items-center justify-between gap-3 border-t pt-2 text-slate-700">
              <span>{item.productName}</span>
              <div className="flex items-center gap-2">
                <span>{item.quantity} ชิ้น</span>
                {!locked && item.localId && <button type="button" className="text-rose-600" onClick={() => removeLocalLine(item.localId)}>ลบ</button>}
                {!locked && item.id && <button type="button" className="text-rose-600" disabled={isBusy} onClick={() => removeServerLine(item.id)}>ลบ</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {receipt?.status === 'DRAFT' && <button type="button" className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50" disabled={isBusy} onClick={handleCancelDraft}>ยกเลิกใบรับนี้</button>}
        <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50" disabled={isBusy || locked} onClick={handleAddCurrentLine}>เพิ่มสินค้าปัจจุบันในรายการ</button>
        <button type="button" className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-50" disabled={isBusy || !allLines.length || locked} onClick={handleSaveForLater}>เก็บไว้รับต่อภายหลัง</button>
        <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isBusy || !allLines.length || locked} onClick={handleFinalize}>ยืนยันรับสินค้าครบแล้ว</button>
      </div>
    </section>
  );
};

export default QuickReceiptSessionPanel;
