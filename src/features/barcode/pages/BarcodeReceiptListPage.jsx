// src/features/stockItem/pages/PrintAllBarcodePage.jsx
import React, { useEffect } from 'react';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

import BarcodePrintTable from '../controllers/BarcodePrintTable';

const BarcodeReceiptListPage = () => {
  const { receiptBarcodeSummaries, loadReceiptBarcodeSummariesAction, loading, error } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    loadReceiptBarcodeSummariesAction();
  }, [loadReceiptBarcodeSummariesAction]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด</h2>
      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {error && <p className="text-red-500">เกิดข้อผิดพลาด: {error.message || String(error)}</p>}
      {!loading && !error && (
        <BarcodePrintTable receipts={receiptBarcodeSummaries} />
      )}
    </div>
  );
};

export default BarcodeReceiptListPage;




