// ✅ ListReceiptItemsToScanPage.jsx — แสดงใบตรวจรับสินค้าที่มีบาร์โค้ดแล้ว ในรูปแบบตาราง

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBarcodeStore from '../store/barcodeStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  const { receipts, loadReceiptsWithBarcodesAction, loading } = useBarcodeStore();

  useEffect(() => {
    loadReceiptsWithBarcodesAction();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-blue-800">📄 ใบตรวจรับสินค้าที่พร้อมยิง SN</h1>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : receipts.length === 0 ? (
        <p className="text-gray-600">ยังไม่มีใบตรวจรับที่สร้างบาร์โค้ดแล้ว</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่ใบตรวจรับ</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>จำนวนบาร์โค้ด</TableHead>
              <TableHead>ยิงแล้ว</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.code}</TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell>{r.total}</TableCell>
                <TableCell>{r.scanned}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/pos/purchases/receipt/items/scan/${r.id}`)}
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
