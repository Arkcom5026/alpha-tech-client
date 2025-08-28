// ✅ ListReceiptItemsToScanPage.jsx — แสดงรายการใบตรวจรับที่พร้อมให้ยิงบาร์โค้ด (ปรับ format สกุลเงิน/วันที่ + useMemo)

import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';


const thDate = new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  const { receipts, loadReceiptsWithBarcodesAction, loading } = useBarcodeStore();

  useEffect(() => {
    loadReceiptsWithBarcodesAction();
  }, [loadReceiptsWithBarcodesAction]);

  const filteredReceipts = useMemo(() => {
  const rows = (receipts || []).map((r) => ({
    ...r,
    pending: Math.max(0, (r.total ?? 0) - (r.scanned ?? 0)),
  }));
  return rows
    .filter((r) => r.pending > 0)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}, [receipts]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-blue-800">📄 ใบตรวจรับสินค้าที่พร้อมยิง SN</h1>

      {/* สรุปสั้น ๆ */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-gray-100">ทั้งหมด: {receipts?.length ?? 0}</span>
        <span className="px-3 py-1 rounded-full bg-yellow-100">ค้างยิง: {filteredReceipts?.length ?? 0}</span>
        <span className="px-3 py-1 rounded-full bg-green-100">รับครบ: {(receipts?.length ?? 0) - (filteredReceipts?.length ?? 0)}</span>
      </div>

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
              <TableHead>ค้างรับ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.purchaseOrderCode}</TableCell>
                <TableCell>{r.code}</TableCell>
                <TableCell>{r.tax}</TableCell>
                <TableCell>{r.createdAt ? thDate.format(new Date(r.createdAt)) : '-'}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell>{r.total}</TableCell>
                <TableCell>{r.scanned}</TableCell>
                <TableCell className="text-blue-700">{r.pending}</TableCell>
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

