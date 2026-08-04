import React from 'react';
import { Search, X } from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SaleItemSearchDialog = ({ open, query, items, truncated, priceType, onSelect, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="เลือกสินค้าจากผลการค้นหา">
      <div className="flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 font-black text-slate-900">
              <Search className="h-4 w-4" />
              เลือกสินค้าที่ต้องการขาย
            </div>
            <div className="mt-1 text-xs text-slate-500">
              ผลการค้นหา “{query}” จำนวน {items.length} รายการ
              {truncated ? ' · แสดงเฉพาะผลลัพธ์แรก กรุณาระบุคำค้นให้ละเอียดขึ้น' : ''}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="ปิดหน้าต่างเลือกสินค้า">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-3">
          <div className="grid gap-2">
            {items.map((item) => {
              const price = item?.prices?.[priceType];
              const product = item?.product || {};
              return (
                <button
                  type="button"
                  key={`${item.type}-${item.stockItemId || item.simpleLotId}`}
                  onClick={() => onSelect(item)}
                  className="grid w-full grid-cols-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-orange-400 hover:bg-orange-50"
                >
                  <div className="col-span-12 md:col-span-6">
                    <div className="font-black text-slate-900">{product.name || 'ไม่ระบุชื่อสินค้า'}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {product.brandName && <span>ยี่ห้อ: {product.brandName}</span>}
                      {product.codeType && <span>รุ่น/รหัส: {product.codeType}</span>}
                      <span>{item.type === 'STOCK' ? 'สินค้าแยกชิ้น' : 'สินค้าแบบจำนวน'}</span>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3 text-[11px] text-slate-600">
                    {item.serialNumber && <div>SN: <strong>{item.serialNumber}</strong></div>}
                    {item.barcode && <div>บาร์โค้ด: <strong>{item.barcode}</strong></div>}
                    <div>พร้อมขาย: <strong>{item.quantityAvailable}</strong></div>
                  </div>
                  <div className="col-span-12 text-right md:col-span-3">
                    <div className="text-base font-black text-orange-700">฿{money(price)}</div>
                    <div className="text-[10px] font-bold text-slate-400">กดเพื่อเพิ่มลงตะกร้า</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleItemSearchDialog;
