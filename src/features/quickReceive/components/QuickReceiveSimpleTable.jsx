
// =============================================================================
// File: src/features/quickReceive/components/QuickReceiveSimpleTable.jsx
// =============================================================================
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const QuickReceiveSimpleTable = ({ items = [], setItems }) => {
  const modeLabel = (m) => (m === 'SIMPLE' ? 'Simple' : (m === 'STRUCTURED' ? 'Structure' : '-'));
  const handleQtyChange = (id, value) => {
    const qty = Number(value) || 0;
    setItems(items.map((it) => it.id === id ? { ...it, qty } : it));
  };

  const handleCostPriceChange = (id, value) => {
    const costPrice = Number(value) || 0;
    setItems(items.map((it) => it.id === id ? { ...it, costPrice } : it));
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-blue-100">
          <TableRow>
            <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
            <TableHead className="text-center w-[130px]">ประเภท</TableHead>
            <TableHead className="text-center w-[130px]">ลักษณะ</TableHead>
            <TableHead className="text-center w-[130px]">รูปแบบ</TableHead>
            <TableHead className="text-center w-[160px]">ชื่อสินค้า</TableHead>
            <TableHead className="text-center w-[120px]">รุ่น</TableHead>
            <TableHead className="text-center w-[130px]">ประเภทสินค้า</TableHead>
            <TableHead className="text-center w-[90px]">จำนวน</TableHead>
            <TableHead className="text-center w-[110px]">ราคา/หน่วย</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(items) && items.length > 0 ? (
            items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{it.category || '-'}</TableCell>
                <TableCell>{it.productType || '-'}</TableCell>
                <TableCell>{it.productProfile || '-'}</TableCell>
                <TableCell>{it.productTemplate || '-'}</TableCell>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.model || '-'}</TableCell>
                <TableCell className="text-center">{modeLabel(it.mode ?? 'SIMPLE')}</TableCell>
                <TableCell className="text-right">
                  <input type="number" step="0.01"
                    className="w-20 h-8 text-right border rounded p-1"
                    placeholder="0.00"
                    value={it.qty || ''}
                    min={0}
                    onChange={(e) => handleQtyChange(it.id, e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <input type="number" step="0.01"
                    className="w-24 h-8 text-right border rounded p-1"
                    placeholder="0.00"
                    value={it.costPrice || ''}
                    min={0}
                    onChange={(e) => handleCostPriceChange(it.id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                ยังไม่มีรายการสินค้า
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuickReceiveSimpleTable;

