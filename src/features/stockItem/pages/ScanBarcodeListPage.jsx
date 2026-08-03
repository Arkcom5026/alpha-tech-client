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
  const [keepSN, setKeepSN] = useState(false);
  const [inputStartTime, setInputStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmit, setLastSubmit] = useState({ barcode: '', at: 0 });
  const [textFilter, setTextFilter] = useState('');
  const [lastFlashBarcode, setLastFlashBarcode] = useState('');
  const [lastFlashAt, setLastFlashAt] = useState(0);
  const [snError, setSnError] = useState('');
  const [pageMessage, setPageMessage] = useState(null);
  const [secretAllArmedAt, setSecretAllArmedAt] = useState(0);
  const [editingBarcodeReceiptId, setEditingBarcodeReceiptId] = useState(null);
  const [editingSN, setEditingSN] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  const snInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const filterInputRef = useRef(null);
  const audioCtxRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const autoSubmitTimeoutRef = useRef(null);
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
    try {
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
    } catch (_) {
      return '-';
    }
  }, []);

  const scannedList = useMemo(() => {
    const list = Array.isArray(barcodes) ? barcodes : [];
    return list.filter(isScanned);
  }, [barcodes]);

  const filteredBarcodes = useMemo(() => {
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
  }, [barcodes, textFilter, resolveProductName]);

  const pendingList = filteredBarcodes;
  const totalCount = Array.isArray(barcodes) ? barcodes.length : 0;
  const scannedCount = scannedList.length;
  const pendingCount = totalCount - scannedCount;

  const isUniformProduct = useMemo(() => {
    if (pendingList.length === 0) return false;
    const firstProduct = resolveProductName(pendingList[0]);
    return pendingList.every((row) => resolveProductName(row) === firstProduct);
  }, [pendingList, resolveProductName]);

  const currentExpectedPlaceholder = pendingList.length > 0 ? String(pendingList[0]?.barcode || '') : '';

  const focusBarcodeInput = useCallback(() => {
    try {
      requestAnimationFrame(() => {
        if (keepSN && pendingList.length > 0) {
          snInputRef.current?.focus?.();
          snInputRef.current?.select?.();
          return;
        }
        if (document.activeElement === filterInputRef.current) return;
        barcodeInputRef.current?.focus?.();
        barcodeInputRef.current?.select?.();
      });
    } catch (_) {}
  }, [keepSN, pendingList.length]);

  useEffect(() => {
    if (isUniformProduct) {
      setKeepSN(true);
      const timeout = setTimeout(() => {
        if (document.activeElement !== filterInputRef.current) {
          snInputRef.current?.focus?.();
          snInputRef.current?.select?.();
        }
      }, 60);
      return () => clearTimeout(timeout);
    }
    setKeepSN(false);
    return undefined;
  }, [isUniformProduct]);

  const triggerSuccessFlash = useCallback((barcode) => {
    const normalized = String(barcode || '').trim();
    if (!normalized) return;
    setLastFlashBarcode(normalized);
    setLastFlashAt(Date.now());
  }, []);

  useEffect(() => {
    focusBarcodeInput();
  }, [keepSN, focusBarcodeInput]);

  useEffect(() => {
    if (!lastFlashBarcode || !lastFlashAt) return undefined;
    const timeout = setTimeout(() => {
      setLastFlashBarcode('');
      setLastFlashAt(0);
    }, 900);
    return () => clearTimeout(timeout);
  }, [lastFlashBarcode, lastFlashAt]);

  useEffect(() => {
    if (receiptId) {
      clearErrorAction?.();
      loadBarcodesAction(receiptId);
      loadReceiptWithSupplierAction(receiptId);
    }
  }, [receiptId, loadBarcodesAction, loadReceiptWithSupplierAction, clearErrorAction]);

  const ensureAudioCtx = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume?.().catch(() => {});
      return audioCtxRef.current;
    } catch (_) {
      return null;
    }
  };

  const playTone = (frequency, durationMs, type) => {
    const context = ensureAudioCtx();
    if (!context) return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + durationMs / 1000);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + durationMs / 1000);
    } catch (_) {}
  };

  const playBeep = () => playTone(880, 90, 'sine');
  const playErrorBeep = () => playTone(260, 120, 'square');

  const refreshBarcodesDebounced = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      if (receiptId) loadBarcodesAction(receiptId);
    }, 300);
  }, [loadBarcodesAction, receiptId]);

  const handleFinalize = async () => {
    if (!receiptId) {
      focusBarcodeInput();
      return;
    }
    setSubmitting(true);
    try {
      await finalizeReceiptIfNeededAction(receiptId);
      await Promise.all([loadBarcodesAction(receiptId), loadReceiptWithSupplierAction(receiptId)]);
      setPageMessage({ type: 'success', text: 'ปิดยอดและบันทึกใบรับสินค้าเรียบร้อยแล้ว' });
      playBeep();
    } catch (error) {
      setPageMessage({ type: 'error', text: `ปิดยอดไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
      playErrorBeep();
    } finally {
      setSubmitting(false);
      focusBarcodeInput();
    }
  };

  const enqueueScan = useCallback((job) => {
    try {
      const barcode = String(job?.barcode || '').trim();
      if (!barcode) return false;
      const queue = scanQueueRef.current || [];
      const last = queue.length ? queue[queue.length - 1] : null;
      if (last && String(last.barcode) === barcode && Date.now() - Number(last.enqueuedAt || 0) < 500) return false;
      queue.push({ barcode, serialNumber: job?.serialNumber ?? null, keepSN: !!job?.keepSN, enqueuedAt: Date.now() });
      scanQueueRef.current = queue;
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (inFlightRef.current || !scanQueueRef.current?.length) return;
    inFlightRef.current = true;
    setSubmitting(true);

    try {
      while (true) {
        const queue = scanQueueRef.current || [];
        if (!queue.length) break;
        const job = queue.shift();
        scanQueueRef.current = queue;
        const barcode = String(job?.barcode || '').trim();
        if (!barcode) continue;

        const now = Date.now();
        if (lastSubmit.barcode === barcode && now - lastSubmit.at < 650) continue;
        setLastSubmit({ barcode, at: now });

        const payload = job?.keepSN
          ? { barcode, serialNumber: String(job?.serialNumber || '').trim(), keepSN: true }
          : { barcode, keepSN: false };
        let succeeded = false;

        try {
          await receiveSNAction(payload);
          succeeded = true;
          refreshBarcodesDebounced();
          setPageMessage({ type: 'success', text: `บันทึกสินค้าเข้าสต๊อกสำเร็จ: ${barcode}` });
          triggerSuccessFlash(barcode);
          playBeep();
        } catch (error) {
          setPageMessage({ type: 'error', text: `รับสินค้าไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
          playErrorBeep();
        }

        if (succeeded) {
          setBarcodeInput('');
          setSnInput('');
          setSnError('');
        }
      }
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
      focusBarcodeInput();
    }
  }, [focusBarcodeInput, lastSubmit, receiveSNAction, refreshBarcodesDebounced, triggerSuccessFlash]);

  const submitCurrentInput = useCallback(() => {
    const barcode = String(barcodeInput || currentExpectedPlaceholder || '').trim();
    const serialNumber = String(snInput || '').trim();

    if (!barcode) {
      setPageMessage({ type: 'error', text: 'กรุณาระบุบาร์โค้ด' });
      playErrorBeep();
      focusBarcodeInput();
      return;
    }

    if (keepSN && !serialNumber) {
      setSnError('กรุณาระบุ SN');
      playErrorBeep();
      snInputRef.current?.focus?.();
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
          playBeep();
        })
        .catch((error) => {
          setPageMessage({ type: 'error', text: `รับสินค้าค้างทั้งหมดไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
          playErrorBeep();
        })
        .finally(() => {
          setSubmitting(false);
          setBarcodeInput('');
          setSnInput('');
          focusBarcodeInput();
        });
      return;
    }

    if (!enqueueScan({ barcode, serialNumber, keepSN })) return;
    processQueue();
  }, [
    barcodeInput,
    currentExpectedPlaceholder,
    enqueueScan,
    focusBarcodeInput,
    keepSN,
    loadBarcodesAction,
    processQueue,
    receiptId,
    receiveAllPendingNoSNAction,
    secretAllArmedAt,
    snInput,
  ]);

  const handleBarcodeChange = (event) => {
    const value = event.target.value;
    if (!inputStartTime && value) setInputStartTime(Date.now());
    setBarcodeInput(value);
  };

  const handleBarcodeKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitCurrentInput();
    }
  };

  const handleSnKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitCurrentInput();
    }
  };

  const handleEditSN = (row) => {
    setEditingBarcodeReceiptId(row.id);
    setEditingSN(row.serialNumber || '');
  };

  const handleCancelEditSN = () => {
    setEditingBarcodeReceiptId(null);
    setEditingSN('');
  };

  const handleSaveEditSN = async (row) => {
    const nextSN = String(editingSN || '').trim();
    if (!nextSN) {
      setPageMessage({ type: 'error', text: 'กรุณาระบุ SN' });
      return;
    }

    setEditingSubmitting(true);
    try {
      await updateReceivedSNAction(row.id, nextSN);
      await loadBarcodesAction(receiptId);
      setEditingBarcodeReceiptId(null);
      setEditingSN('');
      setPageMessage({ type: 'success', text: 'แก้ไข SN เรียบร้อยแล้ว' });
      playBeep();
    } catch (error) {
      setPageMessage({ type: 'error', text: `แก้ไข SN ไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}` });
      playErrorBeep();
    } finally {
      setEditingSubmitting(false);
      focusBarcodeInput();
    }
  };

  useEffect(() => () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
  }, []);

  const receiptLabel = currentReceipt?.purchaseOrder?.code || currentReceipt?.code || purchaseOrderCode || receiptId || '-';
  const inputClassName = 'w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100';

  return (
    <div className="min-h-full bg-[#fffaf4] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-700 transition hover:border-orange-300 hover:bg-orange-100" aria-label="ย้อนกลับ">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">รับสินค้าเข้าสต๊อก</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">สแกนรับสินค้าเข้าสต๊อก</h1>
              <p className="mt-1 text-sm text-slate-500">ใบรับสินค้า: {receiptLabel}{shopSlug ? ` · ${shopSlug}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={handleFinalize} disabled={submitting || pendingCount > 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
            <ShieldCheck size={18} /> ปิดยอดใบรับสินค้า
          </button>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Box size={18} /> ทั้งหมด</div><div className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</div></div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"><div className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> รับแล้ว</div><div className="mt-2 text-3xl font-bold text-emerald-800">{scannedCount}</div></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"><div className="flex items-center gap-2 text-sm font-medium text-amber-700"><AlertCircle size={18} /> ค้างรับ</div><div className="mt-2 text-3xl font-bold text-amber-800">{pendingCount}</div></div>
        </section>

        {pageMessage && <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${pageMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : pageMessage.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{pageMessage.text}</div>}

        <section className="mb-5 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Barcode size={20} /></span>
            <div><h2 className="font-bold text-slate-900">จุดสแกนหลัก</h2><p className="text-sm text-slate-500">สแกนบาร์โค้ดและระบุ Serial Number ก่อนบันทึกเข้าสต๊อก</p></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">บาร์โค้ด</span>
              <input ref={barcodeInputRef} value={barcodeInput} onChange={handleBarcodeChange} onKeyDown={handleBarcodeKeyDown} placeholder={currentExpectedPlaceholder || 'สแกนหรือกรอกบาร์โค้ด'} disabled={submitting} className={inputClassName} />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700"><span>Serial Number</span><span className={`rounded-full px-2 py-0.5 text-xs ${keepSN ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{keepSN ? 'จำเป็น' : 'ไม่บังคับ'}</span></span>
              <input ref={snInputRef} value={snInput} onChange={(event) => { setSnInput(event.target.value); setSnError(''); }} onKeyDown={handleSnKeyDown} placeholder="กรอก SN" disabled={submitting} className={inputClassName} />
              {snError && <span className="mt-1 block text-xs font-medium text-rose-600">{snError}</span>}
            </label>
            <button type="button" onClick={submitCurrentInput} disabled={submitting || pendingCount === 0} className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500">
              <CreditCard size={18} /> {submitting ? 'กำลังบันทึก…' : 'บันทึกรับเข้า'}
            </button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><HelpCircle size={18} /></span><h2 className="font-bold text-slate-900">รายการค้างรับ</h2></div>
              <div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input ref={filterInputRef} value={textFilter} onChange={(event) => setTextFilter(event.target.value)} placeholder="ค้นหาสินค้า / SKU / Barcode" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" /></div>
            </div>
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {pendingList.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">ไม่มีรายการค้างรับ</p> : pendingList.map((row, index) => (
                <div key={row.id ?? `${row.barcode}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-orange-200 hover:bg-orange-50/50"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{resolveProductName(row)}</p><p className="mt-1 font-mono text-sm font-semibold text-orange-600">{row.barcode || '-'}</p></div><span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">ค้างรับ</span></div></div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><CheckCircle2 size={18} /></span><h2 className="font-bold text-slate-900">รายการรับแล้ว</h2></div>
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {scannedList.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">ยังไม่มีรายการรับเข้า</p> : scannedList.map((row, index) => {
                const isEditing = editingBarcodeReceiptId === row.id;
                const highlighted = lastFlashBarcode === String(row.barcode || '');
                return (
                  <div key={row.id ?? `${row.barcode}-${index}`} className={`rounded-2xl border p-3.5 transition ${highlighted ? 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-100' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0"><p className="truncate font-semibold text-slate-800">{resolveProductName(row)}</p><p className="mt-1 font-mono text-sm font-semibold text-orange-600">{row.barcode || '-'}</p></div>
                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-2"><input value={editingSN} onChange={(event) => setEditingSN(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /><button type="button" disabled={editingSubmitting} onClick={() => handleSaveEditSN(row)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">บันทึก</button><button type="button" disabled={editingSubmitting} onClick={handleCancelEditSN} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-50">ยกเลิก</button></div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">พร้อมขาย</span><span className="font-mono text-sm text-slate-600">SN: {row.serialNumber || '-'}</span><button type="button" onClick={() => handleEditSN(row)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700">แก้ไข SN</button></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;
