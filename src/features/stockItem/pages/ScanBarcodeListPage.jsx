// ✅ ScanBarcodeListPage.jsx — หน้ายิง SN จากรายการ BarcodeReceiptItem

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { receiveStockItem } from '../api/stockItemApi';
import apiClient from '@/utils/apiClient';

const ScanBarcodeListPage = () => {
  const { receiptItemId } = useParams();
  const [barcodeList, setBarcodeList] = useState([]); // จาก backend
  const [scannedList, setScannedList] = useState([]); // SN ที่ยิงแล้ว
  const [inputBarcode, setInputBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  // โหลดรายการ barcode ทั้งหมดของ receiptItemId
  useEffect(() => {
    const fetchBarcodes = async () => {
      try {
        const res = await apiClient.get(`/barcode-receipt-items/by-receipt-item/${receiptItemId}`);
        setBarcodeList(res.data || []);
      } catch (err) {
        console.error('❌ โหลดบาร์โค้ดล้มเหลว:', err);
      }
    };
    if (receiptItemId) fetchBarcodes();
  }, [receiptItemId]);

  const handleScan = async () => {
    const found = barcodeList.find((b) => b.barcode === inputBarcode && !b.stockItemId);
    if (!found) {
      alert('❌ ไม่พบบาร์โค้ดนี้ หรืออาจยิงไปแล้ว');
      setInputBarcode('');
      return;
    }

    try {
      setLoading(true);
      const result = await receiveStockItem({ barcode: inputBarcode, receiptItemId });

      setScannedList((prev) => [...prev, found]);
      setBarcodeList((prev) => prev.filter((b) => b.barcode !== inputBarcode));
      setInputBarcode('');
    } catch (err) {
      console.error('[receiveStockItem]', err);
      alert('เกิดข้อผิดพลาดในการยิง SN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">🎯 ยิง SN เข้าสต๊อก</h1>

      <Input
        placeholder="ยิงหรือกรอกบาร์โค้ดที่นี่"
        value={inputBarcode}
        onChange={(e) => setInputBarcode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        disabled={loading}
      />

      {/* รายการที่รอยิง */}
      <div>
        <h2 className="text-lg font-semibold mt-6">📋 รอยิง SN ({barcodeList.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Barcode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barcodeList.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.barcode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* รายการที่ยิงแล้ว */}
      <div>
        <h2 className="text-lg font-semibold mt-6">✅ เข้าสต๊อกแล้ว ({scannedList.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Barcode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scannedList.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.barcode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ScanBarcodeListPage;
