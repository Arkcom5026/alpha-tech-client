import React, { useEffect } from 'react';

const toNumber = (raw) => {
  if (raw === '' || raw === null || raw === undefined) return 0;
  const number = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(number) ? number : 0;
};

const SaleItemTable = ({ items = [], onRemove, onUpdate, billDiscount = 0 }) => {
  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0 || typeof onUpdate !== 'function') return;

    const totalPriceSatang = items.reduce(
      (sum, item) => sum + Math.max(0, Math.round((Number(item.price) || 0) * Number(item.quantity || 1) * 100)),
      0
    );
    const totalDiscountSatang = Math.max(0, Math.round((Number(billDiscount) || 0) * 100));

    if (totalPriceSatang <= 0 || totalDiscountSatang <= 0) {
      items.forEach((item) => {
        const baseDiscount = Number(item.discountWithoutBill || 0);
        if (Number(item.billShare || 0) !== 0 || Number(item.discount || 0) !== baseDiscount) {
          onUpdate(item.lineId, { billShare: 0, discount: baseDiscount });
        }
      });
      return;
    }

    const allocations = items.map((item) => {
      const linePriceSatang = Math.max(
        0,
        Math.round((Number(item.price) || 0) * Number(item.quantity || 1) * 100)
      );
      const raw = (totalDiscountSatang * linePriceSatang) / totalPriceSatang;
      return { lineId: item.lineId, floor: Math.floor(raw), fraction: raw - Math.floor(raw) };
    });

    let remaining = totalDiscountSatang - allocations.reduce((sum, row) => sum + row.floor, 0);
    [...allocations]
      .sort((a, b) => b.fraction - a.fraction)
      .forEach((row) => {
        if (remaining <= 0) return;
        row.floor += 1;
        remaining -= 1;
      });

    const allocationByLine = new Map(allocations.map((row) => [row.lineId, row.floor / 100]));
    items.forEach((item) => {
      const billShare = allocationByLine.get(item.lineId) || 0;
      const discountWithoutBill = Number(item.discountWithoutBill || 0);
      const discount = Number((discountWithoutBill + billShare).toFixed(2));
      if (Number(item.billShare || 0) !== billShare || Number(item.discount || 0) !== discount) {
        onUpdate(item.lineId, { billShare, discount });
      }
    });
  }, [billDiscount, items, onUpdate]);

  const handleDiscountChange = (item, input) => {
    const discountWithoutBill = Math.max(0, toNumber(input?.target?.value));
    const billShare = Number(item.billShare || 0);
    onUpdate?.(item.lineId, {
      discountWithoutBill,
      discount: Number((discountWithoutBill + billShare).toFixed(2)),
    });
  };

  const handleSellingPriceChange = (item, input) => {
    const sellingPrice = Math.max(0, toNumber(input?.target?.value));
    const basePrice = Number(item.price || 0);
    const billShare = Number(item.billShare || 0);
    const discountWithoutBill = Number((basePrice - sellingPrice).toFixed(2));
    onUpdate?.(item.lineId, {
      sellingPrice,
      discountWithoutBill,
      discount: Number((discountWithoutBill + billShare).toFixed(2)),
    });
  };

  const headers = (
    <tr>
      <th className="p-2.5 text-center w-12">#</th>
      <th className="p-2.5 w-[220px]">ชื่อสินค้ารายละเอียด</th>
      <th className="p-2.5 w-[110px]">ประเภท</th>
      <th className="p-2.5 text-center w-28">บาร์โค้ด</th>
      <th className="p-2.5 text-center w-16">จำนวน</th>
      <th className="p-2.5 text-right w-24">ราคาป้าย</th>
      <th className="p-2.5 text-right w-24">ขายจริง</th>
      <th className="p-2.5 text-right w-20">ส่วนลด</th>
      <th className="p-2.5 text-right w-20">ลดท้ายบิล</th>
      <th className="p-2.5 text-right w-24">ราคาสุทธิ</th>
      <th className="p-2.5 text-center w-16">จัดการ</th>
    </tr>
  );

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 select-none">
          {headers}
        </thead>
        <tbody>
          <tr>
            <td colSpan="11" className="p-10 text-center text-slate-400 italic font-bold select-none">
              📭 ยังไม่มีรายการสินค้าในตะกร้าขายหน้าร้านปัจจุบัน
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-left border-collapse border border-slate-200 text-xs md:text-sm">
      <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200 select-none">
        {headers}
      </thead>
      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
        {items.map((item, index) => {
          const quantity = Number(item.quantity || 1);
          const basePrice = Number(item.price || 0) * quantity;
          const discountWithoutBill = Number(item.discountWithoutBill || 0);
          const billShare = Number(item.billShare || 0);
          const discount = Number(item.discount || 0);
          const sellingPrice = Number.isFinite(Number(item.sellingPrice))
            ? Number(item.sellingPrice)
            : Math.max(0, Number(item.price || 0) - discountWithoutBill);
          const net = Math.max(0, basePrice - discount);

          return (
            <tr key={item.lineId} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-2.5 text-center font-bold font-mono text-slate-400">{index + 1}</td>
              <td className="p-2.5 font-black text-slate-900 truncate max-w-[200px]" title={item.productName}>
                {item.productName}
              </td>
              <td className="p-2.5 text-slate-500">{item.lineType === 'SIMPLE' ? 'แบบจำนวน' : 'รายชิ้น/SN'}</td>
              <td className="p-2.5 border-l border-slate-100 font-mono text-center select-all">{item.barcode}</td>
              <td className="p-2.5 text-center font-mono">{quantity}</td>
              <td className="p-2.5 font-mono text-right text-slate-400">{basePrice.toFixed(2)}</td>
              <td className="p-2.5 text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="w-20 h-7 border border-slate-200 rounded-lg px-2 text-right font-mono font-black text-slate-900 bg-white focus:border-slate-900 outline-none text-xs"
                  placeholder="0.00"
                  value={sellingPrice === 0 ? '' : sellingPrice}
                  onChange={(event) => handleSellingPriceChange(item, event)}
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
                  onChange={(event) => handleDiscountChange(item, event)}
                />
              </td>
              <td className="p-2.5 text-right font-mono text-slate-500">{billShare.toFixed(2)}</td>
              <td className="p-2.5 text-right font-mono font-black text-slate-900">
                {net.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="p-2.5 text-center select-none">
                <button
                  type="button"
                  className="h-6 px-2 rounded-lg border border-rose-100 text-rose-500 font-black hover:bg-rose-50 text-[10px] shadow-sm bg-white transition-all"
                  onClick={() => onRemove?.(item.lineId)}
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
