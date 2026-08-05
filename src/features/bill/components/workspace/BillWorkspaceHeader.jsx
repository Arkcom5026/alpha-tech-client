import React from 'react';
import { FileText } from 'lucide-react';

const BillWorkspaceHeader = ({ count = 0 }) => (
  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 md:px-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-2 text-teal-700">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-950">ค้นหาและพิมพ์ใบเสร็จ</h1>
          <p className="mt-1 text-sm text-slate-500">ค้นหารายการขายย้อนหลัง แล้วเลือกพิมพ์ใบเสร็จแบบย่อหรือแบบเต็ม</p>
        </div>
      </div>
      <span className="w-fit rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
        {count.toLocaleString('th-TH')} รายการ
      </span>
    </div>
  </section>
);

export default BillWorkspaceHeader;
