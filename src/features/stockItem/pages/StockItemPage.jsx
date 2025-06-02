// ✅ StockItemPage.jsx — หน้าแสดงรายการ SN และฟอร์มเพิ่ม

import React, { useEffect } from 'react';
import StockItemForm from '../components/StockItemForm';
import StockItemTable from '../components/ReceivedSNTable';
import useStockItemStore from '../store/stockItemStore';
import { useParams } from 'react-router-dom';

const StockItemPage = () => {
  const { receiptId } = useParams();
  const { loadStockItemsByReceipt } = useStockItemStore();

  useEffect(() => {
    if (receiptId) {
      loadStockItemsByReceipt(receiptId);
    }
  }, [receiptId, loadStockItemsByReceipt]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">รายการ SN ที่รับเข้าสต๊อก</h1>
      <StockItemForm receiptId={receiptId} />
      <StockItemTable />
    </div>
  );
};

export default StockItemPage;
