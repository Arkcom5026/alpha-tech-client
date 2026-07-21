import React from 'react';
import {
  formatProductTraceMoney,
  formatProductTracePercent,
} from '../utils/productTraceFormat';
import { getProductTraceStatusMeta } from '../utils/productTraceStatus';

const Metric = ({ label, value, hint, emphasized = false }) => (
  <div
    className={[
      'rounded-2xl border p-4',
      emphasized
        ? 'border-blue-200 bg-blue-50'
        : 'border-slate-200 bg-white',
    ].join(' ')}
  >
    <div className="text-xs font-semibold text-slate-500">{label}</div>
    <div
      className={[
        'mt-2 text-xl font-black',
        emphasized ? 'text-blue-700' : 'text-slate-950',
      ].join(' ')}
    >
      {value}
    </div>
    {hint ? <div className="mt-1 text-[11px] text-slate-500">{hint}</div> : null}
  </div>
);

const ProductTraceCurrentSummary = ({ identity, summary }) => {
  const statusMeta = getProductTraceStatusMeta(identity?.status);
  const financialsVisible = summary?.financialsVisible !== false;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">ภาพรวมปัจจุบัน</h3>
          <p className="mt-1 text-xs text-slate-500">
            อ่านสถานะสำคัญของสินค้าชิ้นนี้ได้ในไม่กี่วินาที
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="ต้นทุนรับเข้า"
          value={
            financialsVisible
              ? formatProductTraceMoney(summary?.cost)
              : 'จำกัดสิทธิ์'
          }
        />
        <Metric
          label="ราคาขายสุทธิ"
          value={formatProductTraceMoney(summary?.netSale)}
        />
        <Metric
          label="กำไรหลังยอดคืน"
          value={
            financialsVisible
              ? formatProductTraceMoney(summary?.grossProfitAfterRefund)
              : 'จำกัดสิทธิ์'
          }
          emphasized
        />
        <Metric
          label="Margin หลังคืน"
          value={
            financialsVisible
              ? formatProductTracePercent(summary?.grossMarginPercentAfterRefund)
              : 'จำกัดสิทธิ์'
          }
          hint={identity?.currentCustody ? `ผู้ครอบครอง: ${identity.currentCustody}` : null}
        />
      </div>
    </section>
  );
};

export default ProductTraceCurrentSummary;
