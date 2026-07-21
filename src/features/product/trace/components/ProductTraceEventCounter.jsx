import React from 'react';
import { buildProductTraceEventCounters } from '../utils/productTraceInsights';

const DEFINITIONS = [
  ['received', 'รับเข้า'],
  ['ready', 'พร้อมขาย'],
  ['sold', 'ขาย'],
  ['returned', 'คืน'],
  ['claimed', 'เคลม'],
  ['repaired', 'ซ่อม'],
  ['transferred', 'โอน'],
  ['damagedOrLost', 'ชำรุด/สูญหาย'],
];

const ProductTraceEventCounter = ({ timeline = [] }) => {
  const counters = buildProductTraceEventCounters(timeline);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-black text-slate-950">Event Counter</h3>
        <p className="mt-1 text-xs text-slate-500">
          สรุปจำนวนเหตุการณ์สำคัญจาก Evidence Timeline
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {DEFINITIONS.map(([key, label]) => (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
          >
            <div className="text-2xl font-black text-slate-950">
              {counters[key]}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductTraceEventCounter;
