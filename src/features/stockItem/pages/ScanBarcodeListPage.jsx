// src/features/stockItem/pages/ScanBarcodeListPage.jsx
// 🏛️ Premium Next-Gen Influx Terminal: (Reactive Auto-Pilot & Fixed Focus Hijacking Edition)

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import useStockItemStore from '@/features/stockItem/store/stockItemStore';
import { ArrowLeft, Box, CheckCircle2, AlertCircle, HelpCircle, ShieldCheck, CreditCard, Barcode, Search } from 'lucide-react';

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

  const {
    receiveSNAction,
    receiveAllPendingNoSNAction,
  } = useStockItemStore();

  const isScanned = (b) => {
    const snScanned = b?.stockItemId != null;
    const productMode = String(b?.product?.mode || b?.purchaseOrderReceiptItem?.product?.mode || b?.receiptItem?.product?.mode || '').toUpperCase();
    if (productMode === 'STRUCTURED') return snScanned;
    const isLot = b?.kind === 'LOT' || b?.simpleLotId != null;
    return snScanned || (isLot && String(b?.status || '').toUpperCase() === 'SN_RECEIVED');
  };

  const resolveProductName = useCallback((b) => {
    try {
      const name = b?.productName || b?.product?.name || b?.purchaseOrderReceiptItem?.productName || b?.purchaseOrderReceiptItem?.product?.name || b?.receiptItem?.productName || b?.receiptItem?.product?.name || b?.purchaseOrderItem?.productName || b?.purchaseOrderItem?.product?.name || b?.poItem?.productName || b?.poItem?.product?.name || b?.productSnapshot?.name || '';
      const s = String(name || '').trim();
      if (s) return s;
      const pid = b?.productId ?? b?.product?.id ?? null;
      return pid != null ? `#${pid}` : '-';
    } catch (_) { return '-'; }
  }, []);

  const scannedList = useMemo(() => {
    const list = Array.isArray(barcodes) ? barcodes : [];
    return list.filter(isScanned);
  }, [barcodes]);

  const filteredBarcodes = useMemo(() => {
    const list = Array.isArray(barcodes) ? barcodes : [];
    const pendingRaw = list.filter((b) => !isScanned(b));
    const q = String(textFilter || '').trim().toLowerCase();
    if (!q) return pendingRaw;

    return pendingRaw.filter((b) => {
      const pName = String(resolveProductName(b)).toLowerCase();
      const bCode = String(b?.barcode || '').toLowerCase();
      const sku = String(b?.stockItem?.product?.sku || b?.stockItem?.sku || '').toLowerCase();
      return pName.includes(q) || bCode.includes(q) || sku.includes(q);
    });
  }, [barcodes, textFilter, resolveProductName]);

  const pendingList = filteredBarcodes;

  const totalCount = barcodes.length;
  const scannedCount = scannedList.length;
  const pendingCount = totalCount - scannedCount;

  const isUniformProduct = useMemo(() => {
    if (pendingList.length === 0) return false;
    const firstProduct = resolveProductName(pendingList[0]);
    return pendingList.every((b) => resolveProductName(b) === firstProduct);
  }, [pendingList, resolveProductName]);

  const currentExpectedPlaceholder = pendingList.length > 0 ? String(pendingList[0]?.barcode || '') : '';

  const focusBarcodeInput = useCallback(() => {
    try {
      requestAnimationFrame(() => {
        if (keepSN && pendingList.length > 0) {
          snInputRef.current?.focus?.();
          snInputRef.current?.select?.();
        } else {
          if (document.activeElement === filterInputRef.current) return;
          barcodeInputRef.current?.focus?.();
          barcodeInputRef.current?.select?.();
        }
      });
    } catch (_) {}
  }, [keepSN, pendingList.length]);

  useEffect(() => {
    if (isUniformProduct) {
      setKeepSN(true);
      const t = setTimeout(() => {
        if (document.activeElement !== filterInputRef.current) {
          snInputRef.current?.focus?.();
          snInputRef.current?.select?.();
        }
      }, 60);
      return () => clearTimeout(t);
    } else {
      setKeepSN(false);
    }
  }, [isUniformProduct]);

  const triggerSuccessFlash = useCallback((barcode) => {
    const b = String(barcode || '').trim();
    if (!b) return;
    setLastFlashBarcode(b);
    setLastFlashAt(Date.now());
  }, []);

  useEffect(() => {
    focusBarcodeInput();
  }, [keepSN, focusBarcodeInput]); 

  useEffect(() => {
    if (!lastFlashBarcode || !lastFlashAt) return;
    const t = setTimeout(() => {
      setLastFlashBarcode('');
      setLastFlashAt(0);
    }, 900);
    return () => clearTimeout(t);
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
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume?.().catch(() => {});
      }
      return audioCtxRef.current;
    } catch (_) { return null; }
  };

  const playTone = (frequency, durationMs, type) => {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
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
    if (!receiptId) { focusBarcodeInput(); return; }
    setSubmitting(true);
    try {
      await finalizeReceiptIfNeededAction(receiptId);
      await Promise.all([loadBarcodesAction(receiptId), loadReceiptWithSupplierAction(receiptId)]);
      setPageMessage({ type: 'success', text: '✅ ส่งสัญญาณปิดยอด (Finalize) บันทึกใบรับพัสดุถาวรสำเร็จ' });
      playBeep();
    } catch (err) {
      setPageMessage({ type: 'error', text: `❌ ปิดยอดไม่สำเร็จ: ${err?.message}` });
      playErrorBeep();
    } finally { setSubmitting(false); focusBarcodeInput(); }
  };

  const enqueueScan = useCallback((job) => {
    try {
      const b = String(job?.barcode || '').trim();
      if (!b) return false;
      const q = scanQueueRef.current || [];
      const last = q.length ? q[q.length - 1] : null;
      if (last && String(last.barcode) === b && Date.now() - Number(last.enqueuedAt || 0) < 500) return false;
      q.push({ barcode: b, serialNumber: job?.serialNumber ?? null, keepSN: !!job?.keepSN, enqueuedAt: Date.now() });
      scanQueueRef.current = q;
      return true;
    } catch (_) { return false; }
  }, []);

  const processQueue = useCallback(async () => {
    if (inFlightRef.current) return;
    if (!scanQueueRef.current?.length) return;
    inFlightRef.current = true;
    setSubmitting(true);

    try {
      while (true) {
        const q = scanQueueRef.current || [];
        if (!q.length) break;
        const job = q.shift();
        scanQueueRef.current = q;
        const barcode = String(job?.barcode || '').trim();
        if (!barcode) continue;

        const now = Date.now();
        if (lastSubmit.barcode === barcode && now - lastSubmit.at < 650) continue;
        setLastSubmit({ barcode, at: now });

        const payload = job?.keepSN ? { barcode, serialNumber: String(job?.serialNumber || '').trim(), keepSN: true } : { barcode, keepSN: false };
        let ok = false;

        try {
          await receiveSNAction(payload);
          ok = true;
          refreshBarcodesDebounced();
          setPageMessage({ type: 'success', text: `✅ บันทึกเข้าสต๊อกสำเร็จ: ${barcode}` });
          triggerSuccessFlash(barcode);
          playBeep();
        } catch (err) {
          setPageMessage({ type: 'error', text: `❌ รับสินค้าไม่สำเร็จ: ${err?.message || 'เกิดข้อผิดพลาด'}` });
          playErrorBeep();
        }

        if (ok) {
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
          setPageMessage({ type: 'success', text: '✅ รับสินค้าค้างทั้งหมดเรียบร้อยแล้ว' });
          playBeep();
        })
        .catch((err) => {
          setPageMessage({ type: 'error', text: `❌ รับสินค้าค้างทั้งหมดไม่สำเร็จ: ${err?.message || 'เกิดข้อผิดพลาด'}` });
          playErrorBeep();
        })
        .finally(() => {
          setSubmitting(false);
          setBarcodeInput('');
          focusBarcodeInput();
        });
      return;
    }

    if (enqueueScan({ barcode, serialNumber, keepSN })) {
      processQueue();
    }
  }, [barcodeInput, currentExpectedPlaceholder, enqueueScan, focusBarcodeInput, keepSN, loadBarcodesAction, processQueue, receiptId, receiveAllPendingNoSNAction, secretAllArmedAt, snInput]);

  useEffect(() => {
    if (!keepSN) return;
    const serialNumber = String(snInput || '').trim();
    if (!serialNumber) return;

    if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
    autoSubmitTimeoutRef.current = setTimeout(() => {
      submitCurrentInput();
    }, 180);

    return () => {
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
    };
  }, [keepSN, snInput, submitCurrentInput]);

  const handleEditSN = async () => {
    if (!editingBarcodeReceiptId) return;
    const serialNumber = String(editingSN || '').trim();
    if (!serialNumber) {
      setPageMessage({ type: 'error', text: 'กรุณาระบุ SN ใหม่' });
      return;
    }

    setEditingSubmitting(true);
    try {
      await updateReceivedSNAction({ barcodeReceiptId: editingBarcodeReceiptId, serialNumber, receiptId });
      setEditingBarcodeReceiptId(null);
      setEditingSN('');
      setPageMessage({ type: 'success', text: '✅ อัปเดต SN เรียบร้อยแล้ว' });
      playBeep();
    } catch (err) {
      setPageMessage({ type: 'error', text: `❌ อัปเดต SN ไม่สำเร็จ: ${err?.message || 'เกิดข้อผิดพลาด'}` });
      playErrorBeep();
    } finally {
      setEditingSubmitting(false);
      focusBarcodeInput();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            <ArrowLeft size={18} /> กลับ
          </button>
          <div className="text-right">
            <div className="text-sm text-slate-400">ใบรับสินค้า</div>
            <div className="text-lg font-semibold">{currentReceipt?.code || purchaseOrderCode || receiptId || '-'}</div>
          </div>
        </div>

        {pageMessage && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${pageMessage.type === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-200' : pageMessage.type === 'warning' ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
            {pageMessage.text}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-sm text-slate-400">ทั้งหมด</div>
            <div className="mt-2 text-3xl font-bold">{totalCount}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="text-sm text-emerald-200">เข้าสต๊อกแล้ว</div>
            <div className="mt-2 text-3xl font-bold">{scannedCount}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="text-sm text-amber-200">ค้างรับ</div>
            <div className="mt-2 text-3xl font-bold">{pendingCount}</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={keepSN} onChange={(e) => setKeepSN(e.target.checked)} />
              โหมดเก็บ SN
            </label>
            <button
              type="button"
              onClick={handleFinalize}
              disabled={submitting}
              className="ml-auto rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              ปิดยอดใบรับ
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              ref={barcodeInputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitCurrentInput(); }}
              placeholder={currentExpectedPlaceholder ? `บาร์โค้ดที่คาด: ${currentExpectedPlaceholder}` : 'สแกนบาร์โค้ด'}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
            />
            <input
              ref={snInputRef}
              value={snInput}
              onChange={(e) => { setSnInput(e.target.value); setSnError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submitCurrentInput(); }}
              placeholder="Serial Number"
              disabled={!keepSN}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={submitCurrentInput}
              disabled={submitting}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              รับเข้าสต๊อก
            </button>
          </div>
          {snError && <div className="mt-2 text-sm text-red-300">{snError}</div>}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex items-center gap-3">
            <Search size={18} className="text-slate-400" />
            <input
              ref={filterInputRef}
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า บาร์โค้ด หรือ SKU"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-3">
            {pendingList.map((item) => (
              <div key={item.id || item.barcode} className={`rounded-xl border p-4 ${lastFlashBarcode === item.barcode ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/70'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{resolveProductName(item)}</div>
                    <div className="mt-1 text-sm text-slate-400">{item.barcode || '-'}</div>
                  </div>
                  <div className="text-sm text-amber-300">ค้างรับ</div>
                </div>
              </div>
            ))}

            {pendingList.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
                ไม่มีรายการค้างรับ
              </div>
            )}
          </div>
        </div>

        {editingBarcodeReceiptId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <div className="text-lg font-semibold">แก้ไข Serial Number</div>
              <input
                value={editingSN}
                onChange={(e) => setEditingSN(e.target.value)}
                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingBarcodeReceiptId(null)} className="rounded-xl border border-slate-700 px-4 py-2">ยกเลิก</button>
                <button type="button" onClick={handleEditSN} disabled={editingSubmitting} className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">บันทึก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;
