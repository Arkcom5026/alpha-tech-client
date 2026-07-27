import React from 'react';

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const TrackingTimeline = ({ items = [] }) => (
  <ol className="space-y-0">
    {items.map((item, index) => (
      <li key={`${item.type}-${item.occurredAt}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
        {index < items.length - 1 ? (
          <span className="absolute left-[11px] top-6 h-full w-px bg-blue-100" />
        ) : null}
        <span className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="font-black text-slate-900">{item.title}</p>
          {item.description ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
          ) : null}
          <p className="mt-1 text-xs font-bold text-slate-400">{formatDateTime(item.occurredAt)}</p>
        </div>
      </li>
    ))}
  </ol>
);

export default TrackingTimeline;
