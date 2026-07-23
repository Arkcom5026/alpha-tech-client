// src/features/sales/components/SaleItemTable.jsx
// 🏛️ Premium Next-Gen POS Item Matrix: (Lean High-Contrast Layout Edition)

import React, { useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0 }) => {
  const {
    sharedBillDiscountPerItem,
    setSharedBillDiscountPerItemAction,
    updateSaleItemAction,
  } = useSalesStore();

  const toNumber = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return 0;
    const n = Number(String(raw).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!Array.isArray(items) || items.length === 0) {
        if (sharedBillDiscountPerItem !== 0) setSharedBillDiscountPerItemAction(0);
        return;
      }

      const totalPrice = items.reduce(
        (sum, item) => sum + (typeof item.price === 'number' ? item.price : 0),
        0
      );

      const totalPriceSatang = Math.round(totalPrice * 100);
      const totalDiscSatang = billDiscount > 0 ? Math.round(billDiscount * 100) : 0;

      if (totalPriceSatang <= 0 || totalDiscSatang <= 0) {
        items.forEach((item) => {
          if ((item.billShare || 0) !== 0) {
            const currentDiscountWithoutBill = item.discountWithoutBill || 0;
            updateSaleItemAction(item.stockItemId, {
              billShare: 0,
              discount: currentDiscountWithoutBill,
            });
          }
        });

        if (sharedBillDiscountPerItem !== 0) setSharedBillDiscountPerItemAction(0);
        return;
      }

      const rows = items.map((item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const priceSatang = Math.max(0, Math.round(price * 100));
        const raw = (totalDiscSatang * priceSatang) / totalPriceSatang;
        const flo = Math.floor(raw);
        const frac = raw - flo;
        return { item, flo, frac };
      });

      let used = rows.reduce((sum, r) => sum + r.flo, 0);
      let remain = Math.max(0, totalDiscSatang - used);

      rows.sort((a, b) => b.frac - a.frac);
      for (let i = 0; i < rows.length && remain > 0; i += 1) {
        rows[i].flo += 1;
        remain -= 1;
      }

      rows.forEach((r) => {
        const calculatedBillShare = r.flo / 100;
        const currentDiscountWithoutBill = r.item.discountWithoutBill || 0;
        const newTotalDiscount = currentDiscountWithoutBill + calculatedBillShare;

        if (
          (r.item.billShare || 0) !== calculatedBillShare ||
          (r.item.discount || 0) !== newTotalDiscount
        ) {
          updateSaleItemAction(r.item.stockItemId, {
            billShare: calculatedBillShare,
            discount: newTotalDiscount,
          });
        }
      });

      const avg = Math.floor((billDiscount / items.length) * 100) / 100;
      if (sharedBillDiscountPerItem !== avg) setSharedBillDiscountPerItemAction(avg);
    }, 100);

    return () => clearTimeout(handler);
  }, [
    billDiscount,
    items,
    updateSaleItemAction,
    setSharedBillDiscountPerItemAction,
    sharedBillDiscountPerItem,
  ]);

  const handleDiscountChange = (itemId, input) => {
    const raw = typeof input === 'number' ? input : input?.target?.value;
    const newDiscountWithoutBill = toNumber(raw);

    const itemToUpdate = items.find((item) => item.stockItemId === itemId);
    if (!itemToUpdate) return;

    const billShare = itemToUpdate.billShare || 0;
    const newTotalDiscount = newDiscountWithoutBill + billShare;

    updateSaleItemAction(itemId, {
      discountWithoutBill: newDiscountWithoutBill,
      discount: newTotalDiscount,
    });
  };

  const handleSellingPriceChange = (itemId, input) => {
    const raw = typeof input === 'number' ? input : input?.target?.value;
    const newSellingPrice = Math.max(0, toNumber(raw));

    const itemToUpdate = items.find((item) => item.stockItemId === itemId);
    if (!itemToUpdate) return;

    const basePrice = typeof itemToUpdate.price === 'number' ? itemToUpdate.price : 0;
    const billShare = itemToUpdate.billShare || 0;

    const nextDiscountWithoutBill = Number((basePrice - newSellingPrice).toFixed(2));
    const nextTotalDiscount = Number((nextDiscountWithoutBill + billShare).toFixed(2));

    updateSaleItemAction(itemId, {
      sellingPrice: newSellingPrice,
      discountWithoutBill: nextDiscountWithoutBill,
      discount: nextTotalDiscount,
    });
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 select-none">
          <tr>
            <th className="p-2.5 text-center w-12">#</th>
            <th className="p-2.5">ชื่อสินค้ารายละเอียด</th>
            <th className="p-2.5">รุ่นโมเดล</th>
            <th className="p-2.5 text-center w-28">บาร์โค้ด</th>
            <th className="p-2.5 text-right w-24">ราคาป้าย</th>
            <th className="p-2.5 text-right w-24">ขายจริง</th>
            <th className="p-2.5 text-right w-20">ส่วนลด</th>
            <th className="p-2.5 text-right w-20">ลดท้ายบิล</th>
            <th className="p-2.5 text-right w-24">ราคาสุทธิ</th>
            <th className="p-2.5 text-center w-16">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="10" className="p-10 text-center text-slate-400 italic font-bold select-none">
              📭 ยังไม่มีรายการสินค้าในตะกร้าขายหน้าร้านปัจจุบัน
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-left border-collapse border border-slate-200 text-xs md:text-sm">
      <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 select-none---">
        <tr>
          <th className="p-2.5 text-center w-12">#</th>
          <th className="p-2.5 w-[220px]">ชื่อสินค้ารายละเอียด</th>
          <th className="p-2.5 w-[140px]">รุ่นโมเดล</th>
          <th className="p-2.5 text-center w-28">บาร์โค้ด</th>
          <th className="p-2.5 text-right w-24">ราคาป้าย</th>
          <th className="p-2.5 text-right w-24">ขายจริง</th>
          <th className="p-2.5 text-right w-20">ส่วนลด</th>
          <th className="p-2.5 text-right w-20">ลดท้ายบิล</th>
          <th className="p-2.5 text-right w-24">ราคาสุทธิ</th>
          <th className="p-2.5 text-center w-16">จัดการ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
        {items.map((item, index) => {
          const discount = item.discount || 0;
          const discountWithoutBill = item.discountWithoutBill || 0;
          const billShare = item.billShare || 0;
          const safePrice = typeof item.price === 'number' ? item.price : 0;
          const sellingPrice =
            typeof item.sellingPrice === 'number'
              ? item.sellingPrice
              : Math.max(0, safePrice - discountWithoutBill);
          const net = Math.max(0, safePrice - discount);

          return (
            <tr key={item.stockItemId} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-2.5 text-center font-bold font-mono text-slate-400">{index + 1}</td>
              <td className="p-2.5 font-black text-slate-900 truncate max-w-[200px]" title={item.productName}>{item.productName}</td>
              <td className="p-2.5 text-slate-500 truncate max-w-[130px]" title={item.model}>{item.model}</td>
              <td className="p-2.5 border-l border-slate-100 font-mono text-center select-all">{item.barcode}</td>
              <td className="p-2.5 font-mono text-right text-slate-400">{safePrice.toFixed(2)}</td>
              <td className="p-2.5 text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"                  
                  className="w-20 h-7 border border-slate-200 rounded-lg px-2 text-right font-mono font-black text-slate-900 bg-white focus:border-slate-900 outline-none text-xs"
                  placeholder="0.00"
                  value={sellingPrice === 0 ? '' : sellingPrice}
                  onChange={(e) => handleSellingPriceChange(item.stockItemId, e)}
                />
              </td>
              <td className="p-2.5 text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="w-16 h-7 border border-slate-200 rounded-lg px-1.5 text-right font-mono text-orange-600 bg-white focus:border-slate-900 outline-none text-xs"
                  placeholder="0.00"
                  value={discountWithoutBill === 0 ? '' : discountWithoutBill}
                  onChange={(e) => handleDiscountChange(item.stockItemId, e)}
                />
              </td>
              <td className="p-2.5 text-right font-mono text-slate-500">
                {billShare > 0 ? billShare.toFixed(2) : '0.00'}
              </td>
              <td className="p-2.5 text-right font-mono font-black text-slate-900">
                {net.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="p-2.5 text-center select-none">
                <button
                  type="button"
                  className="h-6 px-2 rounded-lg border border-rose-100 text-rose-500 font-black hover:bg-rose-50 text-[10px] shadow-sm bg-white transition-all"
                  onClick={() => onRemove(item.stockItemId)}
                >
                  ลบออก
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SaleItemTable;