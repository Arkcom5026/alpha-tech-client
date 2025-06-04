// ✅ ScanBarcodeListPage.jsx — แสดง PendingBarcodeTable + InStockBarcodeTable และ input สำหรับยิงบาร์โค้ด
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import PendingBarcodeTable from '../components/PendingBarcodeTable';
import InStockBarcodeTable from '../components/InStockBarcodeTable';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const ScanBarcodeListPage = () => {
  const { receiptId } = useParams();
  const [searchParams] = useSearchParams();
  const purchaseOrderCode = searchParams.get('code');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [inputStartTime, setInputStartTime] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const timeTaken = Date.now() - inputStartTime;
    // 🔧 ชั่วคราว: ปิดการตรวจเวลาสำหรับใช้ copy/paste ระหว่างพัฒนา
    // if (timeTaken > 500) {
    //   alert('❌ กรุณาใช้เครื่องยิงบาร์โค้ด ห้ามพิมพ์เอง');
    //   return;
    // }

    const barcode = barcodeInput.trim();
    const found = barcodes.find((b) => b.barcode === barcode);
    if (!found) {
      alert('❌ ไม่พบบาร์โค้ดนี้ในรายการที่ต้องรับเข้าสต๊อก');
      return;
    }

    await receiveSNAction(barcode);
    setBarcodeInput('');
    setInputStartTime(null);
    await loadBarcodesAction(receiptId);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">
        📦 รายการสินค้าที่ต้องยิง SN (ใบสั่งซื้อ #{purchaseOrderCode || receiptId})
      </h1>

      {/* ✅ Input ยิงบาร์โค้ด */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
