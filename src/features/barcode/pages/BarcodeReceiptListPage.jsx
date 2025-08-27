// src/features/stockItem/pages/BarcodeReceiptListPage.jsx
import React, { useEffect } from 'react';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

import BarcodePrintTable from '../controllers/BarcodePrintTable';

const BarcodeReceiptListPage = () => {
  const {
    receiptBarcodeSummaries,
    loadReceiptBarcodeSummariesAction,
    loading,
    error,
  } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    // โหลดรายการทันทีที่เข้าเพจ (เฉพาะยังไม่ได้พิมพ์)
    loadReceiptBarcodeSummariesAction({ printed: false });
  }, [loadReceiptBarcodeSummariesAction]);

  const hasData = Array.isArray(receiptBarcodeSummaries) && receiptBarcodeSummaries.length > 0;
  const showError = !loading && error && !hasData; // ❗ แสดง error เฉพาะกรณีที่ไม่มีข้อมูลเลยเท่านั้น

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด</h2>

      {loading && <p>กำลังโหลดข้อมูล...</p>}

      {showError && (
        <div className="text-red-600 space-x-2">
          <span>เกิดข้อผิดพลาด: {error.message || String(error)}</span>
          <button
            type="button"
            className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => loadReceiptBarcodeSummariesAction({ printed: false })}
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {!loading && (hasData || !error) && (
        <BarcodePrintTable receipts={receiptBarcodeSummaries || []} />
      )}
    </div>
  );
};

export default BarcodeReceiptListPage;
