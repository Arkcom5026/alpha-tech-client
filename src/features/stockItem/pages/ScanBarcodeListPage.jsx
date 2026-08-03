// src/features/stockItem/pages/ScanBarcodeListPage.jsx
// Alpha-Tech procurement receiving workspace — ADS light theme.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Box,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Search,
  ShieldCheck,
} from 'lucide-react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import useStockItemReceiveStore from '@/features/stockItem/receive/store/useStockItemReceiveStore';

const SECRET_RECEIVE_ALL_CODE = 'all';

const ScanBarcodeListPage = () => {
  const { receiptId, shopSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseOrderCode = searchParams.get('code');

  const [barcodeInput, setBarcodeInput] = useState('');
  const [snInput, setSnInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmit, setLastSubmit] = useState({ barcode: '', at: 0 });
  const [textFilter, setTextFilter] = useState('');
  const [lastFlashBarcode, setLastFlashBarcode] = useState('');
  const [pageMessage, setPageMessage] = useState(null);
  const [secretAllArmedAt, setSecretAllArmedAt] = useState(0);
  const [editingBarcodeReceiptId, setEditingBarcodeReceiptId] = useState(null);
  const [editingSN, setEditingSN] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const barcodeInputRef = useRef(null);
  const filterInputRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const scanQueueRef = useRef([]);
  const inFlightRef = useRef(false);

  const {
    loadBarcodesAction,
    barcodes,
    currentReceipt,
    loadReceiptWithSupplierAction,
    finalizeReceiptIfNeededAction,
    clearErrorAction,
    updateReceivedSNAction,
    deleteSerialNumberAction,
  } = useBarcodeStore();
  const { receiveSNAction, receiveAllPendingNoSNAction } = useStockItemReceiveStore();

  const isScanned = (row) => {
    const stockItemCreated = row?.stockItemId != null;
    const productMode = String(
      row?.product?.mode ||
        row?.purchaseOrderReceiptItem?.product?.mode ||
        row?.receiptItem?.product?.mode ||
        '',
    ).toUpperCase();
    if (productMode === 'STRUCTURED') return stockItemCreated;
    const isLot = row?.kind === 'LOT' || row?.simpleLotId != null;
    return stockItemCreated || (isLot && String(row?.status || '').toUpperCase() === 'SN_RECEIVED');
  };

  const resolveProductName = useCallback((row) => {
    const name =
      row?.productName ||
      row?.product?.name ||
      row?.purchaseOrderReceiptItem?.productName ||
      row?.purchaseOrderReceiptItem?.product?.name ||
      row?.receiptItem?.productName ||
      row?.receiptItem?.product?.name ||
      row?.purchaseOrderItem?.productName ||
      row?.purchaseOrderItem?.product?.name ||
      row?.poItem?.productName ||
      row?.poItem?.product?.name ||
      row?.productSnapshot?.name ||
      '';
    const normalized = String(name || '').trim();
    if (normalized) return normalized;
    const productId = row?.productId ?? row?.product?.id ?? null;
    return productId != null ? `#${productId}` : '-';
  }, []);

  const scannedList = useMemo(() => {
    const list = Array.isArray(barcodes) ? barcodes : [];
    return list.filter(isScanned);
  }, [barcodes]);

  const pendingList = useMemo(() => {
    const list = Array.isArray(barcodes) ? barcodes : [];
    const pendingRows = list.filter((row) => !isScanned(row));
    const query = String(textFilter || '').trim().toLowerCase();
    if (!query) return pendingRows;
    return pendingRows.filter((row) => {
      const productName = String(resolveProductName(row)).toLowerCase();
      const barcode = String(row?.barcode || '').toLowerCase();
      const sku = String(row?.stockItem?.product?.sku || row?.stockItem?.sku || '').toLowerCase();
      return productName.includes(query) || barcode.includes(query) || sku.includes(query);
    });
  }, [barcodes, resolveProductName, textFilter]);

  const totalCount = Array.isArray(barcodes) ? barcodes.length : 0;
  const scannedCount = scannedList.length;
  const pendingCount = totalCount - scannedCount;
  const currentExpectedPlaceholder = pendingList.length > 0 ? String(pendingList[0]?.barcode || '') : '';
  const receiptLabel = currentReceipt?.purchaseOrder?.code || currentReceipt?.code || purchaseOrderCode || receiptId || '-';

  const focusBarcodeInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (document.activeElement === filterInputRef.current) return;
      barcodeInputRef.current?.focus?.();
      barcodeInputRef.current?.select?.();
    });
  }, []);

  useEffect(() => {
    if (!receiptId) return;
    clearErrorAction?.();
    loadBarcodesAction(receiptId);
    loadReceiptWithSupplierAction(receiptId);
  }, [receiptId, clearErrorAction, loadBarcodesAction, loadReceiptWithSupplierAction]);

  useEffect(() => {
    focusBarcodeInput();
  }, [focusBarcodeInput]);

  useEffect(() => () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
  }, []);

  const refreshBarcodesDebounced = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      if (receiptId) loadBarcodesAction(receiptId);
    }, 300);
  }, [loadBarcodesAction, receiptId]);

  const handleFinalize = async () => {
    if (!receiptId) return;
    setSubmitting(true);
    try {
      await finalizeReceiptIfNeededAction(receiptId);
      await Promise.all([loadBarcodesAction(receiptId), loadReceiptWithSupplierAction(receiptId)]);
      setPageMessage({ type: 'success', text: 'ปิดยอดและบันทึกใบรับสินค้าเรียบร้อยแล้ว' });
    } catch (error) {
      setPageMessage({ type: 'error', text: `ปิดยอดไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
    } finally {
      setSubmitting(false);
      focusBarcodeInput();
    }
  };

  const enqueueScan = useCallback((job) => {
    const barcode = String(job?.barcode || '').trim();
    if (!barcode) return false;
    const queue = scanQueueRef.current || [];
    const last = queue.length ? queue[queue.length - 1] : null;
    if (last && String(last.barcode) === barcode && Date.now() - Number(last.enqueuedAt || 0) < 500) return false;
    queue.push({ barcode, serialNumber: job?.serialNumber ?? null, enqueuedAt: Date.now() });
    scanQueueRef.current = queue;
    return true;
  }, []);

  const processQueue = useCallback(async () => {
    if (inFlightRef.current || !scanQueueRef.current?.length) return;
    inFlightRef.current = true;
    setSubmitting(true);
    try {
      while (scanQueueRef.current.length) {
        const job = scanQueueRef.current.shift();
        const barcode = String(job?.barcode || '').trim();
        if (!barcode) continue;
        const now = Date.now();
        if (lastSubmit.barcode === barcode && now - lastSubmit.at < 650) continue;
        setLastSubmit({ barcode, at: now });
        try {
          await receiveSNAction({
            barcode,
            serialNumber: String(job?.serialNumber || '').trim() || null,
          });
          refreshBarcodesDebounced();
          setPageMessage({ type: 'success', text: `บันทึกสินค้าเข้าสต๊อกสำเร็จ: ${barcode}` });
          setLastFlashBarcode(barcode);
          setBarcodeInput('');
          setSnInput('');
        } catch (error) {
          setPageMessage({ type: 'error', text: `รับสินค้าไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
        }
      }
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
      focusBarcodeInput();
    }
  }, [focusBarcodeInput, lastSubmit, receiveSNAction, refreshBarcodesDebounced]);

  const submitCurrentInput = useCallback(() => {
    const barcode = String(barcodeInput || currentExpectedPlaceholder || '').trim();
    const serialNumber = String(snInput || '').trim();
    if (!barcode) {
      setPageMessage({ type: 'error', text: 'กรุณาระบุบาร์โค้ด' });
      focusBarcodeInput();
      return;
    }

    if (barcode.toLowerCase() === SECRET_RECEIVE_ALL_CODE) {
      const now = Date.now();
      if (!secretAllArmedAt || now - secretAllArmedAt > 3000) {
        setSecretAllArmedAt(now);
        setPageMessage({ type: 'warning', text: 'พิมพ์ all อีกครั้งภายใน 3 วินาทีเพื่อยืนยันรับสินค้าค้างทั้งหมด' });
        setBarcodeInput('');
        focusBarcodeInput();
        return;
      }
      setSecretAllArmedAt(0);
      setSubmitting(true);
      receiveAllPendingNoSNAction({ receiptId })
        .then(async () => {
          await loadBarcodesAction(receiptId);
          setPageMessage({ type: 'success', text: 'รับสินค้าค้างทั้งหมดเรียบร้อยแล้ว' });
        })
        .catch((error) => {
          setPageMessage({ type: 'error', text: `รับสินค้าค้างทั้งหมดไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
        })
        .finally(() => {
          setSubmitting(false);
          setBarcodeInput('');
          setSnInput('');
          focusBarcodeInput();
        });
      return;
    }

    if (!enqueueScan({ barcode, serialNumber })) return;
    processQueue();
  }, [barcodeInput, currentExpectedPlaceholder, enqueueScan, focusBarcodeInput, loadBarcodesAction, processQueue, receiptId, receiveAllPendingNoSNAction, secretAllArmedAt, snInput]);

  const handleSaveEditSN = async (row) => {
    const nextSN = String(editingSN || '').trim();
    setEditingSubmitting(true);
    try {
      if (nextSN) {
        await updateReceivedSNAction({
          stockItemId: row.stockItemId ?? row.stockItem?.id ?? null,
          serialNumber: nextSN,
          barcodeReceiptId: row.id,
          receiptId,
        });
        setPageMessage({ type: 'success', text: 'แก้ไข SN สำเร็จ' });
      } else {
        await deleteSerialNumberAction(row.barcode);
        await loadBarcodesAction(receiptId);
        setPageMessage({ type: 'success', text: 'ล้าง SN สำเร็จ' });
      }
      setEditingBarcodeReceiptId(null);
      setEditingSN('');
    } catch (error) {
      setPageMessage({ type: 'error', text: `แก้ไข SN ไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
    } finally {
      setEditingSubmitting(false);
      focusBarcodeInput();
    }
  };

  const messageClass = pageMessage?.type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : pageMessage?.type === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <div className="min-h-screen bg-[#fffaf3] text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="mb-4 flex flex-col gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-orange-200 bg-orange-50 p-2 text-orange-600 hover:bg-orange-100" aria-label="ย้อนกลับ">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-orange-500">รับสินค้าเข้าสต๊อก</p>
              <h1 className="mt-1 text-2xl font-bold">สแกนรับสินค้าเข้าสต๊อก</h1>
              <p className="mt-1 text-sm text-slate-500">ใบรับสินค้า: {receiptLabel}{shopSlug ? ` · ${shopSlug}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={handleFinalize} disabled={submitting || pendingCount > 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300">
            <ShieldCheck size={18} /> ปิดยอดใบรับสินค้า
          </button>
        </header>

        <section className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-slate-500"><Box size={18} /> ทั้งหมด</div><div className="mt-2 text-3xl font-bold">{totalCount}</div></div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 size={18} /> รับแล้ว</div><div className="mt-2 text-3xl font-bold text-emerald-800">{scannedCount}</div></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center gap-2 text-amber-700"><AlertCircle size={18} /> ค้างรับ</div><div className="mt-2 text-3xl font-bold text-amber-800">{pendingCount}</div></div>
        </section>

        {pageMessage && <div className={`mb-4 rounded-xl border p-3 text-sm ${messageClass}`}>{pageMessage.text}</div>}

        <section className="mb-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><Barcode className="text-orange-500" size={22} /><div><h2 className="font-semibold">จุดสแกนหลัก</h2><p className="text-xs text-slate-500">สแกนบาร์โค้ด และกรอก Serial Number เฉพาะเมื่อต้องการบันทึก</p></div></div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label><span className="mb-2 block text-sm font-medium">บาร์โค้ด</span><input ref={barcodeInputRef} value={barcodeInput} onChange={(event) => setBarcodeInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submitCurrentInput(); } }} placeholder={currentExpectedPlaceholder || 'สแกนหรือกรอกบาร์โค้ด'} disabled={submitting} className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /></label>
            <label><span className="mb-2 flex items-center justify-between text-sm font-medium"><span>Serial Number</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">ไม่บังคับ</span></span><input value={snInput} onChange={(event) => setSnInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submitCurrentInput(); } }} placeholder="เว้นว่างได้" disabled={submitting} className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" /></label>
            <button type="button" onClick={submitCurrentInput} disabled={submitting || pendingCount === 0} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"><CreditCard size={18} />{submitting ? 'กำลังบันทึก…' : 'บันทึกรับเข้า'}</button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><HelpCircle className="text-amber-500" size={20} /><h2 className="font-semibold">รายการค้างรับ</h2></div><div className="relative max-w-xs flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input ref={filterInputRef} value={textFilter} onChange={(event) => setTextFilter(event.target.value)} placeholder="ค้นหาสินค้า / SKU / Barcode" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400" /></div></div>
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">{pendingList.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">ไม่มีรายการค้างรับ</p> : pendingList.map((row, index) => <div key={row.id ?? `${row.barcode}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{resolveProductName(row)}</p><p className="mt-1 font-mono text-sm text-orange-600">{row.barcode || '-'}</p></div><span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">ค้างรับ</span></div></div>)}</div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={20} /><h2 className="font-semibold">รายการรับแล้ว</h2></div>
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">{scannedList.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">ยังไม่มีรายการรับเข้า</p> : scannedList.map((row, index) => { const isEditing = editingBarcodeReceiptId === row.id; return <div key={row.id ?? `${row.barcode}-${index}`} className={`rounded-xl border p-3 ${lastFlashBarcode === String(row.barcode || '') ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{resolveProductName(row)}</p><p className="mt-1 font-mono text-sm text-orange-600">{row.barcode || '-'}</p></div>{isEditing ? <div className="flex flex-wrap items-center gap-2"><input value={editingSN} onChange={(event) => setEditingSN(event.target.value)} placeholder="เว้นว่างเพื่อล้าง SN" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400" /><button type="button" disabled={editingSubmitting} onClick={() => handleSaveEditSN(row)} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">บันทึก</button><button type="button" disabled={editingSubmitting} onClick={() => { setEditingBarcodeReceiptId(null); setEditingSN(''); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">ยกเลิก</button></div> : <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">พร้อมขาย</span><span className="font-mono text-sm text-slate-600">SN: {row.serialNumber || '-'}</span><button type="button" onClick={() => { setEditingBarcodeReceiptId(row.id); setEditingSN(row.serialNumber || ''); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-white">แก้ไข SN</button></div>}</div></div>; })}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;
