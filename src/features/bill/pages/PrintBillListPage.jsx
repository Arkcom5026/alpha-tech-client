// src/features/bill/pages/PrintBillListPage.jsx
// 🏛️ Premium Next-Gen POS Bill Management Console: (Same-Window Navigation Hardened Edition)

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BILL_DOCUMENT_SEARCH_POLICY,
  useSaleDocumentSearch,
} from '@/features/sales/documents/search';
import { RefreshCw, Search, FileText, Printer, AlertCircle, Clock, ChevronUp, ChevronDown, Bug, Info } from 'lucide-react';

const n = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round2 = (value) => Number(n(value).toFixed(2));
const fmt = (value) => round2(value).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const createInitialDateRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30);
  const pad2 = (value) => String(value).padStart(2, '0');

  return {
    fromDate: `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`,
    toDate: `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`,
  };
};

const PrintBillListPage = () => {
  const navigate = useNavigate();
  const initialDateRange = useMemo(createInitialDateRange, []);

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [printFormat, setPrintFormat] = useState('short');
  const [limit, setLimit] = useState(100);
  const [uiError, setUiError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const documentSearch = useSaleDocumentSearch({
    policy: BILL_DOCUMENT_SEARCH_POLICY,
    initialQuery: {
      keyword: '',
      fromDate: initialDateRange.fromDate,
      toDate: initialDateRange.toDate,
      limit: 100,
    },
  });

  const clampLimit = useCallback((value) => {
    const parsed = parseInt(value, 10);
    const safe = Number.isFinite(parsed) ? parsed : 100;
    return Math.min(Math.max(safe, 1), 500);
  }, []);

  const handleSearch = useCallback(async () => {
    setUiError(null);
    documentSearch.actions.clearError?.();

    if (fromDate && toDate && fromDate > toDate) {
      setUiError('ช่วงวันที่ไม่ถูกต้อง: วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    try {
      await documentSearch.actions.search({
        keyword: search,
        fromDate,
        toDate,
        limit: clampLimit(limit),
      });
    } catch (error) {
      setUiError(`❌ เกิดข้อผิดพลาดจากฐานข้อมูลหลังบ้าน: ${error?.message || 'Network Fail'}`);
    }
  }, [clampLimit, documentSearch.actions, fromDate, limit, search, toDate]);

  const getSortValue = (row, key) => {
    if (!row) return null;
    if (key === 'totalAmount') return n(row?.grossAmount ?? row?.totalAmount);
    if (key === 'paidAmount') return n(row?.paidAmount);
    if (key === 'receivedAmount') return n(row?.receivedAmount ?? row?.paidAmount);
    if (key === 'changeAmount') return n(row?.changeAmount);
    if (key === 'balanceAmount') return n(row?.balanceAmount);

    if (key === 'createdAt' || key === 'lastPaidAt') {
      const value = row?.[key];
      return value ? new Date(value).getTime() : 0;
    }

    return String(row?.[key] ?? '').toLowerCase();
  };

  const toggleSort = (key) => {
    if (!key) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 inline pl-0.5" />
      : <ChevronDown className="w-3 h-3 inline pl-0.5" />;
  };

  const sortedRows = useMemo(() => {
    return [...documentSearch.rows].sort((left, right) => {
      const leftValue = getSortValue(left, sortKey);
      const rightValue = getSortValue(right, sortKey);
      if (leftValue === rightValue) return 0;

      const direction = sortDir === 'asc' ? 1 : -1;
      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return leftValue > rightValue ? direction : -direction;
      }
      return String(leftValue) > String(rightValue) ? direction : -direction;
    });
  }, [documentSearch.rows, sortDir, sortKey]);

  return (
    <div className="w-full h-full p-2 md:p-3 space-y-3 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn text-xs md:text-sm antialiased font-sans font-semibold">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 pb-2.5 border-b border-slate-100 select-none">
          <div className="flex items-center justify-between xl:justify-start gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-slate-900/5 text-slate-800 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wide">พิมพ์ใบเสร็จและบิลภาษีย้อนหลัง</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-slate-900 text-white font-mono">{sortedRows.length} บิล</span>
              <button type="button" onClick={() => setShowDebug((value) => !value)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-0.5 transition-colors">
                <Bug className="w-3 h-3" /> {showDebug ? 'ซ่อนดีบัก' : 'ดีบักเกอร์'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                placeholder="ค้นชื่อลูกค้า, เบอร์โทร, รหัสบิล..."
                className="h-8 w-52 pl-8 pr-3 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="bg-transparent px-1 outline-none" />
              <span className="text-slate-400 font-sans">ถึง</span>
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="bg-transparent px-1 outline-none" />
            </div>

            <input
              type="number"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              onBlur={() => setLimit(clampLimit(limit))}
              placeholder="Limit"
              className="h-8 border border-slate-200 rounded-lg px-2 text-center font-mono font-black text-slate-900 bg-white w-14 outline-none text-xs"
              min="1"
            />

            <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 border-l border-slate-200 pl-3">
              <span className="text-slate-500 font-bold">เลย์เอาต์บิล:</span>
              <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <input type="radio" name="format" value="short" checked={printFormat === 'short'} onChange={() => setPrintFormat('short')} className="accent-slate-900 h-3.5 w-3.5" />
                <span className={printFormat === 'short' ? 'text-slate-900 font-black' : ''}>ย่อ</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <input type="radio" name="format" value="full" checked={printFormat === 'full'} onChange={() => setPrintFormat('full')} className="accent-slate-900 h-3.5 w-3.5" />
                <span className={printFormat === 'full' ? 'text-slate-900 font-black' : ''}>เต็มรูป</span>
              </label>
            </div>

            <button onClick={handleSearch} disabled={documentSearch.loading} className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 ml-auto xl:ml-0">
              <RefreshCw className={`w-3 h-3 ${documentSearch.loading ? 'animate-spin' : ''}`} />
              ค้นหา
            </button>
          </div>
        </div>

        {showDebug && (
          <div className="m-3 p-3 border border-slate-200 rounded-xl bg-slate-50 text-[11px] text-slate-600 font-mono space-y-1 animate-fadeIn">
            <div className="font-black text-slate-900 mb-1 flex items-center gap-1"><Bug className="w-3.5 h-3.5" /> BE Payload Sync Inspection:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>• keyword: <span className="font-black text-slate-900">"{documentSearch.lastQuery?.keyword ?? ''}"</span> | fromDate: <span className="font-black text-slate-900">"{documentSearch.lastQuery?.fromDate}"</span> | toDate: <span className="font-black text-slate-900">"{documentSearch.lastQuery?.toDate}"</span></div>
              <div>• loading: <span className="font-black text-slate-900">{String(documentSearch.loading)}</span> | Search Owner: <span className="font-black text-slate-900">🟢 BILL_DOCUMENT_SEARCH_POLICY</span></div>
            </div>
          </div>
        )}

        {uiError && <div className="mx-3 my-2 bg-rose-50 border border-rose-100 p-2 rounded-lg text-[11px] font-black text-rose-600 animate-slideUp">⚠️ {uiError}</div>}
        {documentSearch.error && <div className="mx-3 my-2 bg-rose-50 border border-rose-100 p-2 rounded-lg text-[11px] font-black text-rose-600 animate-slideUp">⚠️ {documentSearch.error}</div>}

        <div className="p-2 px-3">
          <div className="overflow-x-auto rounded-xl border border-slate-100 overflow-y-hidden">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wide border-b border-slate-100 select-none">
                <tr>
                  <th className="p-2.5 cursor-pointer" onClick={() => toggleSort('createdAt')}>วันที่ {sortIndicator('createdAt')}</th>
                  <th className="p-2.5">เลขที่บิล</th>
                  <th className="p-2.5">ลูกค้า</th>
                  <th className="p-2.5 text-right cursor-pointer" onClick={() => toggleSort('totalAmount')}>ยอดรวม {sortIndicator('totalAmount')}</th>
                  <th className="p-2.5 text-right cursor-pointer" onClick={() => toggleSort('paidAmount')}>รับชำระ {sortIndicator('paidAmount')}</th>
                  <th className="p-2.5 text-right cursor-pointer" onClick={() => toggleSort('changeAmount')}>เงินทอน {sortIndicator('changeAmount')}</th>
                  <th className="p-2.5 text-center">คำสั่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-slate-500 font-mono">{row.createdAt ? new Date(row.createdAt).toLocaleString('th-TH') : '-'}</td>
                    <td className="p-2.5 font-black text-slate-900">{row.code || row.id}</td>
                    <td className="p-2.5">
                      <div className="font-black text-slate-800">{row.customerName || row.customer?.name || '-'}</div>
                      <div className="text-[10px] text-slate-400">{row.customerPhone || row.customer?.phone || ''}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono font-black">฿{fmt(row.grossAmount)}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-600">฿{fmt(row.paidAmount)}</td>
                    <td className="p-2.5 text-right font-mono text-slate-500">฿{fmt(row.changeAmount)}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(printFormat === 'full' ? `../bill/print-full/${row.id}` : `../bill/print-short/${row.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white hover:bg-slate-800"
                      >
                        <Printer className="h-3 w-3" /> พิมพ์
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!documentSearch.loading && sortedRows.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-slate-400">
                <AlertCircle className="h-6 w-6" />
                <div className="font-black">ไม่พบรายการบิลที่ชำระแล้วในช่วงที่เลือก</div>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> ค้นหาล่าสุด: {documentSearch.lastSearchedAt ? new Date(documentSearch.lastSearchedAt).toLocaleString('th-TH') : '-'}</div>
            <div className="flex items-center gap-1"><Info className="h-3 w-3" /> แสดงเฉพาะรายการที่เข้าเกณฑ์ Bill policy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBillListPage;
