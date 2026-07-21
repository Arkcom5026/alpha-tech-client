import React from 'react';
import {
  formatProductTraceDateTime,
  formatProductTraceMoney,
} from '../utils/productTraceFormat';

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="max-w-[65%] text-right text-sm font-semibold text-slate-900">
      {value ?? '-'}
    </span>
  </div>
);

const ProductTraceProcurementCard = ({ procurement }) => {
  if (!procurement) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">ที่มาของสินค้า</h3>
        <p className="mt-2 text-sm text-slate-500">ไม่พบข้อมูลจัดซื้อหรือใบรับสินค้า</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">ที่มาของสินค้า</h3>

      <div className="mt-3">
        <Row label="Supplier" value={procurement?.supplier?.name} />
        <Row label="ใบสั่งซื้อ" value={procurement?.purchaseOrder?.code} />
        <Row label="ใบรับสินค้า" value={procurement?.receipt?.code} />
        <Row
          label="วันที่รับ"
          value={formatProductTraceDateTime(
            procurement?.receipt?.receivedAt || procurement?.receivedAt
          )}
        />
        <Row label="ผู้รับสินค้า" value={procurement?.receipt?.receivedBy?.name} />
        <Row label="ต้นทุนรับเข้า" value={formatProductTraceMoney(procurement?.costPrice)} />
      </div>
    </section>
  );
};

export default ProductTraceProcurementCard;
