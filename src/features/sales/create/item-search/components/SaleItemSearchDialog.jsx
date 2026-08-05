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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="เลือกสินค้าจากผลการค้นหา"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-slate-50 shadow-2xl sm:h-auto sm:max-h-[86vh] sm:max-w-5xl sm:rounded-3xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-teal-200 bg-teal-50 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base font-semibold text-teal-950">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-700">
                <Search className="h-4 w-4" />
              </span>
              <span>เลือกสินค้าที่ต้องการขาย</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              ผลการค้นหา “{query}” จำนวน {items.length} รายการ
            </p>
            {truncated ? (
              <p className="mt-1 text-xs text-amber-700">
                ผลลัพธ์มีมากกว่าที่แสดง กรุณาระบุชื่อ รุ่น บาร์โค้ด หรือหมายเลขเครื่องให้ละเอียดขึ้น
              </p>
            ) : null}
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              ใช้ปุ่มลูกศรเพื่อเลื่อน กด Enter เพื่อเลือก และ Esc เพื่อปิด
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:bg-teal-100 hover:text-teal-900"
            aria-label="ปิดหน้าต่างเลือกสินค้า"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-3 sm:p-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
              <p className="font-medium text-slate-700">ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
              <p className="mt-1 text-sm text-slate-500">ลองค้นหาด้วยชื่อสินค้า รุ่น บาร์โค้ด หรือหมายเลขเครื่อง</p>
            </div>
          ) : (
            <div className="grid gap-3" role="listbox" aria-label="ผลการค้นหาสินค้า">
              {items.map((item, index) => {
                const price = item?.prices?.[priceType];
                const product = item?.product || {};
                const selected = index === activeIndex;
                const itemKey = `${item.type}-${item.stockItemId || item.simpleLotId}`;

                return (
                  <button
                    type="button"
                    key={itemKey}
                    ref={(node) => { itemRefs.current[index] = node; }}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => onSelect(item)}
                    className={`w-full rounded-2xl border p-3 text-left transition sm:p-4 ${
                      selected
                        ? 'border-emerald-300 bg-emerald-100 ring-2 ring-emerald-200'
                        : 'border-teal-100 bg-white hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-20 sm:w-20">
                        {product.coverImageUrl ? (
                          <img src={product.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <ImageOff className="h-6 w-6 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="line-clamp-2 text-sm font-semibold text-slate-950 sm:text-base">
                              {product.name || 'ไม่ระบุชื่อสินค้า'}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-600">
                              {product.brandName ? <span className="rounded-md bg-slate-100 px-2 py-1">ยี่ห้อ {product.brandName}</span> : null}
                              {product.codeType ? <span className="rounded-md bg-slate-100 px-2 py-1">รุ่น/รหัส {product.codeType}</span> : null}
                              {product.productTypeName ? <span className="rounded-md bg-slate-100 px-2 py-1">{product.productTypeName}</span> : null}
                              <span className="rounded-md bg-teal-50 px-2 py-1 text-teal-800">
                                {item.type === 'STOCK' ? 'สินค้าแยกชิ้น' : 'สินค้าแบบจำนวน'}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <div className={`text-lg font-semibold ${price == null ? 'text-amber-700' : 'text-teal-800'}`}>
                              {price == null ? 'ยังไม่มีราคา' : `฿${money(price)}`}
                            </div>
                            <div className="text-xs text-slate-500">แตะเพื่อเพิ่มลงตะกร้า</div>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 border-t border-slate-200/80 pt-3 text-xs text-slate-700 sm:grid-cols-3">
                          <div>
                            <span className="text-slate-500">รหัสสินค้า</span>
                            <div className="mt-0.5 break-all font-mono font-medium text-slate-900">
                              {item.serialNumber || item.barcode || '-'}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">ประเภทตัวระบุ</span>
                            <div className="mt-0.5 font-medium text-slate-900">
                              {item.serialNumber ? 'หมายเลขเครื่อง' : item.barcode ? 'บาร์โค้ด' : '-'}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">จำนวนพร้อมขาย</span>
                            <div className="mt-0.5 font-semibold text-emerald-800">{item.quantityAvailable ?? 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleItemSearchDialog;
