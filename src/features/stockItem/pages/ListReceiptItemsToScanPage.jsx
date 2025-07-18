// ✅ ListReceiptItemsToScanPage.jsx — แสดงรายการใบตรวจรับที่พร้อมให้ยิงบาร์โค้ด

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  const { receipts, loadReceiptsWithBarcodesAction, loading } = useBarcodeStore();

  useEffect(() => {
    loadReceiptsWithBarcodesAction();
  }, [loadReceiptsWithBarcodesAction]);

  const filteredReceipts = receipts.filter((r) => r.total > r.scanned);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-blue-800">📄 ใบตรวจรับสินค้าที่พร้อมยิง SN</h1>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : !filteredReceipts || filteredReceipts.length === 0 ? (
        <p className="text-gray-600">ยังไม่มีใบตรวจรับที่รอยิงบาร์โค้ด</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่ใบสั่งซื้อ</TableHead>
              <TableHead>เลขที่ใบตรวจรับ</TableHead>
              <TableHead>เลขที่ใบกำกับภาษี</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>จำนวนบาร์โค้ด</TableHead>
              <TableHead>ยิงแล้ว</TableHead>
              
              <TableHead>ยอดมัดจำ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.purchaseOrderCode}</TableCell>
                <TableCell>{r.code}</TableCell>
                <TableCell>{r.tax}</TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell>{r.total}</TableCell>
                <TableCell>{r.scanned}</TableCell>
                
                <TableCell className="text-blue-700">฿{r.debitAmount?.toLocaleString() || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/pos/purchases/receipt/items/scan/${r.id}?code=${r.purchaseOrderCode}`)}
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
