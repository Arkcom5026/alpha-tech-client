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
    className="space-y-2"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <label htmlFor="sale-customer-search-input" className="block text-xs font-semibold text-slate-700">
      ค้นหาลูกค้าในร้านนี้
    </label>
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />
        <input
          ref={inputRef}
          id="sale-customer-search-input"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ชื่อ เบอร์โทร บริษัท หน่วยงาน อีเมล หรือเลขผู้เสียภาษี"
          className="h-11 w-full rounded-xl border border-teal-200 bg-teal-50/60 pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />
      </div>
      <button
        type="submit"
        disabled={customerLoading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {customerLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {customerLoading ? 'กำลังค้นหา' : 'ค้นหา'}
      </button>
    </div>
    <div className="space-y-1 text-xs leading-5 text-slate-500">
      <p>ผลการค้นหาจะแสดงเฉพาะลูกค้าที่อยู่ภายใต้ร้านปัจจุบัน</p>
      <p>ไม่ค้นหาสินค้า บาร์โค้ด หรือหมายเลขอุปกรณ์ ให้ใช้ช่องค้นหาสินค้าในขั้นตอนถัดไป</p>
    </div>
  </form>
);

export default SaleCustomerSearch;
