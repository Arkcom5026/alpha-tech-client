import { Search } from 'lucide-react';

const CustomerWorkspaceHeader = ({ query, onQueryChange }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold text-teal-700">งานขายและข้อมูลลูกค้า</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">จัดการลูกค้า</h1>
        <p className="mt-1 text-sm text-slate-600">
          ค้นหาลูกค้าของร้าน และรับลูกค้ากลางที่ยังไม่มีร้านเจ้าของเข้ามาดูแล
        </p>
      </div>

      <label className="block w-full lg:max-w-md">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          ค้นหาชื่อ เบอร์โทร อีเมล หรือเลขผู้เสียภาษี
        </span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="พิมพ์คำค้นหา"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </span>
      </label>
    </div>
  </section>
);

export default CustomerWorkspaceHeader;
