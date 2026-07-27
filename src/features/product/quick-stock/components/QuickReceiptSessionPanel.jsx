import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import {
  addQuickReceiptItem,
  createQuickReceiptDraft,
  finalizeQuickReceipt,
  listQuickReceiptDrafts,
  loadQuickReceiptSuppliers,
} from '../api/quickReceiptSessionApi';

const STORAGE_KEY = 'alpha-tech.quick-receipt.local-draft.v1';

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

const QuickReceiptSessionPanel = ({
  operationalProduct,
  barcodeQueue = [],
  defaultCost,
  priceForm = {},
  note,
  onCurrentLineSaved,
}) => {
  const [header, setHeader] = useState(emptyHeader);
  const [suppliers, setSuppliers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setHeader((current) => ({ ...current, ...JSON.parse(saved) })); } catch (_error) {}
    }
    Promise.all([loadQuickReceiptSuppliers(), listQuickReceiptDrafts({ status: 'DRAFT' })])
      .then(([supplierRows, draftRows]) => {
        setSuppliers(supplierRows);
        setDrafts(Array.isArray(draftRows) ? draftRows : []);
      })
      .catch((error) => toast.error(error?.message || 'โหลดข้อมูลใบรับด่วนไม่สำเร็จ'));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(header));
  }, [header]);

  const totalQuantity = useMemo(
    () => (receipt?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [receipt]
  );

  const updateHeader = (field, value) => setHeader((current) => ({ ...current, [field]: value }));

  const ensureDraft = async () => {
    if (receipt?.id) return receipt;
    if (!header.supplierId || !String(header.deliveryNoteNumber || '').trim()) {
      throw new Error('กรุณาเลือก Supplier และกรอกเลขที่ใบส่งของก่อน');
    }
    const created = await createQuickReceiptDraft({ ...header, supplierId: Number(header.supplierId) });
    setReceipt(created);
    setDrafts((current) => [created, ...current.filter((item) => item.id !== created.id)]);
    return created;
  };

  const handleSaveCurrentLine = async () => {
    if (!operationalProduct?.id) return toast.error('กรุณาเลือกสินค้าก่อน');
    if (!barcodeQueue.length) return toast.error('ยังไม่มีรายการ Barcode ใน Queue');

    setIsBusy(true);
    try {
      const activeReceipt = await ensureDraft();
      const updated = await addQuickReceiptItem(activeReceipt.id, {
        productId: Number(operationalProduct.id),
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
      setReceipt(updated);
      onCurrentLineSaved?.();
      toast.success(`เพิ่ม ${operationalProduct.name} ลงใบรับแล้ว`);
    } catch (error) {
      toast.error(error?.message || 'เพิ่มสินค้าในใบรับไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleFinalize = async () => {
    if (!receipt?.id) return toast.error('ยังไม่มี Server Draft สำหรับยืนยัน');
    if (!(receipt.items || []).length) return toast.error('ยังไม่มีสินค้าในใบรับ');
    setIsBusy(true);
    try {
      const completed = await finalizeQuickReceipt(receipt.id);
      setReceipt(completed);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('ยืนยันรับสินค้าครบแล้ว และนำสินค้าเข้าสต๊อกเรียบร้อย');
    } catch (error) {
      toast.error(error?.message || 'ยืนยันรับสินค้าไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const resumeDraft = (draft) => {
    setReceipt(draft);
    setHeader((current) => ({
      ...current,
      supplierId: String(draft.supplierId || ''),
      deliveryNoteNumber: draft.deliveryNoteNumber || '',
      deliveryNoteDate: draft.deliveryNoteDate ? String(draft.deliveryNoteDate).slice(0, 10) : '',
      taxDocumentMode: draft.taxDocumentMode || 'NOT_RECEIVED',
    }));
  };

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">ใบรับสินค้าด่วนตามใบส่งของ</h2>
          <p className="text-sm text-slate-600">เพิ่มสินค้าได้หลายประเภท เก็บไว้รับต่อ หรือยืนยันรับครบในครั้งเดียว</p>
        </div>
        {receipt?.code && (
          <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            {receipt.code} · {receipt.status}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <select className="rounded-lg border px-3 py-2 text-sm" value={header.supplierId} disabled={!!receipt?.id || isBusy} onChange={(e) => updateHeader('supplierId', e.target.value)}>
          <option value="">เลือก Supplier</option>
          {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </select>
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="เลขที่ใบส่งของ" value={header.deliveryNoteNumber} disabled={!!receipt?.id || isBusy} onChange={(e) => updateHeader('deliveryNoteNumber', e.target.value)} />
        <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={header.deliveryNoteDate} disabled={!!receipt?.id || isBusy} onChange={(e) => updateHeader('deliveryNoteDate', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <select className="rounded-lg border px-3 py-2 text-sm" value={header.taxDocumentMode} disabled={!!receipt?.id || isBusy} onChange={(e) => updateHeader('taxDocumentMode', e.target.value)}>
          <option value="NOT_RECEIVED">ยังไม่มีใบกำกับภาษี</option>
          <option value="RECEIVED_WITH_GOODS">ได้รับใบกำกับภาษีพร้อมสินค้า</option>
          <option value="NON_VAT_DOCUMENT">ไม่มี VAT</option>
          <option value="NO_INPUT_TAX_CLAIM">ไม่ใช้สิทธิภาษีซื้อ</option>
        </select>
        {header.taxDocumentMode === 'RECEIVED_WITH_GOODS' && (
          <>
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="เลขที่ใบกำกับภาษี" value={header.supplierTaxInvoiceNumber} disabled={!!receipt?.id || isBusy} onChange={(e) => updateHeader('supplierTaxInvoiceNumber', e.target.value)} />
            <input type="date" className="rounded-lg border px-3 py-2 text-sm" value={header.supplierTaxInvoiceDate} disabled={!!receipt?.id || isBusy} onChange={(e) => updateHeader('supplierTaxInvoiceDate', e.target.value)} />
          </>
        )}
      </div>

      {!!drafts.length && !receipt?.id && (
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-sm font-medium text-slate-700">รายการที่ยังรับไม่ครบ</p>
          <div className="flex flex-wrap gap-2">
            {drafts.slice(0, 8).map((draft) => (
              <button key={draft.id} type="button" className="rounded-lg border px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => resumeDraft(draft)}>
                {draft.supplierName || `Supplier #${draft.supplierId}`} · {draft.deliveryNoteNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {receipt?.id && (
        <div className="rounded-lg border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span>สินค้า {receipt.items?.length || 0} ประเภท</span>
            <span>รวม {totalQuantity} ชิ้น</span>
          </div>
          {(receipt.items || []).map((item) => (
            <div key={item.id} className="mt-2 flex justify-between border-t pt-2 text-slate-700">
              <span>{item.productName}</span><span>{item.quantity} ชิ้น</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-50" disabled={isBusy || receipt?.status === 'COMPLETED'} onClick={handleSaveCurrentLine}>
          เก็บสินค้าปัจจุบันไว้ในใบรับ
        </button>
        <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isBusy || !receipt?.id || receipt?.status === 'COMPLETED'} onClick={handleFinalize}>
          ยืนยันรับสินค้าครบแล้ว
        </button>
      </div>
    </section>
  );
};

export default QuickReceiptSessionPanel;
