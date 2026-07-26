import React, { useEffect } from 'react';
import useSaleCreateStore from '@/features/sales/create/store/saleCreateStore';

const lineIdentity = (item) => item?.lineId || (item?.stockItemId ? `stock-${item.stockItemId}` : null);
const isSimpleLine = (item) => String(item?.lineType || '').toUpperCase() === 'SIMPLE' || !item?.stockItemId;

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0 }) => {
  const {
    sharedBillDiscountPerItem,
    setSharedBillDiscountPerItemAction,
    updateSaleItemAction,
    updateQuantityAction,
  } = useSaleCreateStore();

  const toNumber = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return 0;
    const value = Number(String(raw).replace(/,/g, ''));
    return Number.isFinite(value) ? value : 0;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!items.length) {
        if (sharedBillDiscountPerItem !== 0) setSharedBillDiscountPerItemAction(0);
        return;
      }
      const totalPriceSatang = items.reduce(
        (sum, item) => sum + Math.max(0, Math.round((Number(item.price) || 0) * 100)),
        0
      );
      const totalDiscSatang = billDiscount > 0 ? Math.round(billDiscount * 100) : 0;
      if (totalPriceSatang <= 0 || totalDiscSatang <= 0) {
        items.forEach((item) => {
          if ((item.billShare || 0) !== 0) {
            updateSaleItemAction(lineIdentity(item), {
              billShare: 0,
              discount: Number(item.discountWithoutBill || 0),
            });
          }
        });
        if (sharedBillDiscountPerItem !== 0) setSharedBillDiscountPerItemAction(0);
        return;
      }

      const rows = items.map((item) => {
        const raw = (totalDiscSatang * Math.max(0, Math.round((Number(item.price) || 0) * 100))) / totalPriceSatang;
        return { item, floor: Math.floor(raw), fraction: raw - Math.floor(raw) };
      });
      let remaining = Math.max(0, totalDiscSatang - rows.reduce((sum, row) => sum + row.floor, 0));
      rows.sort((a, b) => b.fraction - a.fraction);
      for (let index = 0; index < rows.length && remaining > 0; index += 1) {
        rows[index].floor += 1;
        remaining -= 1;
      }
      rows.forEach(({ item, floor }) => {
        const billShare = floor / 100;
        const discountWithoutBill = Number(item.discountWithoutBill || 0);
        const discount = discountWithoutBill + billShare;
        if ((item.billShare || 0) !== billShare || (item.discount || 0) !== discount) {
          updateSaleItemAction(lineIdentity(item), { billShare, discount });
        }
      });
      const average = Math.floor((billDiscount / items.length) * 100) / 100;
      if (sharedBillDiscountPerItem !== average) setSharedBillDiscountPerItemAction(average);
    }, 100);
    return () => clearTimeout(handler);
  }, [billDiscount, items, setSharedBillDiscountPerItemAction, sharedBillDiscountPerItem, updateSaleItemAction]);

  const updateDiscount = (item, raw) => {
    const discountWithoutBill = Math.max(0, toNumber(raw));
    updateSaleItemAction(lineIdentity(item), {
      discountWithoutBill,
      discount: discountWithoutBill + Number(item.billShare || 0),
    });
  };

  const updateSellingPrice = (item, raw) => {
    const sellingPrice = Math.max(0, toNumber(raw));
    const basePrice = Number(item.price || 0);
    const discountWithoutBill = Number((basePrice - sellingPrice).toFixed(2));
    updateSaleItemAction(lineIdentity(item), {
      sellingPrice,
      discountWithoutBill,
      discount: Number((discountWithoutBill + Number(item.billShare || 0)).toFixed(2)),
    });
  };

  if (!items.length) {
    return <div className="p-10 text-center text-slate-400 italic font-bold">📭 ยังไม่มีรายการสินค้าในตะกร้าขายหน้าร้านปัจจุบัน</div>;
  }

  return (
    <table className="w-full text-left border-collapse border border-slate-200 text-xs md:text-sm">
      <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 select-none">
        <tr>
          <th className="p-2.5 text-center w-10">#</th>
          <th className="p-2.5 min-w-[190px]">รายการ</th>
          <th className="p-2.5 text-center w-20">ประเภท</th>
          <th className="p-2.5 text-center w-28">บาร์โค้ด</th>
          <th className="p-2.5 text-right w-20">จำนวน</th>
          <th className="p-2.5 text-right w-24">ราคาป้าย</th>
          <th className="p-2.5 text-right w-24">ขายจริง</th>
          <th className="p-2.5 text-right w-20">ส่วนลด</th>
          <th className="p-2.5 text-right w-20">ลดท้ายบิล</th>
          <th className="p-2.5 text-right w-24">สุทธิ</th>
          <th className="p-2.5 text-center w-16">จัดการ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
        {items.map((item, index) => {
          const identity = lineIdentity(item);
          const simple = isSimpleLine(item);
          const quantity = Number(item.quantity || 1);
          const safePrice = Number(item.price || 0);
          const discountWithoutBill = Number(item.discountWithoutBill || 0);
          const billShare = Number(item.billShare || 0);
          const sellingPrice = Number.isFinite(Number(item.sellingPrice))
            ? Number(item.sellingPrice)
            : Math.max(0, safePrice - discountWithoutBill);
          const net = Math.max(0, safePrice - Number(item.discount || 0));
          return (
            <tr key={identity} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-2.5 text-center font-mono text-slate-400">{index + 1}</td>
              <td className="p-2.5">
                <div className="font-black text-slate-900">{item.productName || item.product?.name || '-'}</div>
                {item.model && <div className="text-[10px] text-slate-400">{item.model}</div>}
              </td>
              <td className="p-2.5 text-center"><span className="rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-black">{simple ? (item.simpleLotId ? 'LOT' : 'SIMPLE') : 'SERIAL'}</span></td>
              <td className="p-2.5 font-mono text-center select-all">{item.barcode || '-'}</td>
              <td className="p-2.5 text-right">
                {simple ? (
                  <input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => updateQuantityAction?.(identity, event.target.value)} className="w-16 h-7 border border-slate-200 rounded-lg px-1.5 text-right font-mono bg-white" />
                ) : <span className="font-mono">1</span>}
              </td>
              <td className="p-2.5 font-mono text-right text-slate-400">{safePrice.toFixed(2)}</td>
              <td className="p-2.5 text-right"><input type="number" inputMode="decimal" step="0.01" value={sellingPrice === 0 ? '' : sellingPrice} onChange={(event) => updateSellingPrice(item, event.target.value)} className="w-20 h-7 border border-slate-200 rounded-lg px-2 text-right font-mono font-black text-slate-900 bg-white" /></td>
              <td className="p-2.5 text-right"><input type="number" inputMode="decimal" min="0" step="0.01" value={discountWithoutBill === 0 ? '' : discountWithoutBill} onChange={(event) => updateDiscount(item, event.target.value)} className="w-16 h-7 border border-slate-200 rounded-lg px-1.5 text-right font-mono text-orange-600 bg-white" /></td>
              <td className="p-2.5 text-right font-mono text-slate-500">{billShare.toFixed(2)}</td>
              <td className="p-2.5 text-right font-mono font-black text-slate-900">{net.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2.5 text-center"><button type="button" onClick={() => onRemove(identity)} className="h-6 px-2 rounded-lg border border-rose-100 text-rose-500 font-black hover:bg-rose-50 text-[10px] bg-white">ลบออก</button></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SaleItemTable;
