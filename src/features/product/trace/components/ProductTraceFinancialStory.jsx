import React from 'react';
import {
  formatProductTraceMoney,
  formatProductTracePercent,
} from '../utils/productTraceFormat';

const StoryStep = ({ label, value, active = false }) => (
  <div
    className={[
      'rounded-2xl border p-4 text-center',
      active
        ? 'border-blue-200 bg-blue-50'
        : 'border-slate-200 bg-slate-50',
    ].join(' ')}
  >
    <div className="text-xs font-semibold text-slate-500">{label}</div>
    <div
      className={[
        'mt-2 text-xl font-black',
        active ? 'text-blue-700' : 'text-slate-950',
      ].join(' ')}
    >
      {value}
    </div>
  </div>
);

const Connector = () => (
  <div className="hidden items-center justify-center text-xl font-black text-slate-300 lg:flex">
    →
  </div>
);

const ProductTraceFinancialStory = ({ summary }) => {
  if (!summary) return null;

  const financialsVisible = summary.financialsVisible !== false;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-black text-slate-950">เรื่องราวด้านการเงิน</h3>
        <p className="mt-1 text-xs text-slate-500">
          มองเส้นทางมูลค่าจากต้นทุน ไปสู่ราคาขายและผลลัพธ์หลังการคืน
        </p>
      </div>

      {financialsVisible ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <StoryStep label="ต้นทุน" value={formatProductTraceMoney(summary.cost)} />
          <Connector />
          <StoryStep label="ราคาขาย" value={formatProductTraceMoney(summary.netSale)} />
          <Connector />
          <StoryStep
            label="กำไรหลังคืน"
            value={formatProductTraceMoney(summary.grossProfitAfterRefund)}
            active
          />
          <Connector />
          <StoryStep
            label="Margin"
            value={formatProductTracePercent(summary.grossMarginPercentAfterRefund)}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          บัญชีนี้ไม่มีสิทธิ์ดูต้นทุนและกำไรของสินค้า
        </div>
      )}
    </section>
  );
};

export default ProductTraceFinancialStory;
