// ✅ ScanBarcodeListPage.jsx — ปรับเงื่อนไขการนับ scanned/pending ให้ตรงกับ API (stockItemObj)
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import PendingBarcodeTable from '../components/PendingBarcodeTable';
import InStockBarcodeTable from '../components/InStockBarcodeTable';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import { finalizeReceiptIfNeeded } from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';

const ScanBarcodeListPage = () => {
  const { receiptId } = useParams();
  const [searchParams] = useSearchParams();
  const purchaseOrderCode = searchParams.get('code');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [snInput, setSnInput] = useState('');
  const [keepSN, setKeepSN] = useState(false);
  const [inputStartTime, setInputStartTime] = useState(null);
  const [snError, setSnError] = useState('');
  const [pageMessage, setPageMessage] = useState(null);
  const snInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  const {
    loadBarcodesAction,
    loading,
    barcodes,
    receiveSNAction,
    currentReceipt,
    loadReceiptWithSupplierAction,
  } = useBarcodeStore();

  useEffect(() => {
    if (receiptId) {
      loadBarcodesAction(receiptId);
      loadReceiptWithSupplierAction(receiptId);
    }
  }, [receiptId, loadBarcodesAction, loadReceiptWithSupplierAction]);

  useEffect(() => {
    if (keepSN && snInputRef.current) snInputRef.current.focus();
  }, [keepSN]);

  const playBeep = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  };

  const playErrorBeep = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  };

  // ✅ รองรับทั้ง stockItemId และ stockItem object
  const isScanned = (b) => b?.stockItemId != null || b?.stockItem?.id != null;

  const scannedList = useMemo(() => barcodes.filter(isScanned), [barcodes]);
    const pendingList = useMemo(() => barcodes.filter((b) => !isScanned(b)), [barcodes]);

  const pendingCount = pendingList.length;
  const scannedCount = scannedList.length;
  const totalCount = barcodes.length;

  // 🔄 Debounced refresh หลังยิงสำเร็จ (ลด GET ซ้ำซ้อน)
  const refreshTimeoutRef = useRef(null);
  const refreshBarcodesDebounced = () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      if (receiptId) loadBarcodesAction(receiptId);
    }, 600);
  };
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  // 🔒 กันยิงซ้ำ & ล็อกปุ่มระหว่างส่ง & ล็อกปุ่มระหว่างส่ง
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmit, setLastSubmit] = useState({ barcode: '', at: 0 });

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
        setKeepSN((v) => !v);
        setTimeout(() => {
          if (!keepSN) snInputRef.current?.focus();
          else barcodeInputRef.current?.focus();
        }, 0);
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (!receiptId) return;
        setSubmitting(true);
        finalizeReceiptIfNeeded(receiptId)
          .then(async () => {
            await Promise.all([
              loadBarcodesAction(receiptId),
              loadReceiptWithSupplierAction(receiptId),
            ]);
            setPageMessage({ type: 'success', text: '✅ Finalize ใบรับสำเร็จ' });
            playBeep();
          })
          .catch(() => setPageMessage({ type: 'error', text: '❌ Finalize ไม่สำเร็จ' }))
          .finally(() => setSubmitting(false));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [receiptId, keepSN, loadBarcodesAction, loadReceiptWithSupplierAction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setPageMessage(null);

    const barcode = (barcodeInput || '').trim();
    if (!barcode) return;

    const now = Date.now();
    if (lastSubmit.barcode === barcode && now - lastSubmit.at < 800) {
      setPageMessage({ type: 'info', text: 'ℹ️ ข้ามการยิงซ้ำ (ภายใน 0.8 วินาที)' });
      return;
    }

    const found = barcodes.find((b) => b.barcode === barcode);
    if (!found) {
      setPageMessage({ type: 'error', text: '❌ ไม่พบบาร์โค้ดนี้ในรายการที่ต้องรับเข้าสต๊อก' });
      playErrorBeep();
      return;
    }

    // กันยิงซ้ำ: ถ้าบาร์โค้ดนี้รับเข้าสต๊อกแล้ว ให้ข้าม
    if (isScanned(found)) {
      setPageMessage({ type: 'info', text: 'ℹ️ บาร์โค้ดนี้รับเข้าสต๊อกแล้ว' });
      playErrorBeep();
      setBarcodeInput('');
      if (barcodeInputRef?.current) {
        barcodeInputRef.current.focus();
        barcodeInputRef.current.select?.();
      }
      return;
    }

    if (keepSN && !snInput.trim()) {
      setSnError('กรุณายิง/กรอก SN ก่อนยืนยัน');
      return;
    }

    const payload = { barcode, serialNumber: keepSN ? snInput.trim() : null, keepSN };

    let success = false;
    try {
      setSubmitting(true);
      setLastSubmit({ barcode, at: now });

      await receiveSNAction(payload);
      // Refresh (debounced) แทนการ GET ทุกนัด
      refreshBarcodesDebounced();

      setBarcodeInput('');
      setSnInput('');
      setInputStartTime(null);
      setSnError('');
      setPageMessage({ type: 'success', text: '✅ บันทึกการรับเข้าสต๊อกสำเร็จ' });
      playBeep();
      success = true;
    } catch (err) {
      const msg = err?.response?.data?.error?.toString?.() || 'เกิดข้อผิดพลาดระหว่างบันทึกเข้าสต๊อก';
      setPageMessage({ type: 'error', text: `❌ ${msg}` });
    } finally {
      setSubmitting(false);
      if (success && barcodeInputRef?.current) {
        // ตั้งโฟกัสกลับไปที่ช่องยิงบาร์โค้ดทุกครั้งที่บันทึกสำเร็จ
        barcodeInputRef.current.focus();
        if (typeof barcodeInputRef.current.select === 'function') {
          barcodeInputRef.current.select();
        }
      }
    }
  };
  // Finalize ใบรับครั้งเดียวตอนจบงาน
  const handleFinalize = async () => {
    if (!receiptId) return;
    setSubmitting(true);
    try {
      await finalizeReceiptIfNeeded(receiptId);
      await Promise.all([
        loadBarcodesAction(receiptId),
        loadReceiptWithSupplierAction(receiptId),
      ]);
      setPageMessage({ type: 'success', text: '✅ Finalize ใบรับสำเร็จ' });
      playBeep();
    } catch {
      setPageMessage({ type: 'error', text: '❌ Finalize ไม่สำเร็จ' });
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
          className={`px-4 py-2 text-sm border rounded ${
            pageMessage.type === 'error' ? 'bg-red-100 text-red-700 border-red-300' :
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
                    setBarcodeInput(e.target.value);
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
                  <input type="radio" name="keepSN" value="false" checked={!keepSN} onChange={() => setKeepSN(false)} disabled={submitting}/> ไม่เก็บ SN
                </label>
                <label className="text-sm">
                  <input type="radio" name="keepSN" value="true" checked={keepSN} onChange={() => setKeepSN(true)} disabled={submitting}/> ต้องเก็บ SN (ยิง SN ถัดไป)
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
          <div className="overflow-visible">
            <PendingBarcodeTable loading={!pendingList.length && loading} items={pendingList} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <h2 className="text-base font-semibold mb-2">Scanned (รับแล้ว) {scannedCount}</h2>
          <div className="overflow-visible">
            <InStockBarcodeTable items={scannedList} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;









 