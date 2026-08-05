import React, { useEffect, useRef, useState } from 'react';

const formatScannedAt = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH');
};

const getSerialNumber = (item) => item?.serialNumber || item?.sn || item?.serialNo || '-';

const getProductName = (item) => {
  const name = item?.product?.name || item?.productName || 'ไม่ระบุชื่อสินค้า';
  const model = item?.product?.model || item?.model;
  return model ? `${name} (${model})` : name;
};

const AuditTable = ({
  items = [],
  loading = false,
  scanned = false,
  highlightValue = '',
  page = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  q = '',
  onSearch,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [localQ, setLocalQ] = useState(q);
  const debounceRef = useRef(null);
  const debounceMs = 320;

  useEffect(() => {
    setLocalQ(q || '');
  }, [q]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const normalize = (value) => String(value ?? '').trim().toLowerCase();
  const isHighlightedRow = (item) => {
    const highlighted = normalize(highlightValue);
    if (!highlighted) return false;
    return highlighted === normalize(item?.barcode) || highlighted === normalize(getSerialNumber(item));
  };

  const submitSearch = (value) => {
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(value);
  };

  const firstItemNumber = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItemNumber = Math.min(page * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:max-w-md"
          placeholder="ค้นหา Barcode, SN, ชื่อสินค้า หรือรุ่น"
          value={localQ}
          onChange={(event) => {
            const nextValue = event.target.value;
            setLocalQ(nextValue);
            if (!onSearch) return;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = window.setTimeout(() => onSearch(nextValue), debounceMs);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            submitSearch(localQ);
          }}
        />

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{total.toLocaleString('th-TH')} รายการ</span>
          {loading ? <span className="font-medium text-teal-700">กำลังโหลด...</span> : null}
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 p-3 text-left font-semibold">#</th>
              <th className="border-b border-slate-200 p-3 text-left font-semibold">Barcode</th>
              <th className="border-b border-slate-200 p-3 text-left font-semibold">SN</th>
              <th className="border-b border-slate-200 p-3 text-left font-semibold">สินค้า</th>
              {scanned ? <th className="border-b border-slate-200 p-3 text-left font-semibold">เวลาที่สแกน</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={scanned ? 5 : 4} className="p-6 text-center text-slate-500">กำลังโหลดรายการ...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={scanned ? 5 : 4} className="p-6 text-center text-slate-400">ไม่มีรายการ</td>
              </tr>
            ) : items.map((item, index) => {
              const highlighted = isHighlightedRow(item);
              return (
                <tr key={item.id} className={highlighted ? 'bg-emerald-50' : 'odd:bg-white even:bg-slate-50/60'}>
                  <td className="border-b border-slate-100 p-3 text-slate-500">{(page - 1) * pageSize + index + 1}</td>
                  <td className="border-b border-slate-100 p-3 font-mono text-slate-800">{item.barcode || '-'}</td>
                  <td className="border-b border-slate-100 p-3 font-mono text-slate-800">{getSerialNumber(item)}</td>
                  <td className="border-b border-slate-100 p-3 font-medium text-slate-950">{getProductName(item)}</td>
                  {scanned ? <td className="border-b border-slate-100 p-3 text-slate-600">{formatScannedAt(item.scannedAt)}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">กำลังโหลดรายการ...</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-400">ไม่มีรายการ</div>
        ) : items.map((item, index) => {
          const highlighted = isHighlightedRow(item);
          return (
            <article
              key={item.id}
              className={`rounded-xl border p-3 ${highlighted ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{getProductName(item)}</p>
                  <p className="mt-1 text-xs text-slate-500">รายการ {(page - 1) * pageSize + index + 1}</p>
                </div>
                {highlighted ? (
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-900">ล่าสุด</span>
                ) : null}
              </div>

              <dl className="mt-3 grid gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">Barcode</dt>
                  <dd className="mt-0.5 break-all font-mono text-sm text-slate-900">{item.barcode || '-'}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">หมายเลขเครื่อง (SN)</dt>
                  <dd className="mt-0.5 break-all font-mono text-sm text-slate-900">{getSerialNumber(item)}</dd>
                </div>
                {scanned ? (
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-slate-500">เวลาที่สแกน</dt>
                    <dd className="mt-0.5 text-sm text-slate-900">{formatScannedAt(item.scannedAt)}</dd>
                  </div>
                ) : null}
              </dl>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-slate-600">
          หน้า {page} / {totalPages}
          {total > 0 ? <span className="ml-2 text-xs text-slate-400">แสดง {firstItemNumber}-{lastItemNumber}</span> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(page - 1)}
          >
            ย้อนกลับ
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-teal-200 bg-teal-50 px-4 font-medium text-teal-900 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange?.(page + 1)}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;
