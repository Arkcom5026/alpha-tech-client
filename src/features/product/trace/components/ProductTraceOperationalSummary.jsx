import React from 'react';
import { buildProductTraceOperationalSummary } from '../utils/productTraceInsights';

const ProductTraceOperationalSummary = ({ trace }) => {
  const summary = buildProductTraceOperationalSummary(trace);

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Operational Summary
          </p>
          <h3 className="mt-1 text-lg font-black text-blue-950">
            สรุปสถานะสินค้าชิ้นนี้
          </h3>
        </div>
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-black text-blue-700">
          {summary.risk.level} RISK
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {summary.sentences.map((sentence, index) => (
          <span
            key={`${sentence}-${index}`}
            className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-800"
          >
            {sentence}
          </span>
        ))}
      </div>
    </section>
  );
};

export default ProductTraceOperationalSummary;
