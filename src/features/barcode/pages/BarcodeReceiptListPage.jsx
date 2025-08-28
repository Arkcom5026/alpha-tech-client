// src/features/stockItem/pages/BarcodeReceiptListPage.jsx
import React, { useEffect } from 'react';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import BarcodePrintTable from '../controllers/BarcodePrintTable';



const BarcodeReceiptListPage = () => {
  const {
    // ใช้ข้อมูลสรุปจาก "ใบรับสินค้า" โดยตรง
    receiptSummaries,
    loadReceiptSummariesAction,
    loading,
    error,
  } = usePurchaseOrderReceiptStore();

  useEffect(() => {
    loadReceiptSummariesAction({ printed: false });
  }, [loadReceiptSummariesAction]);

  const hasData = Array.isArray(receiptSummaries) && receiptSummaries.length > 0;
  const showError = !loading && error && !hasData;

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
            onClick={() => loadReceiptSummariesAction({ printed: false })}
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {!loading && (hasData || !error) && (
        <BarcodePrintTable receipts={receiptSummaries || []} />
      )}
    </div>
  );
};

export default BarcodeReceiptListPage;