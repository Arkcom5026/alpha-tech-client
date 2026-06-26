// src/features/bill/pages/PrintBillListPage.jsx
// 🏛️ Premium Next-Gen POS Bill Management Console: (Same-Window Navigation Hardened Edition)

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import { RefreshCw, Search, FileText, Printer, AlertCircle, Clock, ChevronUp, ChevronDown, Bug, Info } from 'lucide-react';

// ✅ Money helpers
const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const round2 = (v) => Number(n(v).toFixed(2));
const fmt = (v) => round2(v).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PrintBillListPage = () => {
  const didInitRef = useRef(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 30);
    const pad2 = (x) => String(x).padStart(2, '0');
    return `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  });
  
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    const pad2 = (x) => String(x).padStart(2, '0');
    return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  });

  const [printFormat, setPrintFormat] = useState('short');
  const [limit, setLimit] = useState(100);
  const [uiError, setUiError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);
  const [lastSearchedAt, setLastSearchedAt] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // ✅ Client-side sorting states
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // 🛡️ [ANTI-CRASH PRO-GUARD]
  const salesStore = useSalesStore() || {};
  const printableSales = salesStore.printableSales || [];
  const loading = salesStore.loading || false;
  const error = salesStore.error || null;
  
  const loadPrintableSalesAction = 
    salesStore.loadPrintableSalesAction || 
    salesStore.fetchPrintableSalesAction || 
    salesStore.loadSalesAction ||
    null;

  const clampLimit = (x) => {
    const parsed = parseInt(x, 10);
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
      onlyPaid: 1,
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

  const rowsRaw = Array.isArray(printableSales) ? printableSales : [];
  
  const rows = useMemo(() => {
    if (rowsRaw.length > 0) {
      return rowsRaw.filter((r) => n(r?.paidAmount) > 0);
    }
    return [];
  }, [rowsRaw]);

  const withComputed = useMemo(() => {
    return rows.map((r) => {
      const gross = n(r?.totalAmount);
      const received = n(r?.paidAmount);
      const appliedPaid = Math.min(received, gross);
      const changeAmount = Math.max(received - gross, 0);
      const balanceComputed = Math.max(gross - appliedPaid, 0);

      return {
        ...r,
        _gross: gross,
        _received: received,
        _appliedPaid: appliedPaid,
        _change: changeAmount,
        _balance: balanceComputed,
      };
    });
  }, [rows]);

  const getSortVal = (row, key) => {
    if (!row) return null;
    if (key === 'totalAmount') return n(row?._gross ?? row?.totalAmount);
    if (key === 'paidAmount') return n(row?._appliedPaid ?? row?.paidAmount);
    if (key === 'receivedAmount') return n(row?._received ?? row?.paidAmount);
    if (key === 'changeAmount') return n(row?._change);
    if (key === 'balanceAmount') return n(row?._balance ?? row?.balanceAmount);

    if (key === 'createdAt' || key === 'lastPaidAt') {
      const v = row?.[key];
      return v ? new Date(v).getTime() : 0;
    }
    return String(row?.[key] ?? '').toLowerCase();
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
    return [...withComputed].sort((a, b) => {
      const av = getSortVal(a, sortKey);
      const bv = getSortVal(b, sortKey);

      if (av === bv) return 0;
      const dir = sortDir === 'asc' ? 1 : -1;

      if (typeof av === 'number' && typeof bv === 'number') return av > bv ? dir : -dir;
      return String(av) > String(bv) ? dir : -dir;
    });
  }, [withComputed, sortKey, sortDir]);

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
              <button type="button" onClick={() => setShowDebug((v) => !v)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 flex items-center gap-0.5 transition-colors">
                <Bug className="w-3 h-3" /> {showDebug ? 'ซ่อนดีบัก' : 'ดีบักเกอร์'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="ค้นชื่อลูกค้า, เบอร์โทร, รหัสบิล..."
                className="h-8 w-52 pl-8 pr-3 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all shadow-inner" />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent px-1 outline-none" />
              <span className="text-slate-400 font-sans">ถึง</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent px-1 outline-none" />
            </div>

            <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} onBlur={() => setLimit(clampLimit(limit))} placeholder="Limit" className="h-8 border border-slate-200 rounded-lg px-2 text-center font-mono font-black text-slate-900 bg-white w-14 outline-none text-xs" min="1" />

            <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 border-l border-slate-200 pl-3">
              <span className="text-slate-500 font-bold">เลย์เอาต์บิล:</span>
              <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <input type="radio" name="format" value="short" checked={printFormat === 'short'} onChange={() => setPrintFormat('short')} className="accent-slate-900 h-3.5 w-3.5" />
                <span className={printFormat === 'short' ? "text-slate-900 font-black" : ""}>ย่อ</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <input type="radio" name="format" value="full" checked={printFormat === 'full'} onChange={() => setPrintFormat('full')} className="accent-slate-900 h-3.5 w-3.5" />
                <span className={printFormat === 'full' ? "text-slate-900 font-black" : ""}>เต็มรูป</span>
              </label>
            </div>

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

        <div className="p-2 px-3">
          <div className="overflow-x-auto rounded-xl border border-slate-100 overflow-y-auto max-h-[550px]">
            <table className="w-full text-left border-collapse border-slate-200 text-xs">
              <thead className="bg-slate-50 text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-wider sticky top-0 bg-slate-50 z-10 select-none border-b border-slate-100">
                <tr>
                  <th className="p-2 px-2.5 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('code')}>เลขที่บิล {sortIndicator('code')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('companyName')}>หน่วยงาน {sortIndicator('companyName')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('customerName')}>ลูกค้า {sortIndicator('customerName')}</th>
                  <th className="p-2 px-2">เบอร์โทร</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('totalAmount')}>ยอดรวม {sortIndicator('totalAmount')}</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('paidAmount')}>ชำระแล้ว {sortIndicator('paidAmount')}</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('receivedAmount')}>รับเงิน {sortIndicator('receivedAmount')}</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('changeAmount')}>เงินทอน {sortIndicator('changeAmount')}</th>
                  <th className="p-2 px-2 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('balanceAmount')}>ค้างชำระ {sortIndicator('balanceAmount')}</th>
                  <th className="p-2 px-2 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('createdAt')}>วันที่ขาย {sortIndicator('createdAt')}</th>
                  <th className="p-2 px-2">ผู้รับเงิน</th>
                  <th className="p-2 px-2 text-center" colSpan={2}>สั่งการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px] sm:text-xs">
                {sortedRows.length > 0 ? (
                  sortedRows.map((s) => {
                    const gross = s._gross;
                    const received = s._received;
                    const appliedPaid = s._appliedPaid;
                    const changeAmount = s._change;
                    const balance = s._balance;

                    const canPrint = appliedPaid > 0;
                    const isFullyPaid = balance <= 0 && canPrint;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 px-2.5 font-mono font-black text-slate-900 select-all">{s.code || '-'}</td>
                        <td className="p-2 px-2 truncate max-w-[130px] font-bold text-slate-700" title={s.companyName}>{s.companyName || '-'}</td>
                        <td className="p-2 px-2 truncate max-w-[130px] font-bold text-slate-900" title={s.customerName}>{s.customerName || '-'}</td>
                        <td className="p-2 px-2 font-mono text-slate-500">{s.customerPhone || '-'}</td>
                        <td className="p-2 px-2 text-right font-mono text-slate-400">{fmt(gross)}</td>
                        <td className="p-2 px-2 text-right font-mono text-emerald-700 font-black">{fmt(appliedPaid)}</td>
                        <td className="p-2 px-2 text-right font-mono text-slate-500">{fmt(received)}</td>
                        <td className="p-2 px-2 text-right font-mono text-amber-600">{fmt(changeAmount)}</td>
                        <td className="p-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono">{fmt(balance)}</span>
                            {canPrint ? (
                              <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-black rounded-md ${isFullyPaid ? 'bg-slate-900/5 text-emerald-600' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {isFullyPaid ? 'ชำระครบ' : 'บางส่วน'}
                              </span>
                            ) : (
                              <span className="inline-flex px-1.5 py-0.5 text-[9px] font-black rounded-md bg-rose-50 text-rose-600">ค้างชำระ</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2 px-2 font-mono text-slate-400">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' }) : '-'}</td>
                        <td className="p-2 px-2 text-slate-500 truncate max-w-[90px]">{s.employeeName || '-'}</td>
                        <td className="p-2 px-1 text-center">
                          <button type="button" onClick={() => navigate(`/sale-detail/${s.id}`)} className="h-6 px-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-[10px] rounded-md shadow-sm transition-all">
                            ดีเทล
                          </button>
                        </td>
                        <td className="p-2 px-1 text-center">
                          {/* 🟢 [SAME WINDOW NAVIGATION FIXED]: 
                               สลับมาใช้ navigate() สั่งสับรางในหน้าต่างเดิม และคำนวณสแลชสัมพันธ์สัมพัทธ์แบบ Dynamic 
                               เพื่อป้องกันอาการหลุดเลนหน้าขาวหรือดีดกลับไปหน้าแรกครับ */}
                          <button type="button" disabled={!canPrint} title={canPrint ? 'พิมพ์บิล' : 'ยังไม่ชำระเงิน'}
                            onClick={() => {
                              if (!canPrint) return;
                              
                              const printSegment = printFormat === 'short' ? 'print-short' : 'print-full';
                              
                              // ดึงชื่อซับโดเมน /advance/ หรือพาธปัจจุบันมาสับท่อนสลับเลน
                              const currentPath = window.location.pathname; 
                              const basePosSalesPath = currentPath.substring(0, currentPath.indexOf('/bill'));
                              
                              // ผลลัพธ์สุดท้ายจะวิ่งไปที่ /advance/pos/sales/print-short/701 บนหน้าต่างเดิมทันที
                              const finalInternalUrl = `${basePosSalesPath}/${printSegment}/${s.id}`;
                              
                              navigate(finalInternalUrl);
                            }}
                            className={`h-6 px-2.5 font-black text-[10px] rounded-md transition-all flex items-center justify-center gap-1 mx-auto ${canPrint ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                            <Printer className="w-3 h-3" /> {canPrint ? 'พิมพ์บิล' : 'ล็อกบิล'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13} className="p-10 text-center text-slate-400 italic font-bold select-none">
                      📭 ไม่พบประวัติใบเสร็จตามเงื่อนไขตัวกรองพิกัดปัจจุบัน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-2 bg-slate-50/40 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1 select-none">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>บิลคำนวณแบบรวมภาษีมูลค่าเพิ่มเรียบร้อย ยอดชำระยึดตามกลไก Applied Paid Settle ดักจับการรับเงินสดเกินจริงหน้าร้านอัตโนมัติ</span>
        </div>
      </div>
    </div>
  );
};

export default PrintBillListPage;