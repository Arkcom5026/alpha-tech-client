import React from 'react';
import {
  formatProductTraceMoney,
  formatProductTracePercent,
} from '../utils/productTraceFormat';

const FinancialItem = ({ label, value, emphasized = false }) => (
  <div
    className={`rounded-xl border p-4 ${
      emphasized
        ? 'border-blue-200 bg-blue-50'
        : 'border-slate-200 bg-slate-50'
    }`}
  >
    <div className="text-xs font-medium text-slate-500">{label}</div>
    <div
      className={`mt-1 text-lg font-bold ${
        emphasized ? 'text-blue-700' : 'text-slate-950'
      }`}
    >
      {value}
    </div>
  </div>
);

const ProductTraceFinancialCard = ({ summary }) => {
  if (!summary) return null;

  if (summary.financialsVisible === false) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">สรุปด้านการเงิน</h3>
        <p className="mt-2 text-sm text-slate-500">
          บัญชีนี้ไม่มีสิทธิ์ดูต้นทุนและกำไรของสินค้า
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">สรุปด้านการเงิน</h3>
      <p className="mt-1 text-xs text-slate-500">
        กำไรที่แสดงเป็นกำไรขั้นต้นจากราคาซื้อ ขาย และยอดคืนเท่านั้น
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FinancialItem label="ต้นทุนรับเข้า" value={formatProductTraceMoney(summary.cost)} />
        <FinancialItem label="ราคาขายสุทธิ" value={formatProductTraceMoney(summary.netSale)} />
        <FinancialItem label="ยอดคืนรวม" value={formatProductTraceMoney(summary.refundTotal)} />
        <FinancialItem
          label="กำไรหลังหักยอดคืน"
          value={formatProductTraceMoney(summary.grossProfitAfterRefund)}
          emphasized
        />
        <FinancialItem
          label="ราคาขายก่อนลด"
          value={formatProductTraceMoney(summary.saleBasePrice)}
        />
        <FinancialItem
          label="ส่วนลด"
          value={formatProductTraceMoney(summary.saleDiscount)}
        />
        <FinancialItem
          label="รายรับหลังคืน"
          value={formatProductTraceMoney(summary.netRevenueAfterRefund)}
        />
        <FinancialItem
          label="Margin หลังคืน"
          value={formatProductTracePercent(summary.grossMarginPercentAfterRefund)}
        />
      </div>
    </section>
  );
};

export default ProductTraceFinancialCard;
