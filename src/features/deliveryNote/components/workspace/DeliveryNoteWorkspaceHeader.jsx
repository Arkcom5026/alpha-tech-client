import React from 'react';
import { FileText } from 'lucide-react';

const DeliveryNoteWorkspaceHeader = ({ title, description, count = 0 }) => (
  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:px-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
        {count.toLocaleString('th-TH')} รายการ
      </span>
    </div>
  </section>
);

export default DeliveryNoteWorkspaceHeader;
