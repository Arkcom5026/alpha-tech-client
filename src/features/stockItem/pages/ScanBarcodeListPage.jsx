// src/features/stockItem/pages/ScanBarcodeListPage.jsx
// 🏛️ Premium Next-Gen Influx Terminal: (Reactive Auto-Pilot & Fixed Focus Hijacking Edition)

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
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
    receiveSNAction,
    currentReceipt,
    loadReceiptWithSupplierAction,
    finalizeReceiptIfNeededAction,
    clearErrorAction,
    receiveAllPendingNoSNAction,
    updateReceivedSNAction,
  } = useBarcodeStore();

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

  // 🟢 [REACTIVE PILOT LOGIC]: ตรวจสอบว่าสินค้าที่ค้างอยู่ในตารางผลกรอง เป็นสินค้าชนิดเดียวกันทั้งหมดแบบ 100% หรือไม่
  const isUniformProduct = useMemo(() => {
    if (pendingList.length === 0) return false;
    const firstProduct = resolveProductName(pendingList[0]);
    return pendingList.every((b) => resolveProductName(b) === firstProduct);
  }, [pendingList, resolveProductName]);

  // 🟢ดึงค่าหัวคิว Expected หลังผ่านตัวกรอง Text Search เพื่อป้อนฝังรอ
  const currentExpectedPlaceholder = pendingList.length > 0 ? String(pendingList[0]?.barcode || '') : '';

  const focusBarcodeInput = useCallback(() => {
    try {
      requestAnimationFrame(() => {
        // 🟢 [FORCE INTENT FOCUS]: หากอยู่ภายใต้โหมดรหัสโรงงานตลอดยอดคิว และมีสินค้าค้างอยู่ ให้ดีดโฟกัสลงช่อง SN ทันทีโดยไม่ต้องสนว่าโฟกัสค้างที่อื่น
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

  // 🚀 [SMART AUTO-PILOT COUPLING]: ตัวขับเคลื่อนปรับสวิตช์วิทยุและโยกเลนโฟกัสอัจฉริยะตามไอเดียของกัปตัน
  useEffect(() => {
    if (isUniformProduct) {
      setKeepSN(true); // ดีดเปิดโหมดสแกนรหัสโรงงาน/SN ทันทีโดยไม่ต้องใช้มือพนักงานกดเลือก
      
      // 🟢 [FORCE SN COUPLING OVERRIDE]: สั่งเคลียร์และดีดตัดหน้าโฟกัสเดิมลงไปที่ช่อง SN ทันทีเพื่อให้พนักงานยิง One-Shot ต่อได้เลยโดยไม่ต้องกดเมาส์สลับ
      const t = setTimeout(() => {
        if (document.activeElement !== filterInputRef.current) {
          snInputRef.current?.focus?.();
          snInputRef.current?.select?.();
        }
      }, 60);
      return () => clearTimeout(t);
    } else {
      setKeepSN(false); // คืนค่ากลับสู่โหมดคละสินค้าปกติเพื่อความปลอดภัยสูงสุดคลังสินค้า
    }
  }, [isUniformProduct]);

  const triggerSuccessFlash = useCallback((barcode) => {
    const b = String(barcode || '').trim();
    if (!b) return;
    setLastFlashBarcode(b);
    setLastFlashAt(Date.now());
  }, []);

  // 🟢 [ROUTINE LATCH]: ตัวคุมระเบียบล็อกเลนโฟกัสของหน้าจอหลักเมื่อเกิดการเปลี่ยนแปลงโหมด keepSN
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
          playBeep();
          triggerSuccessFlash(barcode);
        } catch (err) {
          const raw = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
          const msg = String(raw);
          if (/already|ซ้ำ|SN_RECEIVED/i.test(msg)) {
            refreshBarcodesDebounced();
            setPageMessage({ type: 'info', text: `ℹ️ ลงทะเบียนในคลังไว้แล้ว: ${barcode}` });
            playBeep();
          } else {
            setPageMessage({ type: 'error', text: `❌ บันทึกเหลว [${barcode}]: ${msg}` });
            playErrorBeep();
          }
        } finally {
          if (ok) await new Promise((r) => setTimeout(r, 20));
        }
      }
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
      
      // 🟢 [LOOP FOCUS RESTORE]: หลังจากสแกนชุดคิวเสร็จงาน ให้สั่งหน่วงเวลาเล็กน้อยแล้วดีดตัวเคอร์เซอร์กลับเข้าช่อง SN ทันทีเพื่อรอยิงกล่องถัดไปแบบ Zero-Mouse 
      setTimeout(() => {
        focusBarcodeInput();
      }, 30);
    }
  }, [lastSubmit, receiveSNAction, refreshBarcodesDebounced, triggerSuccessFlash, focusBarcodeInput]);

  const scheduleAutoSubmit = useCallback((nextValue) => {
    try {
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      const v = String(nextValue || '').trim();
      if (!v) return;
      if (!keepSN) {
        const secret = String(SECRET_RECEIVE_ALL_CODE || '').toLowerCase();
        if (secret && secret.startsWith(v.toLowerCase())) return;
      }
      if ((Date.now() - (inputStartTime || Date.now())) <= 250) {
        autoSubmitTimeoutRef.current = setTimeout(() => {
          document.getElementById('scan-form')?.requestSubmit?.();
        }, 140);
      }
    } catch (_) {}
  }, [inputStartTime, keepSN]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'F2') { e.preventDefault(); focusBarcodeInput(); }
      if (e.key === 'F3') { e.preventDefault(); setKeepSN((prev) => !prev); }
      if (e.key === 'F4') { e.preventDefault(); handleFinalize(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [receiptId, focusBarcodeInput, handleFinalize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageMessage(null);

    const nextExpectedBarcode = pendingList.length > 0 ? String(pendingList[0]?.barcode || '').trim() : '';
    let barcode = String(barcodeInput || '').trim().replace(/\r|\n/g, '').replace(/\s+/g, '');
    
    // 🚀 [SMART ENFORCED]: ดึงค่าอัตโนมัติมา Match ทันทีหากตัวกรองของกัปตันล็อกสินค้าชนิดเดียวกันเรียบร้อย
    if (!barcode && keepSN && nextExpectedBarcode) {
      barcode = nextExpectedBarcode;
    }

    if (!barcode) { focusBarcodeInput(); return; }

    if (barcode.toLowerCase() === SECRET_RECEIVE_ALL_CODE) {
      const now = Date.now();
      setBarcodeInput(''); setSnInput(''); setInputStartTime(null); setSnError('');
      if (!secretAllArmedAt || now - secretAllArmedAt > 2500) {
        setSecretAllArmedAt(now);
        setPageMessage({ type: 'info', text: `ℹ️ โหมดลับพร้อมรัน — พิมพ์ all ซ้ำภายใน 2.5 วินาที เพื่อรวบยอดรับสินค้าค้างรับในกลุ่มกรองนี้ทั้งหมด` });
        playBeep(); focusBarcodeInput(); return;
      }
      setSecretAllArmedAt(0);
      if (!pendingList.length) { setPageMessage({ type: 'info', text: 'ℹ️ คลังสต๊อกกลุ่มตัวกรองนี้เคลียร์ยอดครบแล้ว' }); playBeep(); focusBarcodeInput(); return; }
      setSubmitting(true);
      try {
        const bulkResult = await receiveAllPendingNoSNAction({ receiptId });
        await Promise.all([loadBarcodesAction(receiptId), loadReceiptWithSupplierAction(receiptId)]);
        setPageMessage({ type: 'success', text: `✅ รวบยอดรับกลุ่มพัสดุสำเร็จสำเร็จเรียบร้อย` });
        playBeep();
      } catch (err) {
        setPageMessage({ type: 'error', text: `❌ รวบยอดเหลว: ${err?.message}` });
        playErrorBeep();
      } fontFinally: { setSubmitting(false); focusBarcodeInput(); }
      return;
    }

    const found = barcodes.find((b) => b.barcode === barcode);
    if (!found) {
      setSecretAllArmedAt(0); setPageMessage({ type: 'error', text: '❌ ตรวจไม่พบรหัสบาร์โค้ดชิ้นนี้ในบัญชีค้างรับของบิล' });
      playErrorBeep(); setBarcodeInput(''); focusBarcodeInput(); return;
    }

    if (String(found?.stockItem?.status || '').toUpperCase() === 'SOLD') {
      setSecretAllArmedAt(0); setPageMessage({ type: 'error', text: '❌ พัสดุรหัสซีเรียลนี้ระบุสเตตัส SOLD ห้ามนำกลับมาบันทึกซ้ำ' });
      playErrorBeep(); setBarcodeInput(''); focusBarcodeInput(); return;
    }

    if (isScanned(found)) {
      setSecretAllArmedAt(0); setPageMessage({ type: 'info', text: 'ℹ️ บาร์โค้ดแถวพัสดุชิ้นนี้ สแกนป้อนสต๊อกเสร็จสมบูรณ์เรียบร้อยแล้ว' });
      playErrorBeep(); setBarcodeInput(''); focusBarcodeInput(); return;
    }

    setSecretAllArmedAt(0);
    if (keepSN && !snInput.trim()) { setSnError('กรุณายิง/ระบุข้อมูล Serial Number เพื่อแนบคลังด้วยครับ'); snInputRef.current?.focus?.(); return; }

    const accepted = enqueueScan({ barcode, serialNumber: keepSN ? snInput.trim() : null, keepSN });
    
    // 🟢 [UI PROTECTION]: ล้างค่า barcodeInput เฉพาะเมื่อไม่ได้ใช้งานระบบ Auto-Pilot ล็อกเลน (เพื่อรักษาตัวเลขรหัสระบบสีเข้มเด่นชัดคาจอไว้)
    if (!keepSN) {
      setBarcodeInput('');
    }
    
    setSnInput(''); 
    setInputStartTime(null); 
    setSnError('');
    
    if (!accepted) {
      setPageMessage({ type: 'info', text: 'ℹ️ ข้ามรายการคิวประมวลผลซ้ำซ้อน' });
      playBeep();
      focusBarcodeInput();
      return;
    }
    processQueue();
  };

  const startEditSN = (barcodeReceipt) => {
    const status = String(barcodeReceipt?.stockItem?.status || barcodeReceipt?.stockItemStatus || '').toUpperCase();
    if (status === 'SOLD') { setPageMessage({ type: 'error', text: '❌ สินค้าสถานะ SOLD ไม่สามารถปรับแก้ไขรหัสซีเรียลได้' }); playErrorBeep(); focusBarcodeInput(); return; }
    if (!barcodeReceipt?.stockItemId) { setPageMessage({ type: 'error', text: '❌ รายการนี้ยังไม่มีกล่องสต๊อกรองรับสำหรับแก้ SN' }); playErrorBeep(); focusBarcodeInput(); return; }
    setEditingBarcodeReceiptId(barcodeReceipt.id);
    setEditingSN(String(barcodeReceipt?.stockItem?.serialNumber || barcodeReceipt?.serialNumber || '').trim());
    setPageMessage(null);
  };

  const cancelEditSN = () => { setEditingBarcodeReceiptId(null); setEditingSN(''); focusBarcodeInput(); };

  const saveEditSN = async (barcodeReceipt) => {
    const nextSN = String(editingSN || '').trim();
    if (!nextSN) { setPageMessage({ type: 'error', text: '❌ กรุณากรอกข้อมูลรหัสซีเรียลนัมเบอร์ก่อนสั่งบันทึก' }); playErrorBeep(); return; }
    setEditingSubmitting(true);
    try {
      await updateReceivedSNAction({ stockItemId: barcodeReceipt.stockItemId, serialNumber: nextSN, barcodeReceiptId: barcodeReceipt.id, receiptId });
      await Promise.all([loadBarcodesAction(receiptId), loadReceiptWithSupplierAction(receiptId)]);
      setEditingBarcodeReceiptId(null); setEditingSN('');
      setPageMessage({ type: 'success', text: `✅ บันทึกปรับปรุงรหัส SN พัสดุสำเร็จ: ${barcodeReceipt.barcode}` });
      playBeep();
    } catch (err) {
      setPageMessage({ type: 'error', text: `❌ แก้ไขเหลว: ${err?.message}` });
      playErrorBeep();
    } finally { setEditingSubmitting(false); focusBarcodeInput(); }
  };

  return (
    <div className="w-full h-full p-2 md:p-3 space-y-2 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn font-sans antialiased text-xs md:text-sm">
      
      {/* 🟦 1. บาร์ควบคุมคุมสิทธิ์กะทัดรัด (Compact Header) */}
      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 rounded-lg">
            <Box className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-slate-900 flex items-center gap-1.5">
              รับสินค้าเข้าสต๊อก <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">PO #{purchaseOrderCode || receiptId}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 font-black text-[11px] font-sans">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/50">รวมใบรับ: {totalCount}</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 flex items-center gap-1"><span className="h-1 w-1 bg-amber-500 rounded-full animate-pulse" /> ค้างรวม: {pendingCount}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 flex items-center gap-1"><span className="h-1 w-1 bg-emerald-500 rounded-full" /> รับแล้ว: {scannedCount}</span>
        </div>

        <button
          type="button"
          onClick={() => { const targetSlug = shopSlug || 'advancetech'; navigate(`/${targetSlug}/pos/purchases/receipt/items`); }}
          className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>กลับหน้าบิลค้างรับ</span>
        </button>
      </div>

      {pageMessage && (
        <div className={`px-3 py-1.5 text-xs font-black border rounded-lg animate-fadeIn flex items-center gap-1.5 select-none ${pageMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' : pageMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          {pageMessage.text}
        </div>
      )}

      {/* 🟦 2. แผงคอนโซลควบคุมอินพุตและบล็อกเครดิต Supplier */}
      <div className="grid grid-cols-12 gap-2.5 items-stretch">
        <section className="col-span-12 lg:col-span-5 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between w-full gap-2">
            <form id="scan-form" onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Barcode className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    ref={barcodeInputRef}
                    
                    /* 🟢 [FIXED VALUE COUPLING]: ดีดฝังค่าหัวคิว Expected ลงเป็น Value ตัวจริงสีเข้มทันทีเมื่อเปิดใช้งานโหมด Auto-Pilot */
                    value={keepSN && currentExpectedPlaceholder ? currentExpectedPlaceholder : barcodeInput}
                    
                    /* 🟢 [HIGH-CONTRAST OVERRIDE]: คุมทับเบราว์เซอร์ด้วยสามัญสำนึก ไม่ให้ปล่อยให้ตัวหนังสือจางเป็นสีเทา แม้ช่องอินพุตจะโดนปิด Disabled */
                    className="h-8 pl-8 pr-3 text-xs font-bold bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 font-mono w-full rounded-lg outline-none transition-all disabled:opacity-100 disabled:bg-slate-100 disabled:text-slate-900"
                    
                    placeholder="ยิงบาร์โค้ดระบบ..."
                    disabled={keepSN && pendingList.length > 0} 
                    onChange={(e) => {
                      if (!inputStartTime) setInputStartTime(Date.now());
                      const next = e.target.value; setBarcodeInput(next); scheduleAutoSubmit(next);
                    }}
                  />
                </div>
                <button type="submit" disabled={submitting} className="h-8 px-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm">
                  ยิงเข้าสต๊อก
                </button>
              </div>

              {/* 🟢 [CLEAN & MINIMAL RADIO BUTTONS]: ยุบข้อความให้เหลือสั้น กระชับ คลีนตาตามหลัก User Energy First */}
              <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 border-t border-slate-100 pt-1.5 select-none">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                  <input type="radio" name="keepSN" checked={!keepSN} onChange={() => setKeepSN(false)} disabled={submitting} className="accent-orange-500 h-3.5 w-3.5" />
                  <span>ไม่เก็บ SN</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                  <input type="radio" name="keepSN" checked={keepSN} onChange={() => setKeepSN(true)} disabled={submitting} className="accent-orange-500 h-3.5 w-3.5" />
                  <span className="text-orange-600 font-black">🔥 เก็บ SN</span>
                </label>
              </div>

              {keepSN && (
                <div className="space-y-1 pt-0.5 animate-fadeIn">
                  <input 
                    ref={snInputRef} 
                    type="text" 
                    placeholder={currentExpectedPlaceholder ? `ยิงรหัสโรงงานข้างกล่องของบาร์โค้ดระบบ [${currentExpectedPlaceholder}]...` : "ยิงรหัส SN บนตัวกล่องอุปกรณ์..."} 
                    className="h-8 px-2.5 text-xs font-black bg-white border border-orange-400/50 focus:border-orange-500 font-mono w-full rounded-lg outline-none shadow-sm" 
                    value={snInput} 
                    disabled={submitting || pendingList.length === 0} 
                    onChange={(e) => { setSnInput(e.target.value); if (snError) setSnError(''); }} 
                  />
                  {snError && <div className="text-rose-600 text-[10px] font-black flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> {snError}</div>}
                </div>
              )}
            </form>

            <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[9px] font-black text-slate-400 select-none">
              <div className="flex gap-2">[F2] ช่องสแกน · [F3] โหมด · [F4] ปิดบิล</div>
              <button type="button" onClick={handleFinalize} disabled={submitting} className="h-6 px-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-lg text-[10px] transform active:scale-95 transition-all shadow-sm border border-orange-400/10">Finalize ใบรับ</button>
            </div>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-7 flex">
          {currentReceipt?.purchaseOrder?.supplier ? (
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm w-full flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 select-none mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {currentReceipt.purchaseOrder.supplier.name}
                </h3>
                
                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-500">
                  <div className="bg-slate-50/60 border border-slate-200/40 p-1.5 rounded-lg shadow-inner">
                    <span className="block text-[9px] opacity-60 mb-0.5">วงเงินสูงสุด:</span>
                    <span className="font-mono font-black text-slate-800">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(currentReceipt.purchaseOrder.supplier.creditLimit || 0)}</span>
                  </div>
                  <div className="bg-slate-50/60 border border-slate-200/40 p-1.5 rounded-lg shadow-inner">
                    <span className="block text-[9px] opacity-60 mb-0.5">เครดิตคงเหลือ:</span>
                    <span className="font-mono font-black text-blue-600">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(currentReceipt.purchaseOrder.supplier.creditBalance || 0)}</span>
                  </div>
                  <div className="bg-slate-50/60 border border-slate-200/40 p-1.5 rounded-lg shadow-inner">
                    <span className="block text-[9px] opacity-60 mb-0.5">เงินมัดจำล่วงหน้า:</span>
                    <span className="font-mono font-black text-emerald-600">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(currentReceipt.purchaseOrder.supplier.debitAmount || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[9px] font-bold text-slate-400 flex items-center gap-0.5 select-none opacity-80">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> สิทธิ์โครงสร้างบัญชีผูกขาดความปลอดภัยระดับองค์กรพาร์ตเนอร์ Tenant ส่วนกลาง
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-3 w-full flex items-center justify-center text-xs font-bold text-slate-400 select-none">
              📭 กำลังถอดสลักคัดกรองข้อมูลเครดิตสรุปยอดบัญชีซัพพลายเออร์...
            </div>
          )}
        </aside>
      </div>

      {/* 🟦 3. ตารางคิว Expected และ Scanned */}
      <div className="grid grid-cols-12 gap-3 items-start pt-0.5">
        
        {/* ตารางฝั่งซ้าย: รายการพัสดุค้างยิง (Expected Queue) */}
        <div className="col-span-12 xl:col-span-4 space-y-1.5">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> ผลกรองค้างยิง (Expected) [{pendingList.length}]
          </h2>

          {/* แผงตัวกรองข้อความค้นหาด่วน */}
          <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl space-y-1 select-none">
            <div className="text-[10px] font-black text-slate-500 flex items-center gap-1">
              <Search className="w-3 h-3 text-orange-500" /> กรองระบุกลุ่มสินค้าค้างยิงด่วน:
            </div>
            <div className="relative">
              <input 
                type="text"
                ref={filterInputRef}
                className="h-8 pl-3 pr-8 text-xs font-black bg-white border border-slate-200 focus:border-orange-500 outline-none w-full rounded-lg shadow-sm transition-all"
                placeholder="พิมพ์ชื่อแบรนด์, สี, รุ่นย่อย เช่น '664 Y', 'GT-52 M'..."
                value={textFilter}
                onChange={(e) => {
                  setTextFilter(e.target.value);
                }}
              />
              {textFilter && (
                <button 
                  type="button" 
                  onClick={() => { setTextFilter(''); }} 
                  className="absolute right-2.5 top-2 text-[10px] font-black text-slate-400 hover:text-rose-600 underline"
                >
                  ล้าง
                </button>
              )}
            </div>
            {/* 🟢 [UI FEEDBACK]: แจ้งเตือนเม็ดอัจฝริยะบอกผู้ใช้หน้าร้านว่าระบบกำลังเปิด Auto-Pilot ให้แล้ว */}
            {isUniformProduct && (
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 flex items-center gap-1 animate-pulse">
                ✨ ล็อกเลนประเภทสินค้าแล้ว: เปิดโหมด One-Shot ยิงเฉพาะ SN ได้ทันที
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white max-h-[440px] overflow-y-auto">
            {pendingList.length === 0 ? (
              <div className="text-slate-400 font-bold italic text-xs text-center py-10 select-none">✅ ยอดกลุ่มค้นหานี้หมดแล้ว หรือเงื่อนไขตัวกรองเคลียร์สต๊อกครบถ้วน</div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black uppercase tracking-wider sticky top-0 select-none text-[10px]">
                    <th className="p-2 w-10 text-center">#</th>
                    <th className="p-2">โมเดลสินค้า</th>
                    <th className="p-2 font-mono w-28 text-center">รหัสบาร์โค้ด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px]">
                  {pendingList.map((b, idx) => {
                    const isNext = idx === 0;
                    return (
                      <tr key={b.id || `${b.barcode}-${idx}`} className={`border-t transition-colors ${isNext ? 'bg-amber-500/[0.03] text-amber-950 font-black' : 'hover:bg-slate-50/50'}`}>
                        <td className="p-2 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2 truncate max-w-[130px]">{resolveProductName(b)}</td>
                        <td className="p-2 font-mono font-bold text-slate-900 text-center">{b?.barcode || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ตารางฝั่งขวา: รายการประวัติรับพัสดุสำเร็จเข้าสต๊อกแล้วองค์รวม */}
        <div className="col-span-12 xl:col-span-8 space-y-1.5">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> ตรวจรับเข้าคลังแล้วองค์รวม (Scanned) [{scannedList.length}]
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white max-h-[516px] overflow-y-auto">
            {scannedList.length === 0 ? (
              <div className="text-slate-400 font-bold italic text-xs text-center py-12 select-none">ยังไม่มีชุดรหัสอุปกรณ์พัสดุถูกยิงบันทึกรับในรอบสแกนปัจจุบัน</div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-black uppercase tracking-wider sticky top-0 select-none text-[10px]">
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5">โมเดลรายละเอียดชื่อสินค้าพัสดุ</th>
                    <th className="p-2.5 font-mono w-24 text-center">รหัสบาร์โค้ด</th>
                    <th className="p-3 font-mono w-44">บาร์โค้ดโรงงาน / ซีเรียลนัมเบอร์ (SN)</th>
                    <th className="p-2.5 w-24 text-center">สถานะสต๊อก</th>
                    <th className="p-2.5 text-center w-24">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
                  {scannedList.map((b, idx) => {
                    const isLot = b?.kind === 'LOT' || b?.simpleLotId != null;
                    const snText = isLot ? '-' : b?.serialNumber || (b?.stockItemId ? b?.stockItem?.serialNumber : null) || '-';
                    const apiStockStatus = String(b?.stockItemStatus || '').toUpperCase();
                    const dbStockStatus = b?.stockItemId ? String(b?.stockItem?.status || '').toUpperCase() : '';

                    const soldFlag = dbStockStatus === 'SOLD' || apiStockStatus === 'SOLD' || (b?.stockItemId ? b?.stockItem?.soldAt != null || b?.stockItem?.saleItem?.id != null : false);
                    const resolvedStockStatus = soldFlag ? 'SOLD' : dbStockStatus || apiStockStatus || '-';
                    const hasStockItem = b?.stockItemId != null;
                    const canEditSN = hasStockItem && !isLot && !soldFlag;
                    const isEditingRow = editingBarcodeReceiptId === b?.id;

                    const statusText = hasStockItem ? resolvedStockStatus : String(b?.status || '').toUpperCase() === 'SN_RECEIVED' ? 'LOT / SN_RECEIVED' : 'LOT';
                    const flashMatch = lastFlashBarcode && String(b?.barcode || '') === String(lastFlashBarcode);

                    return (
                      <tr key={b.id || `${b.barcode}-${idx}`} className={`border-t hover:bg-slate-50/50 transition-colors duration-200 ${flashMatch ? 'bg-emerald-500/[0.04] text-emerald-950 font-black' : ''}`}>
                        <td className="p-2.5 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-black text-slate-900 truncate max-w-[210px]" title={resolveProductName(b)}>{resolveProductName(b)}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-400 text-center">{b.barcode}</td>
                        
                        <td className="p-2.5">
                          {isEditingRow ? (
                            <input
                              type="text"
                              className="h-7 border border-slate-200 rounded-lg px-2 w-36 font-mono font-black text-slate-900 bg-white focus:border-orange-500 outline-none text-xs shadow-inner"
                              value={editingSN}
                              disabled={editingSubmitting}
                              onChange={(e) => setEditingSN(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); saveEditSN(b); }
                                if (e.key === 'Escape') { e.preventDefault(); cancelEditSN(); }
                              }}
                            />
                          ) : (
                            <span className="font-mono text-slate-700">{snText}</span>
                          )}
                        </td>

                        <td className="p-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 font-black text-[9px] uppercase px-1.5 py-0.5 rounded border ${statusText === 'SOLD' ? 'bg-slate-100 text-slate-400 border-slate-200' : statusText.startsWith('IN_STOCK') || statusText === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700 border-emerald-500/10' : 'bg-blue-50 text-blue-700 border-blue-500/10'}`}>
                            {statusText === 'SOLD' ? 'จำหน่ายแล้ว' : statusText === 'IN_STOCK' ? 'พร้อมขาย' : statusText}
                          </span>
                        </td>

                        <td className="p-2.5 text-center select-none">
                          {isEditingRow ? (
                            <div className="flex items-center justify-center gap-1 transform scale-90 select-none">
                              <button type="button" onClick={() => saveEditSN(b)} disabled={editingSubmitting} className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded text-[10px]">เซฟ</button>
                              <button type="button" onClick={cancelEditSN} disabled={editingSubmitting} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px]">ออก</button>
                            </div>
                          ) : canEditSN ? (
                            <button type="button" onClick={() => startEditSN(b)} disabled={editingSubmitting || submitting} className="h-6 px-2 rounded-lg border border-blue-200 text-blue-700 font-black hover:bg-blue-50 text-[10px] shadow-sm bg-white">แก้ SN</button>
                          ) : soldFlag ? (
                            <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 border border-slate-200/40 rounded">SOLD OUT</span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
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