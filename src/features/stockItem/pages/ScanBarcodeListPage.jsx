








// ScanBarcodeListPage.jsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import PendingBarcodeTable from '../components/PendingBarcodeTable';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

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
    finalizeReceiptIfNeededAction,
    clearErrorAction,
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

  // ✅ นับสถานะสแกนให้ครอบคลุมทั้ง SN & LOT
  // SN: ถือว่าสแกนแล้วถ้ามี stockItemId หรือ stockItem.id
  // LOT: ถือว่าสแกนแล้วถ้า status === 'SN_RECEIVED' (ตาม Prisma enum)
  const isScanned = (b) => {
    // ✅ SN: ให้ยึด "stockItemId" ของ barcodeReceiptItem เท่านั้น
    // เหตุผล: บาง payload อาจแนบ b.stockItem มาจากระดับ receiptItem (shared) ทำให้เข้าใจผิดว่า "ทุกแถว" ถูกยิงแล้ว
    const snScanned = b?.stockItemId != null;

    // ✅ ตรวจว่า "สินค้านี้" ตั้งค่าโหมดสต๊อกเป็น SN (แยกรายชิ้น) หรือไม่
    // หมายเหตุ: รองรับ field name หลายแบบแบบ defensive เพื่อไม่ให้พังเมื่อ payload เปลี่ยน
    const stockModeRaw = String(
      b?.product?.stockMode ||
      b?.product?.stockBehavior ||
      b?.product?.stockTrackingMode ||
      b?.productStockMode ||
      b?.stockMode ||
      ''
    ).toUpperCase();
    const isProductSNMode = stockModeRaw.includes('SN');

    // ✅ ถ้าเป็นสินค้าโหมด SN ให้ถือว่าสแกนแล้วเฉพาะเมื่อมี stockItemId เท่านั้น
    // (กันเคสที่ API/FE อัปเดต status แบบ LOT/SN_RECEIVED ในระดับรายการ ทำให้ทุกแถวถูกนับว่ารับแล้ว)
    if (isProductSNMode) return snScanned;

    // ✅ LOT: ถือว่าสแกนแล้วถ้า status === 'SN_RECEIVED'
    const isLot = b?.kind === 'LOT' || b?.simpleLotId != null;
    const lotActivated = isLot && String(b?.status || '').toUpperCase() === 'SN_RECEIVED';

    return snScanned || lotActivated;
  };

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

    // 🔒 Guardrail: ถ้า SN เคยถูกขายแล้ว (SOLD / มี saleItem / มี soldAt) ห้ามรับเข้าสต๊อก
    // เหตุผล: StockItem 1 ชิ้นขายได้ครั้งเดียว (SaleItem.stockItemId unique)
    const sold =
      String(found?.stockItem?.status || '').toUpperCase() === 'SOLD' ||
      found?.stockItem?.soldAt != null ||
      found?.stockItem?.saleItem?.id != null;

    if (sold) {
      setPageMessage({ type: 'error', text: '❌ บาร์โค้ดนี้ถูกขายไปแล้ว (SOLD) ไม่สามารถรับเข้าสต๊อกได้' });
      playErrorBeep();
      setBarcodeInput('');
      if (barcodeInputRef?.current) {
        barcodeInputRef.current.focus();
        barcodeInputRef.current.select?.();
      }
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
      const raw = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      const msg = String(raw);
      const already = /already|ซ้ำ|SN_RECEIVED/i.test(msg);

      if (already) {
        // กรณีสแกนซ้ำ: ถือว่า idempotent → รีเฟรชแล้วแจ้งเตือนแบบข้อมูล
        refreshBarcodesDebounced();
        setPageMessage({ type: 'info', text: 'ℹ️ บาร์โค้ดนี้ถูกบันทึกไว้แล้ว' });
        playBeep();
        setBarcodeInput('');
        setSnInput('');
      } else {
        setPageMessage({ type: 'error', text: `❌ ${msg || 'เกิดข้อผิดพลาดระหว่างบันทึกเข้าสต๊อก'}` });
        playErrorBeep();
      }
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
                    const productName = b?.productName || b?.product?.name || '-';
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
                      <tr key={b.id || `${b.barcode}-${idx}`} className="border-t">
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










