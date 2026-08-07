// src/features/stockItem/pages/ScanBarcodeListPage.jsx
// Alpha-Tech procurement receiving workspace — ADS light theme.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, HelpCircle, Search } from 'lucide-react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import useStockItemReceiveStore from '@/features/stockItem/receive/store/useStockItemReceiveStore';
import StockItemScanControls from '@/features/stockItem/receive/scan-workflow/components/StockItemScanControls';
import StockItemScanSummary from '@/features/stockItem/receive/scan-workflow/components/StockItemScanSummary';
import StockItemScanWorkspaceHeader from '@/features/stockItem/receive/scan-workflow/components/StockItemScanWorkspaceHeader';
import useStockItemScanRuntimeController from '@/features/stockItem/receive/scan-workflow/hooks/useStockItemScanRuntimeController';
import {
  STOCK_ITEM_FOCUS_TARGET,
  STOCK_ITEM_WORKING_GROUP,
} from '@/features/stockItem/receive/scan-workflow/policies/stockItemScanWorkflowPolicy';

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
  const [manualSerialMode, setManualSerialMode] = useState(false);
  const [lastFlashBarcode, setLastFlashBarcode] = useState('');
  const [pageMessage, setPageMessage] = useState(null);
  const [secretAllArmedAt, setSecretAllArmedAt] = useState(0);
  const [editingBarcodeReceiptId, setEditingBarcodeReceiptId] = useState(null);
  const [editingSN, setEditingSN] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const barcodeInputRef = useRef(null);
  const serialInputRef = useRef(null);
  const filterInputRef = useRef(null);
  const editSerialInputRef = useRef(null);
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

  const isScanned = useCallback((row) => {
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
  }, []);

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

  const resolveProductIdentity = useCallback((row) =>
    row?.productId ??
    row?.product?.id ??
    row?.purchaseOrderReceiptItem?.productId ??
    row?.purchaseOrderReceiptItem?.product?.id ??
    row?.receiptItem?.productId ??
    row?.receiptItem?.product?.id ??
    resolveProductName(row), [resolveProductName]);

  const resolveSearchText = useCallback((row) => [
    resolveProductName(row),
    row?.barcode,
    row?.stockItem?.product?.sku,
    row?.stockItem?.sku,
    row?.purchaseOrderReceiptItem?.product?.sku,
    row?.receiptItem?.product?.sku,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase(), [resolveProductName]);

  const scannedList = useMemo(() => {
    const list = Array.isArray(barcodes) ? barcodes : [];
    return list.filter(isScanned);
  }, [barcodes, isScanned]);

  const {
    pendingRows,
    workingRows: pendingList,
    workingGroup,
    expectedBarcode: currentExpectedPlaceholder,
    focusForCurrentState,
    resolveReceiveInput,
    scheduleFocus,
  } = useStockItemScanRuntimeController({
    rows: barcodes,
    query: textFilter,
    isPending: (row) => !isScanned(row),
    resolveProductIdentity,
    resolveSearchText,
    barcodeInputRef,
    serialInputRef,
    searchInputRef: filterInputRef,
    editSerialInputRef,
    manualSerialMode,
    submitting,
    editingSerial: editingBarcodeReceiptId != null,
  });

  const totalCount = Array.isArray(barcodes) ? barcodes.length : 0;
  const scannedCount = scannedList.length;
  const pendingCount = pendingRows.length;
  const receiptLabel = currentReceipt?.purchaseOrder?.code || currentReceipt?.code || purchaseOrderCode || receiptId || '-';
  const isSingleProductWorkingGroup = workingGroup === STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT;

  useEffect(() => {
    if (!receiptId) return;
    clearErrorAction?.();
    loadBarcodesAction(receiptId);
    loadReceiptWithSupplierAction(receiptId);
  }, [receiptId, clearErrorAction, loadBarcodesAction, loadReceiptWithSupplierAction]);

  useEffect(() => {
    focusForCurrentState();
  }, [focusForCurrentState]);

  useEffect(() => () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
  }, []);

  const refreshBarcodesDebounced = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      if (receiptId) loadBarcodesAction(receiptId);
    }, 300);
  }, [loadBarcodesAction, receiptId]);

  const restoreWorkflowFocus = useCallback(() => {
    focusForCurrentState();
  }, [focusForCurrentState]);

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
      restoreWorkflowFocus();
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
          await loadBarcodesAction(receiptId);
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
      restoreWorkflowFocus();
    }
  }, [lastSubmit, loadBarcodesAction, receiptId, receiveSNAction, restoreWorkflowFocus]);

  const submitCurrentInput = useCallback(() => {
    const effectiveInput = resolveReceiveInput({
      barcodeInput,
      serialNumber: snInput,
    });
    const barcode = effectiveInput.barcode;
    const serialNumber = effectiveInput.serialNumber;

    if (!barcode) {
      setPageMessage({ type: 'error', text: 'กรุณาระบุบาร์โค้ด' });
      scheduleFocus(STOCK_ITEM_FOCUS_TARGET.BARCODE);
      return;
    }

    if (barcode.toLowerCase() === SECRET_RECEIVE_ALL_CODE) {
      const now = Date.now();
      if (!secretAllArmedAt || now - secretAllArmedAt > 3000) {
        setSecretAllArmedAt(now);
        setPageMessage({ type: 'warning', text: 'พิมพ์ all อีกครั้งภายใน 3 วินาทีเพื่อยืนยันรับสินค้าค้างทั้งหมด' });
        setBarcodeInput('');
        scheduleFocus(STOCK_ITEM_FOCUS_TARGET.BARCODE);
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
          restoreWorkflowFocus();
        });
      return;
    }

    if (!enqueueScan({ barcode, serialNumber })) return;
    processQueue();
  }, [
    barcodeInput,
    enqueueScan,
    loadBarcodesAction,
    processQueue,
    receiptId,
    receiveAllPendingNoSNAction,
    resolveReceiveInput,
    restoreWorkflowFocus,
    scheduleFocus,
    secretAllArmedAt,
    snInput,
  ]);

  const handleBarcodeEnter = useCallback(() => {
    if (manualSerialMode) {
      const capturedBarcode = String(barcodeInput || '').trim();
      if (capturedBarcode) {
        focusForCurrentState({ barcodeCaptured: true });
        return;
      }
      if (isSingleProductWorkingGroup && currentExpectedPlaceholder) {
        scheduleFocus(STOCK_ITEM_FOCUS_TARGET.SERIAL);
        return;
      }
    }
    submitCurrentInput();
  }, [
    barcodeInput,
    currentExpectedPlaceholder,
    focusForCurrentState,
    isSingleProductWorkingGroup,
    manualSerialMode,
    scheduleFocus,
    submitCurrentInput,
  ]);

  const handleSerialModeChange = useCallback((event) => {
    const checked = event.target.checked;
    setManualSerialMode(checked);
    requestAnimationFrame(() => {
      if (document.activeElement === filterInputRef.current) return;
      if (checked && isSingleProductWorkingGroup && currentExpectedPlaceholder) {
        scheduleFocus(STOCK_ITEM_FOCUS_TARGET.SERIAL);
        return;
      }
      scheduleFocus(STOCK_ITEM_FOCUS_TARGET.BARCODE);
    });
  }, [currentExpectedPlaceholder, isSingleProductWorkingGroup, scheduleFocus]);

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
      restoreWorkflowFocus();
    }
  };

  const messageClass = pageMessage?.type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : pageMessage?.type === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-5 p-4 text-slate-800 md:space-y-6 md:p-6">
      <StockItemScanWorkspaceHeader
        receiptLabel={receiptLabel}
        shopSlug={shopSlug}
        pendingCount={pendingCount}
        submitting={submitting}
        onBack={() => navigate(-1)}
        onFinalize={handleFinalize}
      />

      <StockItemScanSummary
        totalCount={totalCount}
        scannedCount={scannedCount}
        pendingCount={pendingCount}
      />

      {pageMessage && <div className={`rounded-xl border p-3 text-sm ${messageClass}`}>{pageMessage.text}</div>}

      <StockItemScanControls
        manualSerialMode={manualSerialMode}
        onSerialModeChange={handleSerialModeChange}
        barcodeInputRef={barcodeInputRef}
        barcodeInput={barcodeInput}
        setBarcodeInput={setBarcodeInput}
        onBarcodeEnter={handleBarcodeEnter}
        expectedBarcode={currentExpectedPlaceholder}
        serialInputRef={serialInputRef}
        snInput={snInput}
        setSnInput={setSnInput}
        onSubmit={submitCurrentInput}
        submitting={submitting}
        pendingCount={pendingCount}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><HelpCircle className="text-amber-500" size={20} /><div><h2 className="font-semibold">รายการค้างรับ</h2><p className="text-xs text-slate-500">{workingGroup === STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT ? 'กลุ่มสินค้าชนิดเดียว' : workingGroup === STOCK_ITEM_WORKING_GROUP.MIXED_PRODUCT ? 'หลายกลุ่มสินค้า' : 'ไม่มีรายการในกลุ่ม'}</p></div></div><div className="relative max-w-xs flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input ref={filterInputRef} type="search" value={textFilter} onChange={(event) => setTextFilter(event.target.value)} placeholder="ค้นหาสินค้า / SKU / Barcode" className="min-h-11 w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /></div></div>
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">{pendingList.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">ไม่มีรายการค้างรับในกลุ่มนี้</p> : pendingList.map((row, index) => <div key={row.id ?? `${row.barcode}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{resolveProductName(row)}</p><p className="mt-1 font-mono text-sm text-teal-700">{row.barcode || '-'}</p></div><span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">ค้างรับ</span></div></div>)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={20} /><h2 className="font-semibold">รายการรับแล้ว</h2></div>
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">{scannedList.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">ยังไม่มีรายการรับเข้า</p> : scannedList.map((row, index) => { const isEditing = editingBarcodeReceiptId === row.id; return <div key={row.id ?? `${row.barcode}-${index}`} className={`rounded-xl border p-3 ${lastFlashBarcode === String(row.barcode || '') ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{resolveProductName(row)}</p><p className="mt-1 font-mono text-sm text-teal-700">{row.barcode || '-'}</p></div>{isEditing ? <div className="flex flex-wrap items-center gap-2"><input ref={editSerialInputRef} value={editingSN} onChange={(event) => setEditingSN(event.target.value)} placeholder="เว้นว่างเพื่อล้าง SN" className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /><button type="button" disabled={editingSubmitting} onClick={() => handleSaveEditSN(row)} className="min-h-11 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">บันทึก</button><button type="button" disabled={editingSubmitting} onClick={() => { setEditingBarcodeReceiptId(null); setEditingSN(''); restoreWorkflowFocus(); }} className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm">ยกเลิก</button></div> : <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">พร้อมขาย</span><span className="font-mono text-sm text-slate-600">SN: {row.serialNumber || '-'}</span><button type="button" onClick={() => { setEditingBarcodeReceiptId(row.id); setEditingSN(row.serialNumber || ''); requestAnimationFrame(() => scheduleFocus(STOCK_ITEM_FOCUS_TARGET.EDIT_SERIAL)); }} className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">แก้ไข SN</button></div>}</div></div>; })}</div>
        </div>
      </section>
    </main>
  );
};

export default ScanBarcodeListPage;
