import React, { useEffect, useRef } from 'react';
import { POS_SHORTCUT_EVENT } from '@/features/pos/runtime/shortcutRegistry';

const ProductTraceSearchBar = ({
  value,
  loading,
  onChange,
  onSearch,
  onReset,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const focusAndSelectSearch = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    focusAndSelectSearch();

    window.addEventListener(
      POS_SHORTCUT_EVENT.PRODUCT_TRACE_FOCUS_SEARCH,
      focusAndSelectSearch,
    );

    return () => {
      window.removeEventListener(
        POS_SHORTCUT_EVENT.PRODUCT_TRACE_FOCUS_SEARCH,
        focusAndSelectSearch,
      );
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-2 block text-sm font-semibold text-slate-800">
            สแกนหรือกรอกบาร์โค้ด / Serial Number
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder="ยิงบาร์โค้ดแล้วกด Enter"
            autoComplete="off"
            inputMode="text"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
          >
            {loading ? 'กำลังค้นหา...' : 'ค้นหาประวัติ'}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            ล้าง
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        เครื่องสแกนส่วนใหญ่จะส่งปุ่ม Enter อัตโนมัติ ระบบจึงค้นหาได้ทันทีหลังสแกน
      </p>
    </form>
  );
};

export default ProductTraceSearchBar;
