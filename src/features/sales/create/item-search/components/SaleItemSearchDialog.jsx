import React, { useEffect, useRef, useState } from 'react';
import { ImageOff, Search, X } from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const SaleItemSearchDialog = ({ open, query, items, truncated, priceType, onSelect, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    itemRefs.current = [];
  }, [open, query, items]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (!items.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, items.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveIndex(items.length - 1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onSelect(items[activeIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items, onClose, onSelect, open]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="เลือกสินค้าจากผลการค้นหา"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
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
            <div className="mt-1 text-[10px] font-bold text-slate-400">
              ใช้ปุ่ม ↑ ↓ เพื่อเลื่อน · Enter เพื่อเลือก · Esc เพื่อปิด
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="ปิดหน้าต่างเลือกสินค้า">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-3">
          <div className="grid gap-2" role="listbox" aria-label="ผลการค้นหาสินค้า">
            {items.map((item, index) => {
              const price = item?.prices?.[priceType];
              const product = item?.product || {};
              const selected = index === activeIndex;
              return (
                <button
                  type="button"
                  key={`${item.type}-${item.stockItemId || item.simpleLotId}`}
                  ref={(node) => { itemRefs.current[index] = node; }}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => onSelect(item)}
                  className={`grid w-full grid-cols-12 items-center gap-3 rounded-xl border p-3 text-left transition ${selected
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50'}`}
                >
                  <div className="col-span-12 flex items-center gap-3 md:col-span-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {product.coverImageUrl ? (
                        <img src={product.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <ImageOff className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-black text-slate-900">{product.name || 'ไม่ระบุชื่อสินค้า'}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {product.brandName && <span>ยี่ห้อ: {product.brandName}</span>}
                        {product.codeType && <span>รุ่น/รหัส: {product.codeType}</span>}
                        {product.productTypeName && <span>ประเภท: {product.productTypeName}</span>}
                        <span>{item.type === 'STOCK' ? 'สินค้าแยกชิ้น' : 'สินค้าแบบจำนวน'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3 text-[11px] text-slate-600">
                    {item.serialNumber && <div>SN: <strong>{item.serialNumber}</strong></div>}
                    {item.barcode && <div>บาร์โค้ด: <strong>{item.barcode}</strong></div>}
                    <div>พร้อมขาย: <strong>{item.quantityAvailable}</strong></div>
                    {item.barcodeAuthority && <div>แหล่งรหัส: <strong>{item.barcodeAuthority.kind}</strong></div>}
                  </div>
                  <div className="col-span-12 text-right md:col-span-3">
                    <div className="text-base font-black text-orange-700">
                      {price == null ? 'ยังไม่มีราคา' : `฿${money(price)}`}
                    </div>
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
