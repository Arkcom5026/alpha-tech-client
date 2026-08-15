import React from 'react';
import { RefreshCw, Search } from 'lucide-react';

const SaleCustomerSearch = ({
  query,
  customerLoading,
  inputRef,
  onQueryChange,
  onSubmit,
}) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <div className="flex flex-col gap-1.5 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-700" />
        <input
          ref={inputRef}
          id="sale-customer-search-input"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ชื่อ เบอร์โทร บริษัท หน่วยงาน อีเมล หรือเลขผู้เสียภาษี"
          aria-label="ค้นหาลูกค้า"
          className="h-10 w-full rounded-lg border border-teal-200 bg-teal-50/60 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />
      </div>
      <button
        type="submit"
        disabled={customerLoading}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {customerLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        {customerLoading ? 'กำลังค้นหา' : 'ค้นหา'}
      </button>
    </div>
    <p className="mt-1.5 text-[11px] text-slate-500">
      ค้นหาเฉพาะข้อมูลลูกค้า ไม่ค้นหาสินค้า บาร์โค้ด หรือหมายเลขอุปกรณ์
    </p>
  </form>
);

export default SaleCustomerSearch;
