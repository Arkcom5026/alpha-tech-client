// ✅ ScanSNPage.jsx — หน้ารับ SN เข้าสต๊อกจากใบรับสินค้า
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useStockItemStore from '../store/stockItemStore';
import ScanSNForm from '../components/ScanSNForm';

const ScanSNPage = () => {
  const { receiptItemId } = useParams();
  const { scannedList, clearScannedList } = useStockItemStore();

  useEffect(() => {
    clearScannedList();
  }, [receiptItemId]);

  if (!receiptItemId) {
    return <div className="text-red-500">❌ ไม่พบ receiptItemId</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">📦 ยิง SN เข้าสต๊อก</h1>
      <p className="text-muted-foreground">สำหรับรายการใบรับสินค้า #{receiptItemId}</p>

      <ScanSNForm receiptItemId={Number(receiptItemId)} />
    </div>
  );
};

export default ScanSNPage;
