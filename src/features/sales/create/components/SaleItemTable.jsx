import React, { useEffect } from 'react';
import { PackageOpen, Trash2 } from 'lucide-react';

const toNumber = (raw) => {
  if (raw === '' || raw === null || raw === undefined) return 0;
  const number = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const inputClass =
  'h-11 rounded-xl border border-slate-300 bg-white px-3 text-right font-mono text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100';

const SaleItemTable = ({ items = [], onRemove, onUpdate, onChangeSimpleQuantity, billDiscount = 0 }) => {
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

  const handleSimpleQuantityChange = (item, input) => {
    onChangeSimpleQuantity?.(item.lineId, toNumber(input?.target?.value));
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center">
        <PackageOpen className="h-9 w-9 text-slate-400" />
        <p className="mt-3 font-semibold text-slate-800">ยังไม่มีสินค้าในรายการขาย</p>
        <p className="mt-1 text-sm text-slate-500">ค้นหาหรือสแกนสินค้าเพื่อเพิ่มลงในตะกร้า</p>
      </div>
    );
  }

  const renderValues = (item) => {
    const quantity = Number(item.quantity || 1);
    const basePrice = Number(item.price || 0) * quantity;
    const discountWithoutBill = Number(item.discountWithoutBill || 0);
    const billShare = Number(item.billShare || 0);
    const discount = Number(item.discount || 0);
    const sellingPrice = Number.isFinite(Number(item.sellingPrice))
      ? Number(item.sellingPrice)
      : Math.max(0, Number(item.price || 0) - discountWithoutBill);
    const net = Math.max(0, basePrice - discount);
    const displayIdentifier = item.displayIdentifier || item.serialNumber || item.barcode || '-';
    const identifierType = item.identifierType || (item.serialNumber ? 'SN' : 'BARCODE');

    return { quantity, basePrice, discountWithoutBill, billShare, sellingPrice, net, displayIdentifier, identifierType };
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 lg:hidden">
        {items.map((item, index) => {
          const values = renderValues(item);
          return (
            <article key={item.lineId} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">รายการที่ {index + 1}</p>
                  <h3 className="mt-1 truncate font-semibold text-slate-900">{item.productName}</h3>
                  <p className="mt-1 break-all font-mono text-xs text-slate-500">
                    {values.identifierType}: {values.displayIdentifier}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove?.(item.lineId)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                  aria-label={`ลบ ${item.productName || 'สินค้า'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs font-medium text-slate-600">
                  <span>จำนวน</span>
                  {item.lineType === 'SIMPLE' ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      min="1"
                      max={item.quantityAvailable}
                      step="1"
                      className={`${inputClass} w-full text-center`}
                      value={values.quantity}
                      onChange={(event) => handleSimpleQuantityChange(item, event)}
                    />
                  ) : (
                    <div className="flex h-11 items-center justify-center rounded-xl bg-slate-100 font-mono font-semibold text-slate-800">{values.quantity}</div>
                  )}
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-600">
                  <span>ราคาขายจริง</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    className={`${inputClass} w-full`}
                    value={values.sellingPrice === 0 ? '' : values.sellingPrice}
                    onChange={(event) => handleSellingPriceChange(item, event)}
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-600">
                  <span>ส่วนลดรายการ</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    className={`${inputClass} w-full`}
                    value={values.discountWithoutBill === 0 ? '' : values.discountWithoutBill}
                    onChange={(event) => handleDiscountChange(item, event)}
                  />
                </label>
                <div className="space-y-1 text-xs font-medium text-slate-600">
                  <span>ยอดสุทธิ</span>
                  <div className="flex h-11 items-center justify-end rounded-xl bg-emerald-50 px-3 font-mono font-semibold text-emerald-800">
                    {formatMoney(values.net)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span>ราคาป้าย {formatMoney(values.basePrice)}</span>
                <span>ลดท้ายบิล {formatMoney(values.billShare)}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
        <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3">สินค้า</th>
              <th className="px-3 py-3">ประเภท</th>
              <th className="px-3 py-3 text-center">บาร์โค้ด / SN</th>
              <th className="px-3 py-3 text-center">จำนวน</th>
              <th className="px-3 py-3 text-right">ราคาป้าย</th>
              <th className="px-3 py-3 text-right">ขายจริง</th>
              <th className="px-3 py-3 text-right">ส่วนลด</th>
              <th className="px-3 py-3 text-right">ลดท้ายบิล</th>
              <th className="px-3 py-3 text-right">สุทธิ</th>
              <th className="px-3 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item, index) => {
              const values = renderValues(item);
              return (
                <tr key={item.lineId} className="transition hover:bg-teal-50/40">
                  <td className="px-3 py-3 text-center font-mono text-slate-500">{index + 1}</td>
                  <td className="max-w-[240px] truncate px-3 py-3 font-semibold text-slate-900" title={item.productName}>{item.productName}</td>
                  <td className="px-3 py-3 text-slate-600">{item.lineType === 'SIMPLE' ? 'แบบจำนวน' : 'รายชิ้น / SN'}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="font-mono font-semibold text-slate-800">{values.displayIdentifier}</div>
                    <div className="mt-1 text-xs text-slate-500">{values.identifierType}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {item.lineType === 'SIMPLE' ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max={item.quantityAvailable}
                        step="1"
                        className={`${inputClass} w-20 text-center`}
                        value={values.quantity}
                        onChange={(event) => handleSimpleQuantityChange(item, event)}
                      />
                    ) : values.quantity}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-600">{formatMoney(values.basePrice)}</td>
                  <td className="px-3 py-3 text-right">
                    <input type="number" inputMode="decimal" step="0.01" className={`${inputClass} w-28`} value={values.sellingPrice === 0 ? '' : values.sellingPrice} onChange={(event) => handleSellingPriceChange(item, event)} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <input type="number" inputMode="decimal" min="0" step="0.01" className={`${inputClass} w-24`} value={values.discountWithoutBill === 0 ? '' : values.discountWithoutBill} onChange={(event) => handleDiscountChange(item, event)} />
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-600">{formatMoney(values.billShare)}</td>
                  <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-800">{formatMoney(values.net)}</td>
                  <td className="px-3 py-3 text-center">
                    <button type="button" onClick={() => onRemove?.(item.lineId)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                      <Trash2 className="h-3.5 w-3.5" /> ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleItemTable;
