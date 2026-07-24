import React from 'react';
import { formatDateTime } from '../utils/repairRuntime';

const QueueBoard = ({ lanes, type, onOpen }) => (
  <div className="overflow-x-auto pb-2">
    <div className="grid min-w-[1180px] grid-cols-5 gap-4">
      {lanes.map((lane) => (
        <section key={lane.key} className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-black text-slate-950">{lane.label}</h2>
              <p className="mt-1 text-xs text-slate-500">{lane.description}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm">
              {lane.items.length}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {lane.items.length ? (
              lane.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onOpen(item)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <p className="font-black text-slate-950">
                    {type === 'repair' ? item.jobNo : item.claimNo}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-700">
                    {type === 'repair'
                      ? item.deviceModel || item.reportedSymptoms
                      : item.stockItem?.product?.name || item.reason}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDateTime(type === 'repair' ? item.updatedAt || item.createdAt : item.updatedAt || item.openedAt)}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-xs text-slate-400">
                ไม่มีรายการ
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  </div>
);

export default QueueBoard;
