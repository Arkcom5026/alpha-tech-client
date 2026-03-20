




// ScanBarcodeListPage.jsx

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const SECRET_RECEIVE_ALL_CODE = 'all';

const ScanBarcodeListPage = () => {
  const { receiptId } = useParams();
  const [searchParams] = useSearchParams();
  const purchaseOrderCode = searchParams.get('code');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [snInput, setSnInput] = useState('');
  const [keepSN, setKeepSN] = useState(false);
  const [inputStartTime, setInputStartTime] = useState(null);

  // ✅ Warehouse UX: flash highlight แถวล่าสุดที่ยิงสำเร็จ (ช่วยให้ตาไล่ของได้เร็ว)
  const [lastFlashBarcode, setLastFlashBarcode] = useState('');
  const [lastFlashAt, setLastFlashAt] = useState(0);

  const triggerSuccessFlash = useCallback((barcode) => {
    const b = String(barcode || '').trim();
    if (!b) return;
    setLastFlashBarcode(b);
    setLastFlashAt(Date.now());
  }, []);

  // ✅ ล้าง flash state แบบ time-based นอก render เพื่อให้ highlight ดับเองอย่างเสถียร
  useEffect(() => {
    if (!lastFlashBarcode || !lastFlashAt) return;
    const t = setTimeout(() => {
      setLastFlashBarcode('');
      setLastFlashAt(0);
    }, 900);
    return () => clearTimeout(t);
  }, [lastFlashBarcode, lastFlashAt]);
  const [snError, setSnError] = useState('');
  const [pageMessage, setPageMessage] = useState(null);
  const [secretAllArmedAt, setSecretAllArmedAt] = useState(0);
  const snInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  // ✅ โฟกัสช่องยิงบาร์โค้ดทันทีเมื่อเข้า page
  useEffect(() => {
    try {
      barcodeInputRef?.current?.focus?.();
    } catch (_) { }
  }, []);

  // 🔁 เมื่อยิงบาร์โค้ดเสร็จและ input ถูกเคลียร์ ให้โฟกัสกลับมาที่ช่องยิงบาร์โค้ดทันที
  useEffect(() => {
    if (barcodeInput === '' && barcodeInputRef?.current) {
      barcodeInputRef.current.focus();
    }
  }, [barcodeInput]);

  const {
    loadBarcodesAction,
    loading,
    barcodes,
    receiveSNAction,
    currentReceipt,
    loadReceiptWithSupplierAction,
    finalizeReceiptIfNeededAction,
    clearErrorAction,
    receiveAllPendingNoSNAction,
  } = useBarcodeStore();

  useEffect(() => {
    if (receiptId) {
      clearErrorAction?.();
      loadBarcodesAction(receiptId);
      loadReceiptWithSupplierAction(receiptId);
    }
  }, [receiptId, loadBarcodesAction, loadReceiptWithSupplierAction, clearErrorAction]);

  useEffect(() => {
    if (keepSN && snInputRef.current) snInputRef.current.focus();
  }, [keepSN]);

  // ✅ Warehouse UX: Beep (success) / Error Beep (fail) แบบประหยัด resource
  const audioCtxRef = useRef(null);
  const ensureAudioCtx = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume?.().catch(() => { });
      }
      return audioCtxRef.current;
    } catch (_) {
      return null;
    }
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
    } catch (_) {
      // ignore
    }
  };

  const playBeep = () => playTone(880, 90, 'sine');
  const playErrorBeep = () => playTone(260, 120, 'square');

  // ✅ นับสถานะสแกนให้ครอบคลุมทั้ง SN & LOT
  // SN: ถือว่าสแกนแล้วถ้ามี stockItemId หรือ stockItem.id
  // LOT: ถือว่าสแกนแล้วถ้า status === 'SN_RECEIVED' (ตาม Prisma enum)
  const isScanned = (b) => {
    // ✅ SN: ให้ยึด "stockItemId" ของ barcodeReceiptItem เท่านั้น
    // เหตุผล: บาง payload อาจแนบ b.stockItem มาจากระดับ receiptItem (shared) ทำให้เข้าใจผิดว่า "ทุกแถว" ถูกยิงแล้ว
    const snScanned = b?.stockItemId != null;

    // ✅ Prisma ล่าสุดของ P1 ใช้ Product.mode เป็น source of truth
    const productMode = String(
      b?.product?.mode ||
      b?.purchaseOrderReceiptItem?.product?.mode ||
      b?.receiptItem?.product?.mode ||
      ''
    ).toUpperCase();
    const isProductSNMode = productMode === 'STRUCTURED';

    // ✅ ถ้าเป็นสินค้าโหมด SN ให้ถือว่าสแกนแล้วเฉพาะเมื่อมี stockItemId เท่านั้น
    // (กันเคสที่ API/FE อัปเดต status แบบ LOT/SN_RECEIVED ในระดับรายการ ทำให้ทุกแถวถูกนับว่ารับแล้ว)
    if (isProductSNMode) return snScanned;

    // ✅ LOT: ถือว่าสแกนแล้วถ้า status === 'SN_RECEIVED'
    const isLot = b?.kind === 'LOT' || b?.simpleLotId != null;
    const lotActivated = isLot && String(b?.status || '').toUpperCase() === 'SN_RECEIVED';

    return snScanned || lotActivated;
  };

  // ✅ Product name resolver (defensive)
  // เหตุผล: payload บางจุดอาจไม่แนบ productName ตรง ๆ โดยเฉพาะ "ฝั่งค้างรับ" (pending)
  // จึงต้องไล่ fallback ผ่าน relation ที่มีอยู่จริง (receiptItem / poItem / product)
  const resolveProductName = useCallback((b) => {
    try {
      const name =
        b?.productName ||
        b?.product?.name ||
        b?.purchaseOrderReceiptItem?.productName ||
        b?.purchaseOrderReceiptItem?.product?.name ||
        b?.receiptItem?.productName ||
        b?.receiptItem?.product?.name ||
        b?.purchaseOrderItem?.productName ||
        b?.purchaseOrderItem?.product?.name ||
        b?.poItem?.productName ||
        b?.poItem?.product?.name ||
        b?.productSnapshot?.name ||
        '';

      const s = String(name || '').trim();
      if (s) return s;

      // fallback สุดท้าย: โชว์ productId ถ้ามี (ช่วย debug / ลบข้อมูลทดสอบ)
      const pid = b?.productId ?? b?.product?.id ?? b?.purchaseOrderReceiptItem?.productId ?? null;
      return pid != null ? `#${pid}` : '-';
    } catch (_) {
      return '-';
    }
  }, []);

  const scannedList = useMemo(() => barcodes.filter(isScanned), [barcodes]);
  const pendingList = useMemo(() => barcodes.filter((b) => !isScanned(b)), [barcodes]);

  const pendingCount = pendingList.length;
  const scannedCount = scannedList.length;
  const totalCount = barcodes.length;

  // 🔒 กันยิงซ้ำ & ล็อกปุ่มระหว่างส่ง
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmit, setLastSubmit] = useState({ barcode: '', at: 0 });

  // 🔄 Debounced refresh หลังยิงสำเร็จ (ลด GET ซ้ำซ้อน)
  const refreshTimeoutRef = useRef(null);
  const refreshBarcodesDebounced = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      if (receiptId) loadBarcodesAction(receiptId);
    }, 300);
  }, [receiptId, loadBarcodesAction]);

  // 🧺 Warehouse UX (โหดขึ้น): Queue กันยิงถี่ + กัน request ซ้อน
  // - ให้ยิงต่อเนื่องได้แม้ network หน่วง
  // - process ทีละรายการแบบ FIFO (single in-flight)
  const scanQueueRef = useRef([]);
  const inFlightRef = useRef(false);

  const enqueueScan = useCallback((job) => {
    try {
      const b = String(job?.barcode || '').trim();
      if (!b) return false;

      // กัน duplicate ติดกันใน queue (เช่น scanner เด้งซ้ำ)
      const q = scanQueueRef.current || [];
      const last = q.length ? q[q.length - 1] : null;
      if (last && String(last.barcode) === b && Date.now() - Number(last.enqueuedAt || 0) < 500) {
        return false;
      }

      q.push({
        barcode: b,
        serialNumber: job?.serialNumber ?? null,
        keepSN: !!job?.keepSN,
        enqueuedAt: Date.now(),
      });
      scanQueueRef.current = q;
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (inFlightRef.current) return;
    if (!scanQueueRef.current?.length) return;

    inFlightRef.current = true;
    setSubmitting(true);

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const q = scanQueueRef.current || [];
        if (!q.length) break;

        const job = q.shift();
        scanQueueRef.current = q;

        const barcode = String(job?.barcode || '').trim();
        if (!barcode) continue;

        // กันยิงซ้ำในช่วงสั้น (idempotent UX)
        const now = Date.now();
        if (lastSubmit.barcode === barcode && now - lastSubmit.at < 650) {
          continue;
        }
        setLastSubmit({ barcode, at: now });

        const payload = job?.keepSN
          ? {
            barcode,
            serialNumber: String(job?.serialNumber || '').trim(),
            keepSN: true,
          }
          : {
            barcode,
            keepSN: false,
          };

        let ok = false;
        try {
          await receiveSNAction(payload);
          ok = true;
          refreshBarcodesDebounced();
          setPageMessage({ type: 'success', text: `✅ รับเข้าแล้ว: ${barcode}` });
          playBeep();
          triggerSuccessFlash(barcode);
        } catch (err) {
          const raw = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
          const msg = String(raw);
          const already = /already|ซ้ำ|SN_RECEIVED/i.test(msg);

          if (already) {
            refreshBarcodesDebounced();
            setPageMessage({ type: 'info', text: `ℹ️ บันทึกไว้แล้ว: ${barcode}` });
            playBeep();
          } else {
            setPageMessage({ type: 'error', text: `❌ ${barcode}: ${msg || 'บันทึกไม่สำเร็จ'}` });
            playErrorBeep();
          }
        } finally {
          if (ok) await new Promise((r) => setTimeout(r, 20));
        }
      }
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
      try {
        barcodeInputRef?.current?.focus?.();
        barcodeInputRef?.current?.select?.();
      } catch (_) {
        // ignore
      }
    }
  }, [lastSubmit, receiveSNAction, refreshBarcodesDebounced, triggerSuccessFlash]);

  // ✅ Warehouse UX: Auto-submit เมื่อยิงสแกนจบ (scanner ยิงเร็วมาก) → ลดการต้องกดปุ่ม
  const autoSubmitTimeoutRef = useRef(null);
  const scheduleAutoSubmit = useCallback((nextValue) => {
    try {
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      if (submitting) return;

      const v = String(nextValue || '').trim();
      if (!v) return;

      // 🔐 กัน auto-submit ระหว่างผู้ใช้กำลังพิมพ์ secret code เช่น a / al / all
      // ไม่อย่างนั้นจะเผลอ submit กลางทางแล้วขึ้น "ไม่พบบาร์โค้ด"
      if (!keepSN) {
        const secret = String(SECRET_RECEIVE_ALL_CODE || '').toLowerCase();
        const lower = v.toLowerCase();
        if (secret && secret.startsWith(lower)) return;
      }

      const startedAt = inputStartTime || Date.now();
      const burstMs = Date.now() - startedAt;

      // ถ้ายิงเร็ว (<250ms) ให้ auto submit เมื่อหยุดนิ่งเล็กน้อย
      if (burstMs <= 250) {
        autoSubmitTimeoutRef.current = setTimeout(() => {
          const form = document.getElementById('scan-form');
          form?.requestSubmit?.();
        }, 140);
      }
    } catch (_) {
      // ignore
    }
  }, [submitting, inputStartTime, keepSN]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      try {
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state !== 'closed') ctx.close?.();
      } catch (_) {
        // ignore
      }
    };
  }, []);

  // ⌨️ คีย์ลัด F2/F3/F4
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (barcodeInputRef?.current) {
          barcodeInputRef.current.focus();
          barcodeInputRef.current.select?.();
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        const nextKeepSN = !keepSN;
        setKeepSN(nextKeepSN);
        setTimeout(() => {
          if (nextKeepSN) snInputRef.current?.focus();
          else barcodeInputRef.current?.focus();
        }, 0);
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (!receiptId) return;
        setSubmitting(true);
        if (!finalizeReceiptIfNeededAction) {
          setPageMessage({ type: 'error', text: '❌ Store ยังไม่มี finalizeReceiptIfNeededAction' });
          setSubmitting(false);
          return;
        }
        finalizeReceiptIfNeededAction(receiptId)
          .then(async () => {
            await Promise.all([
              loadBarcodesAction(receiptId),
              loadReceiptWithSupplierAction(receiptId),
            ]);
            setPageMessage({ type: 'success', text: '✅ Finalize ใบรับสำเร็จ' });
            playBeep();
          })
          .catch((err) => {
            const msg = err?.response?.data?.message || err?.message || 'Finalize ไม่สำเร็จ';
            setPageMessage({ type: 'error', text: `❌ ${msg}` });
          })
          .finally(() => setSubmitting(false));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [receiptId, keepSN, loadBarcodesAction, loadReceiptWithSupplierAction, finalizeReceiptIfNeededAction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setPageMessage(null);

    const barcode = String(barcodeInput || '')
      .trim()
      .replace(/\r|\n/g, '')
      .replace(/\s+/g, '');
    if (!barcode) return;

    // 🔐 Hidden operator command: รับสินค้าค้างรับทั้งหมดในครั้งเดียว
    const isSecretAll = barcode.toLowerCase() === SECRET_RECEIVE_ALL_CODE;

    if (isSecretAll) {
      const now = Date.now();
      const armedWindowMs = 2500;

      setBarcodeInput('');
      setSnInput('');
      setInputStartTime(null);
      setSnError('');

      // ✅ Safety polish: ต้องพิมพ์ all ซ้ำอีกครั้งภายในช่วงสั้น ๆ เพื่อยืนยัน
      // ช่วยกัน mis-scan / พิมพ์พลาด โดยไม่ต้องใช้ dialog
      if (!secretAllArmedAt || (now - secretAllArmedAt) > armedWindowMs) {
        setSecretAllArmedAt(now);
        setPageMessage({
          type: 'info',
          text: `ℹ️ โหมดลับพร้อมแล้ว — พิมพ์ all ซ้ำอีกครั้งภายใน ${Math.floor(armedWindowMs / 1000)} วินาที เพื่อรับสินค้าค้างรับทั้งหมด`,
        });
        playBeep();
        barcodeInputRef?.current?.focus?.();
        barcodeInputRef?.current?.select?.();
        return;
      }

      setSecretAllArmedAt(0);

      if (!pendingList.length) {
        setPageMessage({ type: 'info', text: 'ℹ️ ไม่มีรายการค้างรับให้รับเข้าทั้งหมด' });
        playBeep();
        barcodeInputRef?.current?.focus?.();
        barcodeInputRef?.current?.select?.();
        return;
      }

      if (!receiveAllPendingNoSNAction) {
        setPageMessage({ type: 'error', text: '❌ Store ยังไม่มี receiveAllPendingNoSNAction' });
        playErrorBeep();
        barcodeInputRef?.current?.focus?.();
        barcodeInputRef?.current?.select?.();
        return;
      }

      setSubmitting(true);
      try {
        const bulkResult = await receiveAllPendingNoSNAction({ receiptId });
        await Promise.all([
          loadBarcodesAction(receiptId),
          loadReceiptWithSupplierAction(receiptId),
        ]);
        const receivedCount = Number(bulkResult?.receivedCount || pendingList.length || 0);
        setPageMessage({ type: 'success', text: `✅ รับสินค้าค้างรับทั้งหมดสำเร็จ ${receivedCount} รายการ` });
        playBeep();
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'รับสินค้าค้างรับทั้งหมดไม่สำเร็จ';
        setPageMessage({ type: 'error', text: `❌ ${msg}` });
        playErrorBeep();
      } finally {
        setSubmitting(false);
        barcodeInputRef?.current?.focus?.();
        barcodeInputRef?.current?.select?.();
      }
      return;
    }

    // 🔐 ถ้าผู้ใช้ยังพิมพ์ secret code ไม่ครบ เช่น a / al ให้เงียบไว้ก่อน
    if (!keepSN) {
      const secret = String(SECRET_RECEIVE_ALL_CODE || '').toLowerCase();
      const lower = barcode.toLowerCase();
      if (secret && secret.startsWith(lower) && lower !== secret) {
        barcodeInputRef?.current?.focus?.();
        return;
      }
    }

    const found = barcodes.find((b) => b.barcode === barcode);
    if (!found) {
      setSecretAllArmedAt(0);
      setPageMessage({ type: 'error', text: '❌ ไม่พบบาร์โค้ดนี้ในรายการที่ต้องรับเข้าสต๊อก' });
      playErrorBeep();
      setBarcodeInput('');
      barcodeInputRef?.current?.focus?.();
      return;
    }

    const sold =
      String(found?.stockItem?.status || '').toUpperCase() === 'SOLD' ||
      found?.stockItem?.soldAt != null ||
      found?.stockItem?.saleItem?.id != null;

    if (sold) {
      setSecretAllArmedAt(0);
      setPageMessage({ type: 'error', text: '❌ บาร์โค้ดนี้ถูกขายไปแล้ว (SOLD) ไม่สามารถรับเข้าสต๊อกได้' });
      playErrorBeep();
      setBarcodeInput('');
      barcodeInputRef?.current?.focus?.();
      barcodeInputRef?.current?.select?.();
      return;
    }

    if (isScanned(found)) {
      setSecretAllArmedAt(0);
      setPageMessage({ type: 'info', text: 'ℹ️ บาร์โค้ดนี้รับเข้าสต๊อกแล้ว' });
      playErrorBeep();
      setBarcodeInput('');
      barcodeInputRef?.current?.focus?.();
      barcodeInputRef?.current?.select?.();
      return;
    }

    setSecretAllArmedAt(0);
    if (keepSN && !snInput.trim()) {
      setSnError('กรุณายิง/กรอก SN ก่อนยืนยัน');
      return;
    }

    // ✅ โหมดคลัง: enqueue ทันที แล้วให้ยิงตัวถัดไปได้เลย (ไม่ต้องรอ API)
    const accepted = enqueueScan({
      barcode,
      serialNumber: keepSN ? snInput.trim() : null,
      keepSN,
    });

    setBarcodeInput('');
    setSnInput('');
    setInputStartTime(null);
    setSnError('');

    // โฟกัสกลับทันที (เพื่อยิงต่อเนื่อง)
    barcodeInputRef?.current?.focus?.();
    barcodeInputRef?.current?.select?.();

    if (!accepted) {
      setPageMessage({ type: 'info', text: 'ℹ️ ข้ามรายการซ้ำในคิว' });
      playBeep();
      return;
    }

    processQueue();
  };
  // Finalize ใบรับครั้งเดียวตอนจบงาน
  const handleFinalize = async () => {
    if (!receiptId) return;
    setSubmitting(true);
    try {
      if (!finalizeReceiptIfNeededAction) {
        setPageMessage({ type: 'error', text: '❌ Store ยังไม่มี finalizeReceiptIfNeededAction' });
        setSubmitting(false);
        return;
      }
      await finalizeReceiptIfNeededAction(receiptId);
      await Promise.all([
        loadBarcodesAction(receiptId),
        loadReceiptWithSupplierAction(receiptId),
      ]);
      setPageMessage({ type: 'success', text: '✅ Finalize ใบรับสำเร็จ' });
      playBeep();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Finalize ไม่สำเร็จ';
      setPageMessage({ type: 'error', text: `❌ ${msg}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📦 รับสินค้าเข้าสต๊อก (PO #{purchaseOrderCode || receiptId})</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1 rounded bg-gray-100">รวม: <b>{totalCount}</b></span>
          <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">ค้างรับ: <b>{pendingCount}</b></span>
          <span className="px-3 py-1 rounded bg-green-100 text-green-700">รับแล้ว: <b>{scannedCount}</b></span>
        </div>
      </div>

      {pageMessage && (
        <div
          key={pageMessage.text}
          className={`px-4 py-2 text-sm border rounded ${pageMessage.type === 'error' ? 'bg-red-100 text-red-700 border-red-300' :
              pageMessage.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' :
                'bg-blue-100 text-blue-700 border-blue-300'
            }`}
        >
          {pageMessage.text}
        </div>
      )}

      {/* Controls row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Scan bar (left) */}
        <section className="col-span-12 lg:col-span-4">
          <div className="bg-white border rounded p-3 h-full">
            <form id="scan-form" onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  ref={barcodeInputRef}
                  className="border rounded px-4 py-2 font-mono w-[360px] md:w-[420px] max-w-full"
                  placeholder="ยิงบาร์โค้ด... (F2 โฟกัสช่องสแกน)"
                  value={barcodeInput}
                  disabled={submitting}
                  onChange={(e) => {
                    if (!inputStartTime) setInputStartTime(Date.now());
                    const next = e.target.value;
                    setBarcodeInput(next);
                    // ✅ Warehouse UX: ยิงเสร็จให้ auto submit เมื่อเป็น scanner burst
                    scheduleAutoSubmit(next);
                  }}
                  onKeyDown={(e) => {
                    // ✅ Warehouse UX: Enter = submit ทันที (รองรับกรณี scanner ยิง Enter)
                    if (e.key === 'Enter') {
                      setTimeout(() => {
                        setInputStartTime(null);
                      }, 0);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'กำลังบันทึก...' : 'ยิงเข้าสต๊อก'}
                </button>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm">
                  <input type="radio" name="keepSN" value="false" checked={!keepSN} onChange={() => setKeepSN(false)} disabled={submitting} /> ไม่เก็บ SN
                </label>
                <label className="text-sm">
                  <input type="radio" name="keepSN" value="true" checked={keepSN} onChange={() => setKeepSN(true)} disabled={submitting} /> ต้องเก็บ SN (ยิง SN ถัดไป)
                </label>
              </div>
              <div className="text-xs text-gray-500">F2 โฟกัสช่องสแกน · F3 สลับโหมด SN · F4 Finalize</div>
              {keepSN && (
                <div className="pt-1 space-y-1">
                  <input
                    ref={snInputRef}
                    type="text"
                    placeholder="ยิง SN..."
                    className="border rounded px-4 py-2 w-80 font-mono"
                    value={snInput}
                    disabled={submitting}
                    onChange={(e) => { setSnInput(e.target.value); if (snError) setSnError(''); }}
                  />
                  {snError ? (
                    <div className="text-red-600 text-sm">{snError}</div>
                  ) : (
                    <div className="text-gray-500 text-xs">* โปรดยิง SN จริงก่อนกดยืนยัน</div>
                  )}
                </div>
              )}
            </form>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleFinalize}
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Finalize ใบรับ
              </button>
            </div>
          </div>
        </section>

        {/* Supplier card (right) */}
        <aside className="col-span-12 lg:col-span-8">
          {currentReceipt?.purchaseOrder?.supplier && (
            <div className="bg-white border rounded p-4 shadow-sm h-full">
              <div className="text-blue-700 font-semibold mb-2">💳 เครดิตของ Supplier</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>ชื่อ: {currentReceipt.purchaseOrder.supplier.name}</div>
                <div>วงเงิน: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(currentReceipt.purchaseOrder.supplier.creditLimit || 0)}</div>
                <div>คงเหลือ: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(currentReceipt.purchaseOrder.supplier.creditBalance || 0)}</div>
                <div>มัดจำ: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(currentReceipt.purchaseOrder.supplier.debitAmount || 0)}</div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <h2 className="text-base font-semibold mb-2">Expected (ยังไม่ยิง) {pendingCount}</h2>

          {/* 🧭 Warehouse UX (โหดขึ้น): Sticky "Next" + ไฮไลต์บรรทัดถัดไป */}
          {pendingList?.length > 0 && (
            <div className="mb-2 px-3 py-2 rounded border bg-yellow-50 text-sm">
              <div className="font-semibold text-yellow-900">Next to scan</div>
              <div className="font-mono text-yellow-900">{pendingList[0]?.barcode || '-'}</div>
              <div className="text-yellow-800 truncate">{resolveProductName(pendingList[0])}</div>
            </div>
          )}

          <div className="overflow-x-auto border rounded bg-white">
            {pendingList.length === 0 ? (
              <div className="text-gray-500 text-sm p-3">ไม่มีรายการค้างรับ</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-50 text-left sticky top-0">
                    <th className="px-3 py-2 w-14">#</th>
                    <th className="px-3 py-2">สินค้า</th>
                    <th className="px-3 py-2">บาร์โค้ด</th>
                    <th className="px-3 py-2">SN</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingList.map((b, idx) => {
                    const productName = resolveProductName(b);
                    const isNext = idx === 0;
                    const isTypingMatch = barcodeInput && String(b?.barcode || '') === String(barcodeInput).trim();
                    return (
                      <tr
                        key={b.id || `${b.barcode}-${idx}`}
                        className={`border-t ${isNext ? 'bg-yellow-100' : isTypingMatch ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">{productName}</td>
                        <td className="px-3 py-2 font-mono">{b?.barcode || '-'}</td>
                        <td className="px-3 py-2 font-mono">-</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <h2 className="text-base font-semibold mb-2">Scanned (รับแล้ว) {scannedCount}</h2>
          <div className="overflow-x-auto border rounded bg-white">
            {scannedList.length === 0 ? (
              <div className="text-gray-500 text-sm p-3">ยังไม่มีสินค้าที่ถูกยิง</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-50 text-left">
                    <th className="px-3 py-2 w-14">#</th>
                    <th className="px-3 py-2">สินค้า</th>
                    <th className="px-3 py-2">บาร์โค้ด</th>
                    <th className="px-3 py-2">SN</th>
                    <th className="px-3 py-2">สถานะ</th>
                    <th className="px-3 py-2 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedList.map((b, idx) => {
                    const isLot = b?.kind === 'LOT' || b?.simpleLotId != null;
                    const productName = resolveProductName(b);
                    const snText = isLot ? '-' : (b?.serialNumber || (b?.stockItemId ? b?.stockItem?.serialNumber : null) || '-');
                    const apiStockStatus = String(b?.stockItemStatus || '').toUpperCase();

                    // ✅ Status source of truth: ถ้ามี stockItem ให้ยึด stockItem.status จาก DB
                    const dbStockStatus = b?.stockItemId ? String(b?.stockItem?.status || '').toUpperCase() : '';

                    // ✅ Guardrail: ถ้ามีสัญญาณว่า SOLD ให้แสดง SOLD เสมอ (กันกรณี payload stale)
                    const soldFlag =
                      dbStockStatus === 'SOLD' ||
                      apiStockStatus === 'SOLD' ||
                      (b?.stockItemId ? (b?.stockItem?.soldAt != null || b?.stockItem?.saleItem?.id != null) : false);

                    const resolvedStockStatus = soldFlag
                      ? 'SOLD'
                      : (dbStockStatus || apiStockStatus || '-');

                    const hasStockItem = b?.stockItemId != null;

                    // ✅ ถ้ามี stockItem แล้ว ให้ยึดเป็น “รายชิ้น” (แสดงสถานะจาก stockItem) แม้ kind จะเป็น LOT
                    // เฉพาะ LOT จริง (ไม่มี stockItem) เท่านั้นที่จะแสดง LOT / SN_RECEIVED
                    const statusText = hasStockItem
                      ? resolvedStockStatus
                      : (String(b?.status || '').toUpperCase() === 'SN_RECEIVED' ? 'LOT / SN_RECEIVED' : 'LOT');
                    return (
                      <tr
                        key={b.id || `${b.barcode}-${idx}`}
                        className={`border-t transition-colors ${lastFlashBarcode && String(b?.barcode || '') === String(lastFlashBarcode)
                            ? 'bg-green-100'
                            : ''
                          }`}
                      >
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">{productName}</td>
                        <td className="px-3 py-2 font-mono">{b.barcode}</td>
                        <td className="px-3 py-2 font-mono">{snText}</td>
                        <td className="px-3 py-2">{statusText}</td>
                        <td className="px-3 py-2 text-right">—</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;








