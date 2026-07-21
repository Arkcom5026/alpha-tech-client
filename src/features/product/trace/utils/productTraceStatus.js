const STATUS_META = {
  IN_STOCK: { label: 'อยู่ในสต็อก', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  SOLD: { label: 'ขายแล้ว', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  RETURNED: { label: 'รับคืนแล้ว', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  CLAIMED: { label: 'อยู่ระหว่างเคลม', className: 'border-violet-200 bg-violet-50 text-violet-700' },
  DAMAGED: { label: 'ชำรุด', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  LOST: { label: 'สูญหาย', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  RESERVED: { label: 'จองแล้ว', className: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
};

const CATEGORY_META = {
  PROCUREMENT: { label: 'จัดซื้อ/รับเข้า', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  INVENTORY: { label: 'สต็อก', className: 'border-slate-200 bg-slate-50 text-slate-700' },
  SALES: { label: 'การขาย', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  RETURN: { label: 'คืนสินค้า', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  CLAIM: { label: 'เคลม', className: 'border-violet-200 bg-violet-50 text-violet-700' },
  REPAIR: { label: 'ซ่อม', className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700' },
};

export const getProductTraceStatusMeta = (status) =>
  STATUS_META[String(status || '').toUpperCase()] || {
    label: status || 'ไม่ทราบสถานะ',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  };

export const getProductTraceCategoryMeta = (category) =>
  CATEGORY_META[String(category || '').toUpperCase()] || {
    label: category || 'เหตุการณ์',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  };
