// src/features/deliveryNote/pages/DeliveryNoteListPage.jsx
// 🏛️ Premium Next-Gen POS Delivery Note Console: (Unified Production High-Density Grid)

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import { RefreshCw, Search, FileText, Printer, AlertCircle, Clock, ChevronUp, ChevronDown, Bug, Info } from 'lucide-react';

const DeliveryNoteListPage = () => {
  const didInitRef = useRef(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 30);
    const pad2 = (n) => String(n).padStart(2, '0');
    return `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  });
  
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    const pad2 = (n) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  });

  const [limit, setLimit] = useState(100);
  const [uiError, setUiError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);
  const [lastSearchedAt, setLastSearchedAt] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // ✅ Client-side sorting states
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const salesStore = useSalesStore() || {};
  const printableSales = salesStore.printableSales || [];
  const loading = salesStore.loading || false;
  const error = salesStore.error || null;
  const loadPrintableSalesAction = salesStore.loadPrintableSalesAction;

  const clampLimit = (n) => {
    const parsed = parseInt(n, 10);
    const safe = Number.isFinite(parsed) ? parsed : 100;
    return Math.min(Math.max(safe, 1), 500);
  };

  const handleSearch = useCallback(async () => {
    setUiError(null);

    if (fromDate && toDate && fromDate > toDate) {
      setUiError('ช่วงวันที่ไม่ถูกต้อง: วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    const params = {
      keyword: search,
      fromDate,
      toDate,
      limit: clampLimit(limit),
      onlyUnpaid: 1,
    };

    setLastQuery(params);
    setLastSearchedAt(new Date().toISOString());

    if (typeof loadPrintableSalesAction === 'function') {
      try {
        await loadPrintableSalesAction(params);
      } catch (err) {
        setUiError('❌ เกิดข้อผิดพลาดจากฐานข้อมูลหลังบ้าน: ' + (err.message || 'Network Fail'));
      }
    }
  }, [search, fromDate, toDate, limit, loadPrintableSalesAction]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    handleSearch();
  }, [handleSearch]);

  const rawRows = Array.isArray(printableSales) ? printableSales : [];

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const round2 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round(x * 100) / 100;
  };

  const getPaidAmount = (s) => {
    const candidates = [s?.paidAmount, s?.paidTotal, s?.paid, s?.paidSum, s?.totalPaid];
    for (let i = 0; i < candidates.length; i += 1) {
      const n = toNum(candidates[i]);
      if (n != null) return n;
    }
    const p = Array.isArray(s?.payments) ? s.payments : null;
    if (p && p.length > 0) {
      const sum = p.reduce((acc, it) => acc + toNum(it?.amount ?? it?.receivedAmount ?? 0), 0);
      return round2(sum);
    }
    return 0;
  };

  const getGrossTotalAmount = (s) => {
    const totalAmount = toNum(s?.totalAmount);
    const totalBeforeDiscountGross = toNum(s?.totalBeforeDiscount);

    if (totalAmount != null && totalBeforeDiscountGross != null) {
      if (Math.abs(totalAmount - totalBeforeDiscountGross) <= 0.05) return round2(totalAmount);
      return round2(Math.min(totalAmount, totalBeforeDiscountGross));
    }
    if (totalBeforeDiscountGross != null) return round2(totalBeforeDiscountGross);
    if (totalAmount != null) return round2(totalAmount);

    const beforeVat = toNum(s?.beforeVat ?? s?.totalBeforeVat ?? s?.subTotal ?? s?.subtotalAmount);
    const vatAmount = toNum(s?.vatAmount ?? s?.vat ?? s?.taxAmount ?? s?.vatTotal);

    if (beforeVat != null && vatAmount != null) return round2(beforeVat + vatAmount);

    const explicitCandidates = [s?.grandTotal, s?.totalWithVat, s?.totalInclVat, s?.totalAmountGross, s?.totalFinal, s?.amountTotal, s?.total];
    for (let i = 0; i < explicitCandidates.length; i += 1) {
      const n = toNum(explicitCandidates[i]);
      if (n != null) return round2(n);
    }

    const vatRate = toNum(s?.vatRate);
    if (beforeVat != null) {
      if (vatRate != null) return round2(beforeVat * (1 + vatRate / 100));
      return round2(beforeVat);
    }
    if (vatAmount != null) return round2(vatAmount);
    return 0;
  };

  const getRemainingAmount = (s) => {
    const candidates = [s?.remainingAmount, s?.balanceDue, s?.unpaidAmount, s?.dueAmount, s?.balanceAmount];
    for (let i = 0; i < candidates.length; i += 1) {
      const n = toNum(candidates[i]);
      if (n != null) return n;
    }
    return Math.max(0, round2(getGrossTotalAmount(s) - getPaidAmount(s)));
  };

  const isUnpaidSale = (s) => {
    if (getRemainingAmount(s) > 0.0001) return true;
    if (s?.isPaid === false) return true;
    if (s?.paymentStatus && String(s.paymentStatus).toUpperCase() === 'UNPAID') return true;
    return false;
  };

  const rows = useMemo(() => {
    const unpaidOnly = rawRows.filter((s) => isUnpaidSale(s));
    const nowTs = Date.now();
    const toDays = (ts) => Math.floor(Math.max(0, nowTs - Number(ts)) / (1000 * 60 * 60 * 24));

    const mapRow = (s) => {
      const createdAt = s?.createdAt ?? s?.soldAt ?? null;
      const createdTs = createdAt ? new Date(createdAt).getTime() : 0;
      return {
        id: s.id,
        code: s.code,
        companyName: s?.companyName ?? s?.customer?.companyName ?? '-',
        customerName: s?.customerName ?? s?.customer?.name ?? '-',
        customerPhone: s?.customerPhone ?? s?.customer?.phone ?? '-',
        totalAmount: getGrossTotalAmount(s),
        paidAmount: getPaidAmount(s),
        balanceAmount: getRemainingAmount(s),
        createdAt,
        agingDays: createdTs ? toDays(createdTs) : 0,
        lastPaidAt: s?.lastPaidAt ?? s?.lastReceivedAt ?? null,
        employeeName: s?.employeeName ?? s?.employee?.name ?? '-',
      };
    };

    const query = search.trim().toLowerCase();
    if (!query) return unpaidOnly.map(mapRow);

    return unpaidOnly
      .filter((s) => [s?.customer?.companyName, s?.customer?.name, s?.customer?.phone, s?.code].map(v => String(v ?? '').toLowerCase()).join(' | ').includes(query))
      .map(mapRow);
  }, [rawRows, search]);

  const getSortVal = (row, key) => {
    if (!row) return null;
    if (key === 'totalAmount' || key === 'paidAmount' || key === 'balanceAmount' || key === 'agingDays') return Number(row[key] || 0);
    if (key === 'createdAt' || key === 'lastPaidAt') return row[key] ? new Date(row[key]).getTime() : 0;
    return String(row[key] ?? '').toLowerCase();
  };

  const toggleSort = (key) => {
    if (!key) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline pl-0.5" /> : <ChevronDown className="w-3 h-3 inline pl-0.5" />;
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = getSortVal(a, sortKey);
      const bv = getSortVal(b, sortKey);
      if (av === bv) return 0;
      const dir = sortDir === 'asc' ? 1 : -1;
      return av > bv ? dir : -dir;
    });
  }, [rows, sortKey, sortDir]);

  const summary = useMemo(() => {
    const count = sortedRows.length;
    const totalSum = round2(sortedRows.reduce((acc, r) => acc + Number(r?.totalAmount || 0), 0));
    const paidSum = round2(sortedRows.reduce((acc, r) => acc + Number(r?.paidAmount || 0), 0));
    const balanceSum = round2(sortedRows.reduce((acc, r) => acc + Number(r?.balanceAmount || 0), 0));
    return { count, totalSum, paidSum, balanceSum, avg: count > 0 ? round2(totalSum / count) : 0 };
  }, [sortedRows]);

  const formatMoney = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

  const agingBadgeClass = (days) => {
    if (days >= 31) return 'bg-rose-50 border border-rose-100 text-rose-600';
    if (days >= 8) return 'bg-amber-50 border border-amber-100 text-amber-700';
    return 'bg-slate-900/5 text-slate-500 border border-slate-100';
  };

  return (
    <div className="w-full h-full p-2 md:p-3 space-y-3 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn text-xs md:text-sm antialiased font-sans font-semibold">
      
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
        {/* หัวแผงควบคุมระดับท็อป */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 pb-2.5 border-b border-slate-100 select-none">
          <div className="flex items-center justify-between xl:justify-start gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-slate-900/5 text-slate-800 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wide">พิมพ์ใบส่งของและตรวจสอบเครดิตค้างชำระ</h2>
            </div>
            <button type="button" onClick={() => setShowDebug((v) => !v)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-0.5 transition-colors">
              <Bug className="w-3 h-3" /> {showDebug ? 'ซ่อนดีบัก' : 'ดีบักเกอร์'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="ค้นชื่อลูกค้า, เบอร์โทร, รหัสใบขาย..."
                className="h-8 w-52 pl-8 pr-3 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all shadow-inner" />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent px-1 outline-none" />
              <span className="text-slate-400 font-sans">ถึง</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent px-1 outline-none" />
            </div>

            <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} onBlur={() => setLimit(clampLimit(limit))} placeholder="Limit" className="h-8 border border-slate-200 rounded-lg px-2 text-center font-mono font-black text-slate-900 bg-white w-14 outline-none text-xs" min="1" />

            <button onClick={handleSearch} disabled={loading} className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 ml-auto xl:ml-0">
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              ค้นหา
            </button>
          </div>
        </div>

        {showDebug && (
          <div className="m-3 p-3 border border-slate-200 rounded-xl bg-slate-50 text-[11px] text-slate-600 font-mono space-y-1 animate-fadeIn">
            <div className="font-black text-slate-900 mb-1 flex items-center gap-1"><Bug className="w-3.5 h-3.5" /> BE Payload Sync Inspection:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>• keyword: <span className="font-black text-slate-900">"{lastQuery?.keyword ?? ''}"</span> | fromDate: <span className="font-black text-slate-900">"{lastQuery?.fromDate}"</span> | toDate: <span className="font-black text-slate-900">"{lastQuery?.toDate}"</span></div>
              <div>• loading: <span className="font-black text-slate-900">{String(loading)}</span> | Action Status: <span className="font-black text-slate-900">{typeof loadPrintableSalesAction === 'function' ? '🟢 Ready' : '❌ Missing Action'}</span></div>
            </div>
          </div>
        )}

        {uiError && <div className="mx-3 my-2 bg-rose-50 border border-rose-100 p-2 rounded-lg text-[11px] font-black text-rose-600 animate-slideUp">⚠️ {uiError}</div>}
        {error && <div className="mx-3 my-2 bg-rose-50 border border-rose-100 p-2 rounded-lg text-[11px] font-black text-rose-600 animate-slideUp">⚠️ {error}</div>}

        {/* บล็อกสรุปผลลัพธ์แบบ High-Density 4 คอลัมน์พรีเมียม */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 border-b border-slate-100">
          <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner select-none">
            <div className="text-[10px] text-slate-400 font-black uppercase">เอกสารค้างชำระ</div>
            <div className="text-sm font-black text-slate-900 font-mono">{summary.count} ใบงาน</div>
          </div>
          <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner select-none">
            <div className="text-[10px] text-slate-400 font-black uppercase">มูลค่ารวมพัสดุ</div>
            <div className="text-sm font-black text-slate-800 font-mono">{formatMoney(summary.totalSum)} ฿</div>
          </div>
          <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner select-none">
            <div className="text-[10px] text-slate-400 font-black uppercase">ยอดหนี้ค้างชำระรวม</div>
            <div className="text-sm font-black text-rose-600 font-mono">{formatMoney(summary.balanceSum)} ฿</div>
          </div>
          <div className="border border-slate-150 rounded-xl p-2 bg-white shadow-inner select-none">
            <div className="text-[10px] text-slate-400 font-black uppercase">เฉลี่ยต่อใบส่งของ</div>
            <div className="text-sm font-black text-emerald-700 font-mono">{formatMoney(summary.avg)} ฿</div>
          </div>
        </div>

        {/* ตัวตารางข้อมูลพรีเมียมกระชับพื้นที่ */}
        <div className="p-2 px-3">
          <div className="overflow-x-auto rounded-xl border border-slate-100 overflow-y-auto max-h-[550px]">
            <table className="w-full text-left border-collapse border-slate-200 text-xs">
              <thead className="bg-slate-50 text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-wider sticky top-0 bg-slate-50 z-10 select-none border-b border-slate-100">
                <tr>
                  <th className="p-2 px-2.5 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('code')}>เลขที่ใบขาย {sortIndicator('code')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('companyName')}>หน่วยงาน {sortIndicator('companyName')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('customerName')}>ลูกค้า {sortIndicator('customerName')}</th>
                  <th className="p-2 px-2">เบอร์โทร</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('totalAmount')}>ยอดรวม {sortIndicator('totalAmount')}</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('paidAmount')}>ชำระแล้ว {sortIndicator('paidAmount')}</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('balanceAmount')}>ค้างชำระ {sortIndicator('balanceAmount')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('createdAt')}>วันที่ขาย {sortIndicator('createdAt')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('agingDays')}>ค้างมาแล้ว {sortIndicator('agingDays')}</th>
                  <th className="p-2 px-2">ผู้ทำรายการ</th>
                  <th className="p-2 px-2.5 text-center">สั่งการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
                {sortedRows.length > 0 ? (
                  sortedRows.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 px-2.5 font-mono font-black text-slate-900 select-all">{s.code || '-'}</td>
                      <td className="p-2 px-2 truncate max-w-[130px] font-bold text-slate-700" title={s.companyName}>{s.companyName || '-'}</td>
                      <td className="p-2 px-2 truncate max-w-[130px] font-bold text-slate-900" title={s.customerName}>{s.customerName || '-'}</td>
                      <td className="p-2 px-2 font-mono text-slate-500">{s.customerPhone || '-'}</td>
                      <td className="p-2 px-2 text-right font-mono text-slate-400">{formatMoney(s.totalAmount)}</td>
                      <td className="p-2 px-2 text-right font-mono text-emerald-700">{formatMoney(s.paidAmount)}</td>
                      <td className="p-2 px-2 text-right font-mono text-rose-600 font-black">{formatMoney(s.balanceAmount)}</td>
                      <td className="p-2 px-2 font-mono text-slate-400">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' }) : '-'}</td>
                      <td className="p-2 px-2">
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-black rounded-md ${agingBadgeClass(s.agingDays)}`}>
                          {s.agingDays} วัน
                        </span>
                      </td>
                      <td className="p-2 px-2 text-slate-500 truncate max-w-[90px]">{s.employeeName || '-'}</td>
                      <td className="p-2 px-2.5 text-center">
                        {/* 🟢 [SAME WINDOW NAVIGATION VERIFIED]:
                             ถอดสัญกรณ์และคำนวณ Base URL ปัจจุบัน เพื่อนำทางไปสู่ใบส่งของ A4 ในหน้าต่างเดิมอย่างแม่นยำ ไม่เด้งหนี 100% */}
                        <button type="button"
                          onClick={() => {
                            const currentPath = window.location.pathname; 
                            const basePosSalesPath = currentPath.substring(0, currentPath.indexOf('/delivery-note'));
                            navigate(`${basePosSalesPath}/delivery-note/print/${s.id}`);
                          }}
                          className="h-6 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-md shadow-sm transition-all flex items-center justify-center gap-1 mx-auto active:scale-95">
                          <Printer className="w-3 h-3" /> พิมพ์ซ้ำ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="p-10 text-center text-slate-400 italic font-bold select-none">
                      📭 ไม่พบประวัติใบส่งของค้างชำระตามเงื่อนไขตัวกรองพิกัดปัจจุบัน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-2 bg-slate-50/40 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1 select-none">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>ระบบคลังกรองดึงสถานะ Unpaid เครดิตค้างจ่ายหน้าร้านแบบเรียลไทม์อัตโนมัติ 100%</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteListPage;