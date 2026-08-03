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
    className="mb-2.5"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <label htmlFor="sale-customer-search-input" className="mb-1 block text-[10px] font-black text-slate-500">
      ค้นหาลูกค้า
    </label>
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
      <input
        ref={inputRef}
        id="sale-customer-search-input"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="ชื่อ เบอร์โทร บริษัท หน่วยงาน อีเมล หรือเลขผู้เสียภาษี..."
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-10 text-xs font-bold text-slate-900 shadow-inner outline-none transition-all focus:border-slate-900 focus:bg-white"
      />
      <button
        type="submit"
        disabled={customerLoading}
        aria-label="ค้นหาลูกค้า"
        className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-50"
      >
        {customerLoading ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Search className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
    <p className="mt-1 text-[9px] font-bold text-slate-400">
      ระบบค้นหาเฉพาะลูกค้าที่สัมพันธ์กับร้านปัจจุบัน ไม่ค้นหาสินค้า บาร์โค้ด หรือหมายเลขอุปกรณ์
    </p>
  </form>
);

export default SaleCustomerSearch;
