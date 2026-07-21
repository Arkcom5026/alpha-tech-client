import React from 'react';
import { formatProductTraceDateTime } from '../utils/productTraceFormat';
import { buildProductTraceCurrentOwner } from '../utils/productTraceInsights';

const ProductTraceCurrentOwnerCard = ({ trace }) => {
  const owner = buildProductTraceCurrentOwner(trace);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Current Owner
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {owner.name || 'ยังไม่ทราบผู้ครอบครอง'}
          </h3>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {owner.type || 'UNKNOWN'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-slate-500">ครอบครองตั้งแต่</div>
          <div className="mt-1 text-sm font-black text-slate-950">
            {formatProductTraceDateTime(owner.since)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">โทรศัพท์</div>
          <div className="mt-1 text-sm font-black text-slate-950">
            {owner.phone || '-'}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-slate-500">เอกสารอ้างอิง</div>
          <div className="mt-1 text-sm font-black text-slate-950">
            {owner.documentCode || '-'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductTraceCurrentOwnerCard;
