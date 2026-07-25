import React from 'react';

export default function PurchaseOrderStatusBadge({ status }) {
  if (status.tone === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> {status.label}
      </span>
    );
  }

  if (status.tone === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {status.label}
      </span>
    );
  }

  if (status.tone === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {status.label}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
      {status.label}
    </span>
  );
}
