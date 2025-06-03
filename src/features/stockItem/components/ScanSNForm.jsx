// ✅ ScanSNForm.jsx — ฟอร์มยิง SN เข้าสต๊อก

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useStockItemStore from '../store/stockItemStore';

const ScanSNForm = ({ receiptItemId }) => {
  const [barcode, setBarcode] = useState('');
  const { scannedList, receiveSNAction, loading } = useStockItemStore();

  const handleSubmit = async () => {
    if (!barcode) return;
    await receiveSNAction({ barcode, receiptItemId });
    setBarcode('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="ยิงหรือกรอกบาร์โค้ดที่นี่"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button className="mt-2" onClick={handleSubmit} disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'ยืนยันบาร์โค้ด'}
        </Button>
      </div>

      <div>
        <h3 className="font-semibold mb-2">รายการที่ยิงแล้ว</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scannedList.map((item, index) => (
              <TableRow key={item.barcode}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.barcode}</TableCell>
                <TableCell>{item.status === 'success' ? '✅ สำเร็จ' : '❌ ผิดพลาด'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ScanSNForm;
