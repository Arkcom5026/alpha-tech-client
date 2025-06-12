// ✅ ScanBarcodeListPage.jsx — แสดง PendingBarcodeTable + InStockBarcodeTable และ input สำหรับยิงบาร์โค้ด
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import PendingBarcodeTable from '../components/PendingBarcodeTable';
import InStockBarcodeTable from '../components/InStockBarcodeTable';
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
  const snInputRef = useRef(null);

  const {
    loadBarcodesAction,
    loading,
    barcodes,
    receiveSNAction,
  } = useBarcodeStore();

  useEffect(() => {
    if (receiptId) {
      loadBarcodesAction(receiptId);
    }
  }, [receiptId, loadBarcodesAction]);

  useEffect(() => {
    if (keepSN && snInputRef.current) {
      snInputRef.current.focus();
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const barcode = barcodeInput.trim();
    if (!barcode) return;

    const found = barcodes.find((b) => b.barcode === barcode);
    if (!found) {
      alert('❌ ไม่พบบาร์โค้ดนี้ในรายการที่ต้องรับเข้าสต๊อก');
      return;
    }

    const payload = {
      barcode,
      serialNumber: keepSN ? snInput.trim() : barcode,
      keepSN,
    };

    await receiveSNAction(payload);
    setBarcodeInput('');
    setSnInput('');
    setInputStartTime(null);
    setSnError('');
    playBeep();
    loadBarcodesAction(receiptId); // ✅ โหลดใหม่ทุกครั้งโดยไม่ต้องเช็คเงื่อนไข
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">
        📦 รายการสินค้าที่ต้องยิง SN (ใบสั่งซื้อ #{purchaseOrderCode || receiptId})
      </h1>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            className="border rounded px-4 py-2 w-80 font-mono"
            placeholder="ยิงบาร์โค้ด..."
            value={barcodeInput}
            onChange={(e) => {
              if (!inputStartTime) setInputStartTime(Date.now());
              setBarcodeInput(e.target.value);
            }}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ยิงเข้าสต๊อก
          </button>
        </div>

        <div className="flex gap-6 pt-1 pl-1">
          <label>
            <input
              type="radio"
              name="keepSN"
              value="false"
              checked={!keepSN}
              onChange={() => setKeepSN(false)}
            />{' '}
            ไม่เก็บ SN
          </label>
          <label>
            <input
              type="radio"
              name="keepSN"
              value="true"
              checked={keepSN}
              onChange={() => setKeepSN(true)}
            />{' '}
            ต้องเก็บ SN (ยิง SN ถัดไป)
          </label>
        </div>

        {keepSN && (
          <div className="pt-2 pl-1 space-y-1">
            <input
              ref={snInputRef}
              type="text"
              placeholder="ยิง SN..."
              className="border rounded px-4 py-2 w-80 font-mono"
              value={snInput}
              onChange={(e) => setSnInput(e.target.value)}
            />
            {snError && <div className="text-red-600 text-sm pl-1">{snError}</div>}
            {!snError && (
              <div className="text-gray-500 text-sm pl-1">
                * โปรดยิง SN จริงของสินค้านี้ก่อนกดยืนยัน เพื่อบันทึกเข้าสต๊อก
              </div>
            )}
          </div>
        )}
      </form>

      <PendingBarcodeTable loading={loading} />

      <div className="pt-10">
        <h2 className="text-lg font-semibold mb-2">✅ รายการที่ยิงเข้าสต๊อกแล้ว</h2>
        <InStockBarcodeTable />
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;
