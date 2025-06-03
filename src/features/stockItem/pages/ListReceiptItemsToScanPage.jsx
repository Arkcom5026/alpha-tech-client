// ✅ ListReceiptItemsToScanPage.jsx — หน้ารวมรายการที่ยังไม่ยิง SN ครบ

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStockItemStore from '../store/stockItemStore';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  const { receiptItems, loadReceiptItemsByReceiptIdsAction, loading } = useStockItemStore();

  useEffect(() => {
    // 👇 ตัวอย่าง: ดึงจากหลาย receipt id (อาจต้องปรับในอนาคต)
    loadReceiptItemsByReceiptIdsAction([1, 2, 3]); // TODO: ปรับให้ดึงรายการล่าสุดจาก backend จริง
  }, []);

  const getScannedCount = (item) => item.stockItems?.length || 0;

  const isCompleted = (item) => getScannedCount(item) >= item.quantity;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">📦 รายการสินค้าที่ต้องยิง SN</h1>
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สินค้า</TableHead>
              <TableHead>จำนวนที่รับ</TableHead>
              <TableHead>ยิงแล้ว</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receiptItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.title || '-'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{getScannedCount(item)}</TableCell>
                <TableCell>
                  {isCompleted(item) ? '✅ ครบแล้ว' : '🟡 รอยิง SN'}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={isCompleted(item)}
                    onClick={() => navigate(`/pos/purchases/receipt/items/${item.id}`)}
                  >
                    🎯 ยิง SN
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ListReceiptItemsToScanPage;