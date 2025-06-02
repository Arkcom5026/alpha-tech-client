// src/features/stockItem/pages/PrintFromReceiptPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useStockItemStore from '../store/stockItemStore';
import BarcodePrintTable from '../components/BarcodePrintTable';

const PrintFromReceiptPage = () => {
  const { receiptId } = useParams();
  const { stockItems, loadStockItemsByReceipt, loading, error } = useStockItemStore();

  useEffect(() => {
    if (receiptId) {
      loadStockItemsByReceipt(receiptId);
    }
  }, [receiptId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">รายการสินค้าจากใบรับสินค้า #{receiptId}</h2>
      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {error && <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>}
      {!loading && !error && (
        <BarcodePrintTable items={stockItems} />
      )}
    </div>
  );
};

export default PrintFromReceiptPage;
