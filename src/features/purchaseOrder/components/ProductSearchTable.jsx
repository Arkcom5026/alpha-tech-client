

import React, { useMemo, useState } from 'react';

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

// ProductSearchTable (สำหรับหน้า Create PO)
// - ยึดมาตรฐาน input จำนวนเงิน (กฎข้อ 78): placeholder "0.00", ชิดขวา, ถ้าเป็น 0 ให้แสดงเป็น ''
// - ไม่บังคับแปลงเป็นตัวเลขระหว่างพิมพ์ เพื่อให้ผู้ใช้ลบ/แก้ได้ลื่นไหล
// - คำนวณตัวเลขจริงเฉพาะตอน render/กดเพิ่ม
const ProductSearchTable = ({ results = [], onAdd }) => {
  // เก็บค่าแบบ raw string เพื่อ UX ที่ดีตอนพิมพ์
  const [quantities, setQuantities] = useState({}); // { [productId]: string }
  const [costPrices, setCostPrices] = useState({}); // { [productId]: string }
  const [removedIds, setRemovedIds] = useState([]);

  // ✅ UI-based error ต่อแถว (ห้ามใช้ alert/toast)
  const [rowErrors, setRowErrors] = useState({}); // { [productId]: string }

  const setRowError = (id, msg) => {
    setRowErrors((prev) => ({ ...prev, [id]: msg }));
  };

  const handleQuantityChange = (id, value) => {
    // อนุญาตเฉพาะตัวเลขบวก (จำนวนเต็ม) หรือค่าว่างระหว่างพิมพ์
    const cleaned = value.replace(/[^0-9]/g, '');
    setQuantities((prev) => ({ ...prev, [id]: cleaned }));
    if (rowErrors[id]) setRowError(id, '');
  };

  const handleCostPriceChange = (id, value) => {
    // อนุญาตเฉพาะตัวเลขและจุดทศนิยมเดียว หรือค่าว่าง
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); // ป้องกันหลายจุด
    setCostPrices((prev) => ({ ...prev, [id]: cleaned }));
    if (rowErrors[id]) setRowError(id, '');
  };

  const toQty = (raw) => {
    const n = parseInt(raw ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const toCost = (raw, fallback = 0) => {
    const n = parseFloat(raw ?? '');
    if (Number.isFinite(n) && n >= 0) return n;
    if (Number.isFinite(fallback) && fallback > 0) return fallback;
    return 0;
  };

  const handleAdd = (product) => {
    const qty = toQty(quantities[product.id]);
    const cost = toCost(costPrices[product.id], product.costPrice ?? 0);

    // ✅ กันตั้งแต่ต้นทาง: ไม่ให้เพิ่มถ้าราคาทุน = 0
    if (!Number.isFinite(cost) || cost <= 0) {
      setRowError(product.id, 'ไม่สามารถเพิ่มรายการได้: ต้องกำหนดราคาทุนก่อน (มากกว่า 0)');
      return;
    }

    onAdd({
      id: product.id,
      name: product.name,
      category: product.category,
      productType: product.productType,
      productProfile: product.productProfile,
      productTemplate: product.productTemplate,
      model: product.model,
      description: product.description,
      quantity: qty,
      costPrice: cost,
      totalPrice: qty * cost,
    });

    setQuantities((prev) => {
      const updated = { ...prev };
      delete updated[product.id];
      return updated;
    });

    setCostPrices((prev) => {
      const updated = { ...prev };
      delete updated[product.id];
      return updated;
    });

    setRowErrors((prev) => {
      const updated = { ...prev };
      delete updated[product.id];
      return updated;
    });

    setRemovedIds((prev) => [...prev, product.id]);
  };

  const visibleResults = useMemo(
    () => results.filter((p) => !removedIds.includes(p.id)),
    [results, removedIds]
  );

  return (
    <div className="rounded-md border overflow-x-auto mt-6 shadow-sm">
      <h3 className="text-md font-semibold px-4 pt-3 pb-2 text-gray-700">ผลการค้นหา</h3>
      <Table>
        <TableHeader className="bg-blue-100">
          <TableRow>
            <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
            <TableHead className="text-center w-[130px]">ประเภท</TableHead>
            <TableHead className="text-center w-[130px]">แบรนด์</TableHead>
            <TableHead className="text-center w-[130px]">สเปก</TableHead>
            <TableHead className="text-center w-[120px]">ชื่อสินค้า</TableHead>
                        <TableHead className="text-center w-[60px]">จำนวน</TableHead>
            <TableHead className="text-center w-[60px]">ราคา</TableHead>
            <TableHead className="text-center w-[80px]">ราคารวม</TableHead>
            <TableHead className="text-center w-[100px]">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleResults.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                ไม่พบรายการสินค้า กรุณาพิมพ์ชื่อหรือสแกนบาร์โค้ด
              </TableCell>
            </TableRow>
          ) : (
            visibleResults.map((product, index) => {
              const qty = toQty(quantities[product.id]);
              const cost = toCost(costPrices[product.id], product.costPrice ?? 0);
              const total = qty * cost;

              // ค่าแสดงในช่อง input (raw). สำหรับราคา: ถ้าค่า default เป็น 0 ให้แสดงเป็น '' ตามกฎ 78
              const rawQty = quantities[product.id] ?? '';
              const hasDefaultCost = (product.costPrice ?? 0) > 0;
              const rawCost = costPrices[product.id];
              const displayCost = rawCost !== undefined
                ? rawCost
                : hasDefaultCost
                  ? String(product.costPrice)
                  : '';

              return (
                <TableRow key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="align-middle">{product.category}</TableCell>
                  <TableCell className="align-middle">{product.productType}</TableCell>
                  <TableCell className="align-middle">{product.productProfile}</TableCell>
                  <TableCell className="align-middle">{product.productTemplate}</TableCell>
                  <TableCell className="align-middle">{product.name}</TableCell>
                  
                  <TableCell className="align-middle">
                    <input
                      type="number"
                      className="w-20 text-right border rounded p-1"
                      value={rawQty === '' ? '' : rawQty}
                      placeholder="1"
                      min={1}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                      }}
                      inputMode="numeric"
                    />
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <input
                      type="number"
                      className="w-24 text-right border rounded p-1"
                      value={displayCost}
                      placeholder="0.00"
                      min={0}
                      onChange={(e) => handleCostPriceChange(product.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                      }}
                      inputMode="decimal"
                    />
                  </TableCell>
                  <TableCell className="text-center align-middle">{total.toLocaleString()} ฿</TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <StandardActionButtons onAdd={() => handleAdd(product)} />
                      {!!rowErrors[product.id] && (
                        <div className="text-xs text-red-600" role="alert" aria-live="assertive">
                          {rowErrors[product.id]}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductSearchTable;


