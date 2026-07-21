import React from 'react';
import {
  formatProductTraceDateTime,
  formatProductTraceMoney,
} from '../utils/productTraceFormat';
import { getProductTraceCategoryMeta } from '../utils/productTraceStatus';

const ProductTraceTimeline = ({ timeline = [] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-black text-slate-950">Evidence Timeline</h3>
        <p className="mt-1 text-xs text-slate-500">
          หลักฐานเหตุการณ์ทั้งหมด พร้อมเอกสาร ผู้ดำเนินการ และมูลค่าที่เกี่ยวข้อง
        </p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
        {timeline.length} เหตุการณ์
      </span>
    </div>

    {timeline.length ? (
      <ol className="relative mt-5 border-l border-slate-200 pl-5">
        {timeline.map((event, index) => {
          const categoryMeta = getProductTraceCategoryMeta(event.category);

          return (
            <li key={event.id || `${event.type}-${index}`} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[29px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-4 ring-white">
                {index + 1}
              </span>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-950">
                        {event.title || '-'}
                      </h4>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${categoryMeta.className}`}
                      >
                        {categoryMeta.label}
                      </span>
                    </div>

                    {event.description ? (
                      <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                    ) : null}

                    <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          วันที่
                        </span>
                        <span className="mt-0.5 block font-semibold text-slate-700">
                          {formatProductTraceDateTime(event.occurredAt)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          เอกสาร
                        </span>
                        <span className="mt-0.5 block font-semibold text-slate-700">
                          {event?.document?.code || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          ผู้ดำเนินการ
                        </span>
                        <span className="mt-0.5 block font-semibold text-slate-700">
                          {event?.actor?.name || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          สถานะ
                        </span>
                        <span className="mt-0.5 block font-semibold text-slate-700">
                          {event.status || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {event.amount !== null && event.amount !== undefined ? (
                    <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-black text-slate-950">
                      {formatProductTraceMoney(event.amount)}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    ) : (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
        ยังไม่มีเหตุการณ์สำหรับสินค้าชิ้นนี้
      </div>
    )}
  </section>
);

export default ProductTraceTimeline;
