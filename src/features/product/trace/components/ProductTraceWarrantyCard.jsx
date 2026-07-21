import React from 'react';
import {
  formatProductTraceDate,
} from '../utils/productTraceFormat';
import { buildProductTraceWarranty } from '../utils/productTraceInsights';

const STATUS_META = {
  IN_WARRANTY: {
    label: 'อยู่ในประกัน',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  OUT_OF_WARRANTY: {
    label: 'หมดประกัน',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  UNKNOWN: {
    label: 'ยังไม่มีข้อมูลประกัน',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
};

const ProductTraceWarrantyCard = ({ trace }) => {
  const warranty = buildProductTraceWarranty(trace);
  const meta = STATUS_META[warranty.status] || STATUS_META.UNKNOWN;

  const remainingLabel =
    warranty.remainingDays === null || warranty.remainingDays === undefined
      ? '-'
      : warranty.remainingDays >= 0
        ? `${warranty.remainingDays.toLocaleString('th-TH')} วัน`
        : `หมดมาแล้ว ${Math.abs(warranty.remainingDays).toLocaleString('th-TH')} วัน`;

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${meta.className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
            Warranty
          </p>
          <h3 className="mt-1 text-lg font-black">{meta.label}</h3>
        </div>
        <span className="rounded-full border border-current/20 bg-white/70 px-3 py-1 text-xs font-black">
          {warranty.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70">เริ่มประกัน</div>
          <div className="mt-1 text-sm font-black">
            {formatProductTraceDate(warranty.startDate)}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-70">หมดประกัน</div>
          <div className="mt-1 text-sm font-black">
            {formatProductTraceDate(warranty.endDate)}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-70">คงเหลือ</div>
          <div className="mt-1 text-sm font-black">{remainingLabel}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">ผู้ให้ประกัน</div>
          <div className="mt-1 text-sm font-black">{warranty.provider || '-'}</div>
        </div>
      </div>

      {warranty.status === 'UNKNOWN' ? (
        <p className="mt-3 text-xs opacity-75">
          ระบบจะไม่คำนวณวันหมดประกันจนกว่า Backend จะมีข้อมูลระยะเวลาหรือวันสิ้นสุดที่ยืนยันได้
        </p>
      ) : null}
    </section>
  );
};

export default ProductTraceWarrantyCard;
