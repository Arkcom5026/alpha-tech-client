// src/features/purchaseOrder/components/PurchaseOrderTable.jsx

import React, { useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const PurchaseOrderTable = ({ products = [], setProducts = () => {}, editable = true }) => {
  
  const handleUpdateLine = (productId, field, value) => {
    const targetId = Number(productId);
    setProducts((prev) =>
      (prev || []).map((p) => {
        const currentId = Number(p.productId || p.id);
        if (currentId !== targetId) return p;
        
        const updated = { ...p };
        if (field === 'quantity') {
          const clean = String(value || '').replace(/[^0-9]/g, '');
          updated.quantity = clean === '' ? '' : Math.max(1, parseInt(clean, 10) || 1);
        } else if (field === 'costPrice') {
          const clean = String(value || '')
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
          updated.costPrice = clean;
        }
        return updated;
      })
    );
  };

  const handleDeleteLine = (productId) => {
    const targetId = Number(productId);
    setProducts((prev) => (prev || []).filter((p) => Number(p.productId || p.id) !== targetId));
  };

  const grandTotal = useMemo(() => {
    return (products || []).reduce((sum, p) => {
      const q = parseInt(String(p.quantity || '0'), 10) || 0;
      const c = parseFloat(String(p.costPrice || '0')) || 0;
      return sum + (q * c);
    }, 0);
  }, [products]);

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white mt-6 shadow-sm animate-fadeIn">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h3 className="text-xs font-black text-slate-700 tracking-wide uppercase">รายการสินค้าในใบสั่งซื้อตะกร้าปัจจุบัน (PO Basket)</h3>
      </div>
      <div className="overflow-x-auto w-full">
        <Table className="w-full text-xs">
          <TableHeader className="bg-slate-100 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-600 w-[50px] text-center">#</TableHead>
              <TableHead className="font-bold text-slate-600">รายละเอียดผลิตภัณฑ์สากล</TableHead>
              <TableHead className="text-right font-bold text-slate-600 w-[120px]">จำนวนจัดซื้อ</TableHead>
              <TableHead className="text-right font-bold text-slate-600 w-[140px]">ราคาทุนบิล</TableHead>
              <TableHead className="text-right font-bold text-slate-600 w-[150px]">ราคารวมสุทธิ</TableHead>
              {editable && <TableHead className="text-center font-bold text-slate-600 w-[80px]">จัดการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={editable ? 6 : 5} className="text-center py-10 text-slate-400 font-bold italic">
                  ยังไม่มีรายการคัดเลือกในตะกร้าบิลจัดซื้อ กรุณาเลือกกดเพิ่มจากตารางด้านบน
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, idx) => {
                const currentId = Number(product.productId || product.id);
                const qty = parseInt(String(product.quantity || '0'), 10) || 0;
                const cost = parseFloat(String(product.costPrice || '0')) || 0;
                const lineTotal = qty * cost;

                return (
                  <TableRow key={currentId} className="border-t hover:bg-slate-50/20 tabular-nums">
                    <TableCell className="text-center font-bold text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-black text-slate-900 text-sm tracking-tight">{product.name}</div>
                      <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wide">
                        หมวด: {product.category || '-'} • ประเภท: {product.productType || '-'} • แบรนด์: {product.brandName || '-'}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {editable ? (
                        <input
                          type="text"
                          className="w-20 text-right border border-slate-200 rounded-lg p-1 font-black focus:border-orange-500 outline-none shadow-sm text-xs"
                          value={product.quantity}
                          onChange={(e) => handleUpdateLine(currentId, 'quantity', e.target.value)}
                        />
                      ) : (
                        <span className="font-black text-slate-800">{qty.toLocaleString()}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {editable ? (
                        <input
                          type="text"
                          className="w-24 text-right border border-slate-200 rounded-lg p-1 font-black focus:border-orange-500 outline-none shadow-sm text-xs"
                          value={product.costPrice}
                          onChange={(e) => handleUpdateLine(currentId, 'costPrice', e.target.value)}
                        />
                      ) : (
                        <span className="font-black text-slate-800">฿{cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right font-black text-slate-950 text-sm font-sans">
                      ฿{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>

                    {editable && (
                      <TableCell className="text-center">
                        <StandardActionButtons onDelete={() => handleDeleteLine(currentId)} />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}

            {products.length > 0 && (
              <TableRow className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900 hover:bg-transparent">
                <TableCell colSpan={4} className="text-right text-xs font-black uppercase text-slate-400 tracking-wider py-4">
                  ยอดรวมรวมบิลสุทธิทั้งสิ้น (Grand Total) :
                </TableCell>
                <TableCell className="text-right font-black text-base font-sans text-orange-600">
                  ฿{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                {editable && <TableCell />}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PurchaseOrderTable;