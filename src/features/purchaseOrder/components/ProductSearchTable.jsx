// src/features/purchaseOrder/components/ProductSearchTable.jsx

import React, { useMemo, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ProductSearchTable = ({ results = [], onAdd }) => {
  const [quantities, setQuantities] = useState({}); 
  const [costPrices, setCostPrices] = useState({}); 
  const [removedIds, setRemovedIds] = useState([]);
  const [rowErrors, setRowErrors] = useState({}); 

  const setRowError = (id, msg) => {
    setRowErrors((prev) => ({ ...prev, [id]: msg }));
  };

  const handleQuantityChange = (id, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setQuantities((prev) => ({ ...prev, [id]: cleaned }));
    if (rowErrors[id]) setRowError(id, '');
  };

  const handleCostPriceChange = (id, value) => {
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); 
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
    const pId = Number(product.id);
    const qty = toQty(quantities[pId]);
    const cost = toCost(costPrices[pId], product.costPrice ?? 0);

    if (!Number.isFinite(cost) || cost <= 0) {
      setRowError(pId, 'ต้องระบุราคาทุนบิลก่อนกดยืนยัน (ห้ามเป็น 0)');
      return;
    }
    
    const brandLabel = product?.brand?.name ?? product?.brandName ?? product?.brand ?? product?.productProfile ?? '-';

    // 🟢 ENTERPRISE CONTRACT: บีบคีย์เป็น productId สากล สยบบั๊กเลเยอร์นับยอดเงินสะสม
    onAdd({
      id: pId,
      productId: pId, 
      name: product.name,
      category: product.category || '-',
      productType: product.productType || '-',
      productProfile: brandLabel,
      brandId: product?.brand?.id ?? product?.brandId ?? null,
      brandName: brandLabel,
      productTemplate: product.productTemplate || '-',
      model: product.model || '-',
      description: product.description || '',
      quantity: qty,
      costPrice: cost,
      totalPrice: qty * cost,
    });

    setQuantities((prev) => { const updated = { ...prev }; delete updated[pId]; return updated; });
    setCostPrices((prev) => { const updated = { ...prev }; delete updated[pId]; return updated; });
    setRowErrors((prev) => { const updated = { ...prev }; delete updated[pId]; return updated; });
    setRemovedIds((prev) => [...prev, pId]);
  };

  const visibleResults = useMemo(
    () => (results || []).filter((p) => p && !removedIds.includes(Number(p.id))),
    [results, removedIds]
  );

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden mt-4 bg-white shadow-sm animate-fadeIn">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h3 className="text-xs font-black text-slate-700 tracking-wide uppercase">ผลการค้นหาผลิตภัณฑ์ไอที/วัสดุอุปกรณ์</h3>
      </div>
      <div className="max-h-[320px] overflow-y-auto w-full">
        <Table className="w-full text-xs">
          <TableHeader className="bg-slate-100 border-b sticky top-0 z-20 shadow-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-600">หมวดหมู่</TableHead>
              <TableHead className="font-bold text-slate-600">ประเภท</TableHead>
              <TableHead className="font-bold text-slate-600">แบรนด์</TableHead>
              <TableHead className="font-bold text-slate-700 text-sm">ชื่อสินค้าควบคุมสิทธิ์</TableHead>
              <TableHead className="text-right font-bold text-slate-600 w-[110px]">จำนวนสั่ง</TableHead>
              <TableHead className="text-right font-bold text-slate-600 w-[130px]">ทุนนำเข้าปลีก</TableHead>
              <TableHead className="text-right font-bold text-slate-600 w-[130px]">คำนวณสุทธิ</TableHead>
              <TableHead className="text-center font-bold text-slate-600 w-[90px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-400 font-bold italic">
                  ไม่มีรายการสินค้าตามคำค้นหา กรุณาเลือกคัดกรองประเภทสินค้ากลุ่มไอทีด้านบน
                </TableCell>
              </TableRow>
            ) : (
              visibleResults.map((product, index) => {
                const pId = Number(product.id);
                const qty = toQty(quantities[pId]);
                const cost = toCost(costPrices[pId], product.costPrice ?? 0);
                const total = qty * cost;

                const rawQty = quantities[pId] ?? '';
                const hasDefaultCost = (product.costPrice ?? 0) > 0;
                const rawCost = costPrices[pId];
                const displayCost = rawCost !== undefined ? rawCost : (hasDefaultCost ? String(product.costPrice) : '');

                return (
                  <TableRow key={pId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <TableCell className="font-medium text-slate-500">{product.category || '-'}</TableCell>
                    <TableCell className="font-medium text-slate-500">{product.productType || '-'}</TableCell>
                    <TableCell className="font-medium text-slate-500">
                      {product?.brand?.name ?? product?.brandName ?? product?.brand ?? '-'}
                    </TableCell>
                    <TableCell className="font-black text-slate-900 text-sm tracking-tight">{product.name}</TableCell>
                    
                    <TableCell className="text-right">
                      <input
                        type="text"
                        className="w-20 text-right border border-slate-200 rounded-lg p-1 font-black text-xs focus:border-orange-500 outline-none shadow-sm"
                        value={rawQty}
                        placeholder="1"
                        onChange={(e) => handleQuantityChange(pId, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <input
                        type="text"
                        className="w-24 text-right border border-slate-200 rounded-lg p-1 font-black text-xs tabular-nums focus:border-orange-500 outline-none shadow-sm"
                        value={displayCost}
                        placeholder="0.00"
                        onChange={(e) => handleCostPriceChange(pId, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-black font-sans text-slate-950 tabular-nums text-sm">
                      ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center">
                        <StandardActionButtons onAdd={() => handleAdd(product)} />
                        {!!rowErrors[pId] && (
                          <p className="text-[10px] font-black text-rose-600 mt-1 animate-pulse">{rowErrors[pId]}</p>
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
    </div>
  );
};

export default ProductSearchTable;