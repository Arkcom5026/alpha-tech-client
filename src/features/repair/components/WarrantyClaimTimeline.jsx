import React from 'react';
import StatusBadge from './StatusBadge';
import { formatRepairDateTime } from '../utils/repairFormat';

const WarrantyClaimTimeline = ({ events = [] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-black text-slate-950">ประวัติการเคลม</h2>
    <div className="mt-4 space-y-3">
      {events.length ? events.map((event) => (
        <div key={event.id} className="relative border-l-2 border-indigo-200 pl-4">
          <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-indigo-600" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={event.status} type="claim" />
            <span className="text-xs text-slate-500">{formatRepairDateTime(event.occurredAt)}</span>
          </div>
          {event.note ? <p className="mt-2 text-sm text-slate-700">{event.note}</p> : null}
          {event.performedByName ? <p className="mt-1 text-xs text-slate-500">โดย {event.performedByName}</p> : null}
        </div>
      )) : <p className="text-sm text-slate-500">ยังไม่มีเหตุการณ์</p>}
    </div>
  </section>
);

export default WarrantyClaimTimeline;
