// src/features/stockItem/pages/ScanBarcodeListPage.jsx
// 🏛️ Premium Next-Gen Influx Terminal: (Reactive Auto-Pilot & Fixed Focus Hijacking Edition)

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import useStockItemReceiveStore from '@/features/stockItem/receive/store/useStockItemReceiveStore';
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
  } = useStockItemReceiveStore();

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
          setPageMessage({ type: 'success', text: '✅ รับสินค้าค้างรับทั้งหมดสำเร็จ' });
          playBeep();
        })
        .catch((err) => {
          setPageMessage({ type: 'error', text: `❌ รับสินค้าค้างรับทั้งหมดไม่สำเร็จ: ${err?.message || 'เกิดข้อผิดพลาด'}` });
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
  }, [barcodeInput, currentExpectedPlaceholder, enqueueScan, focusBarcodeInput, keepSN, loadBarcodesAction, processQueue, receiptId, receiveAllPendingNoSNAction, secretAllArmedAt, snInput]);

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
      setPageMessage({ type: 'success', text: '✅ แก้ไข SN สำเร็จ' });
      playBeep();
    } catch (err) {
      setPageMessage({ type: 'error', text: `❌ แก้ไข SN ไม่สำเร็จ: ${err?.message || 'เกิดข้อผิดพลาด'}` });
      playErrorBeep();
    } finally {
      setEditingSubmitting(false);
      focusBarcodeInput();
    }
  };

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
    };
  }, []);

  const receiptLabel = currentReceipt?.purchaseOrder?.code || currentReceipt?.code || purchaseOrderCode || receiptId || '-';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-1 rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700"
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">Stock Influx Terminal</p>
              <h1 className="mt-1 text-2xl font-bold text-white">สแกนรับสินค้าเข้าสต๊อก</h1>
              <p className="mt-1 text-sm text-slate-400">ใบรับสินค้า: {receiptLabel}{shopSlug ? ` · ${shopSlug}` : ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalize}
            disabled={submitting || pendingCount > 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck size={18} />
            ปิดยอดใบรับสินค้า
          </button>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-slate-400"><Box size={18} /> ทั้งหมด</div>
            <div className="mt-2 text-3xl font-bold">{totalCount}</div>
          </div>
          <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/40 p-4">
            <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={18} /> รับแล้ว</div>
            <div className="mt-2 text-3xl font-bold text-emerald-200">{scannedCount}</div>
          </div>
          <div className="rounded-2xl border border-amber-900/70 bg-amber-950/40 p-4">
            <div className="flex items-center gap-2 text-amber-300"><AlertCircle size={18} /> ค้างรับ</div>
            <div className="mt-2 text-3xl font-bold text-amber-200">{pendingCount}</div>
          </div>
        </section>

        {pageMessage && (
          <div className={`mb-5 rounded-xl border p-4 text-sm ${pageMessage.type === 'success' ? 'border-emerald-700 bg-emerald-950/60 text-emerald-200' : pageMessage.type === 'warning' ? 'border-amber-700 bg-amber-950/60 text-amber-200' : 'border-rose-700 bg-rose-950/60 text-rose-200'}`}>
            {pageMessage.text}
          </div>
        )}

        <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <Barcode className="text-cyan-400" size={22} />
            <h2 className="text-lg font-semibold">จุดสแกนหลัก</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">บาร์โค้ด</span>
              <input
                ref={barcodeInputRef}
                value={barcodeInput}
                onChange={handleBarcodeChange}
                onKeyDown={handleBarcodeKeyDown}
                placeholder={currentExpectedPlaceholder || 'สแกนหรือกรอกบาร์โค้ด'}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
                <span>Serial Number</span>
                <span className="text-xs text-slate-500">{keepSN ? 'จำเป็น' : 'ไม่บังคับ'}</span>
              </span>
              <input
                ref={snInputRef}
                value={snInput}
                onChange={(event) => { setSnInput(event.target.value); setSnError(''); }}
                onKeyDown={handleSnKeyDown}
                placeholder="กรอก SN"
                disabled={submitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              {snError && <span className="mt-1 block text-xs text-rose-400">{snError}</span>}
            </label>

            <button
              type="button"
              onClick={submitCurrentInput}
              disabled={submitting || pendingCount === 0}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard size={18} />
              {submitting ? 'กำลังบันทึก…' : 'บันทึกรับเข้า'}
            </button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-amber-400" size={20} />
                <h2 className="font-semibold">รายการค้างรับ</h2>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  ref={filterInputRef}
                  value={textFilter}
                  onChange={(event) => setTextFilter(event.target.value)}
                  placeholder="ค้นหาสินค้า / SKU / Barcode"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {pendingList.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">ไม่มีรายการค้างรับ</p>
              ) : pendingList.map((row, index) => (
                <div key={row.id ?? `${row.barcode}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-100">{resolveProductName(row)}</p>
                      <p className="mt-1 font-mono text-sm text-cyan-300">{row.barcode || '-'}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">ค้างรับ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" size={20} />
              <h2 className="font-semibold">รายการรับแล้ว</h2>
            </div>

            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {scannedList.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">ยังไม่มีรายการรับเข้า</p>
              ) : scannedList.map((row, index) => {
                const isEditing = editingBarcodeReceiptId === row.id;
                return (
                  <div key={row.id ?? `${row.barcode}-${index}`} className={`rounded-xl border p-3 transition ${lastFlashBarcode === String(row.barcode || '') ? 'border-emerald-400 bg-emerald-950/60' : 'border-slate-800 bg-slate-950/70'}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-100">{resolveProductName(row)}</p>
                        <p className="mt-1 font-mono text-sm text-cyan-300">{row.barcode || '-'}</p>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={editingSN}
                            onChange={(event) => setEditingSN(event.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
                          />
                          <button type="button" disabled={editingSubmitting} onClick={() => handleSaveEditSN(row)} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">บันทึก</button>
                          <button type="button" disabled={editingSubmitting} onClick={handleCancelEditSN} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-50">ยกเลิก</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">พร้อมขาย</span>
                          <span className="font-mono text-sm text-slate-300">SN: {row.serialNumber || '-'}</span>
                          <button type="button" onClick={() => handleEditSN(row)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800">แก้ไข SN</button>
                        </div>
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
