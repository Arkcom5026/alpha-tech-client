

// =============================================================================
// File: src/features/quickReceive/components/ProductSearchSimpleTable.jsx
// =============================================================================
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const fmt = (v) => (typeof v === 'number' ? v.toLocaleString() : (v ?? '-'));

const ProductSearchSimpleTable = ({ products = [], onSelect, autoHideSelected = true }) => {
  const [rows, setRows] = useState(products);
  useEffect(() => { setRows(products); }, [products]);
  const handleSelect = (item) => {
    onSelect && onSelect(item);
    if (autoHideSelected) setRows((prev) => prev.filter((p) => p.id !== item.id));
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
            <TableHead className="text-center w-[90px]">ราคาทุน</TableHead>
            <TableHead className="text-center w-[90px]">ราคาส่ง</TableHead>
            <TableHead className="text-center w-[90px]">ราคาช่าง</TableHead>
            <TableHead className="text-center w-[90px]">ราคาปลีก</TableHead>
            <TableHead className="text-center w-[110px]">ราคาออนไลน์</TableHead>
            <TableHead className="text-center w-[90px]">เลือก</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(rows) && rows.length > 0 ? (
            rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.category || '-'}</TableCell>
                <TableCell>{item.productType || '-'}</TableCell>
                <TableCell>{item.productProfile || '-'}</TableCell>
                <TableCell>{item.productTemplate || '-'}</TableCell>
                <TableCell>{item.name || '-'}</TableCell>
                <TableCell>{item.model || '-'}</TableCell>
                <TableCell className="text-center">{item.mode === 'SIMPLE' ? 'Simple' : (item.mode === 'STRUCTURED' ? 'Structure' : '-')}</TableCell>
                <TableCell className="text-right">{fmt(item.costPrice)}</TableCell>
                <TableCell className="text-right">{fmt(item.priceWholesale)}</TableCell>
                <TableCell className="text-right">{fmt(item.priceTechnician)}</TableCell>
                <TableCell className="text-right">{fmt(item.priceRetail)}</TableCell>
                <TableCell className="text-right">{fmt(item.priceOnline)}</TableCell>
                <TableCell className="text-center">
                  <button
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                    onClick={() => handleSelect(item)}
                  >
                    เพิ่ม
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={13} className="text-center text-muted-foreground">
                ไม่พบข้อมูลสินค้า
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductSearchSimpleTable;


