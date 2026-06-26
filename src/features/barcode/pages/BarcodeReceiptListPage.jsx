// src/features/barcode/pages/BarcodeReceiptListPage.jsx
// 🏛️ Premium Next-Gen Barcode List: (Fixed Tenant Navigation, Aurora Switch, Glassmorphic Filter Pack)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// 🟢 [IMPORT FIXED] เรียกใช้งาน useParams จากโครงสร้างหลักเพื่อปลดล็อกสิทธิ์ชื่อบริษัทคั่น URL
import { useNavigate, useParams } from 'react-router-dom';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import BarcodePrintTable from '../controllers/BarcodePrintTable';
import { RefreshCw, Barcode, SlidersHorizontal, Tag, Search, ArrowRight, AlertCircle, X } from 'lucide-react';

const BarcodeReceiptListPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🟢 [SLUG ACTIVATED] เจาะจงดักจับพิกัด Dynamic Shop Slug ประจำหน้า
  
  // 🟢 [NAVIGATE FIXED] ผูกคำสั่งส่งสิทธิ์ชื่อบริษัทคั่นกลาง ไร้อาการสะบัดเด้งกลับหน้าแรก 100%
  const goBarcodeRange = () => {
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/purchases/barcodes/range-print`);
  };

  const LS_MODE_KEY = 'pos:barcodeReceiptList:lastMode';
  const LS_SUPPLIER_KEY_UNPRINTED = 'pos:barcodeReceiptList:lastSupplier:UNPRINTED';
  const LS_SUPPLIER_KEY_REPRINT = 'pos:barcodeReceiptList:lastSupplier:REPRINT';
  const getSupplierLsKey = (m) => (m === 'REPRINT' ? LS_SUPPLIER_KEY_REPRINT : LS_SUPPLIER_KEY_UNPRINTED);

  const [codeKeyword, setCodeKeyword] = useState('');
  const [supplierSelected, setSupplierSelected] = useState('ALL'); 
  const [mode, setMode] = useState('UNPRINTED'); 
  const [unprintedSupplierOptions, setUnprintedSupplierOptions] = useState([]);
  const [supplierNameKeyword, setSupplierNameKeyword] = useState('');
  const [remoteSupplierSearchActive, setRemoteSupplierSearchActive] = useState(false);
  const [remoteCodeSearchActive, setRemoteCodeSearchActive] = useState(false);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!lastLoadedAt) return;
    const t = setInterval(() => setNowTick(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, [lastLoadedAt]);

  const formatRelativeTh = useCallback((ts) => {
    try {
      const n = Number(ts);
      if (!Number.isFinite(n) || n <= 0) return '';
      const diff = Math.max(0, nowTick - n);
      const sec = Math.floor(diff / 1000);
      if (sec < 10) return 'เมื่อสักครู่';
      if (sec < 60) return `เมื่อ ${sec} วินาทีที่แล้ว`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `เมื่อ ${min} นาทีที่แล้ว`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `เมื่อ ${hr} ชั่วโมงที่แล้ว`;
      const day = Math.floor(hr / 24);
      return `เมื่อ ${day} วันที่แล้ว`;
    } catch {
      return '';
    }
  }, [nowTick]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (mode === 'REPRINT') {
      const kw = String(codeKeyword ?? '').trim();
      if (kw) chips.push({ key: 'code', label: `RC/PO: ${kw}` });
      const skw = String(supplierNameKeyword ?? '').trim();
      if (skw) chips.push({ key: 'supplierName', label: `Supplier: ${skw}` });
    }
    if (supplierSelected && supplierSelected !== 'ALL') chips.push({ key: 'supplierSel', label: `กรอง: ${supplierSelected}` });
    return chips;
  }, [mode, codeKeyword, supplierNameKeyword, supplierSelected]);

  const runReceiptSearchFnRef = useRef(null);

  const clearAllFilters = useCallback(() => {
    setCodeKeyword('');
    setSupplierNameKeyword('');
    setSupplierSelected('ALL');
    setRemoteSupplierSearchActive(false);
    setRemoteCodeSearchActive(false);

    if (mode === 'UNPRINTED') return;

    try {
      const fn = runReceiptSearchFnRef.current;
      if (typeof fn === 'function') fn({ nextCodeKeyword: '', nextSupplierNameKeyword: '', nextSupplierSelected: 'ALL', source: 'clear' });
    } catch (_) {}
  }, [mode]);

  const {
    receiptSummaries,
    loadReceiptSummariesAction,
    loading,
    error,
  } = usePurchaseOrderReceiptStore();

  const suppliers = useSupplierStore((s) => s?.suppliers ?? s?.supplierList ?? []);

  const restoreModeOnceRef = useRef(true);
  useEffect(() => {
    if (!restoreModeOnceRef.current) return;
    restoreModeOnceRef.current = false;
    setMode('UNPRINTED');
    try {
      localStorage.setItem(LS_MODE_KEY, 'UNPRINTED');
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MODE_KEY, mode);
    } catch (_) {}
  }, [mode]);

  const pendingRestoreSupplierRef = useRef(null);
  useEffect(() => {
    try {
      pendingRestoreSupplierRef.current = localStorage.getItem(getSupplierLsKey(mode));
    } catch (_) {
      pendingRestoreSupplierRef.current = null;
    }
  }, [mode]);

  useEffect(() => {
    if (!supplierSelected || supplierSelected === 'ALL') return;
    try {
      localStorage.setItem(getSupplierLsKey(mode), supplierSelected);
    } catch (_) {}
  }, [supplierSelected, mode]);

  const hasData = Array.isArray(receiptSummaries) && receiptSummaries.length > 0;
  const norm = (v) => String(v ?? '').trim().toLowerCase();

  const getSupplierId = (r) => {
    const raw = r?.supplierId ?? r?.supplier?.id ?? r?.Supplier?.id ?? null;
    const n = raw == null ? null : Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const supplierNameById = useMemo(() => {
    const list = Array.isArray(suppliers) ? suppliers : [];
    const map = new Map();
    for (const s of list) {
      const id = s?.id ?? s?.supplierId ?? null;
      const name = String(s?.name ?? s?.supplierName ?? '').trim();
      if (id == null || !name) continue;
      map.set(String(id), name);
    }
    return map;
  }, [suppliers]);

  const supplierIdByNormalizedName = useMemo(() => {
    const list = Array.isArray(suppliers) ? suppliers : [];
    const map = new Map();
    for (const s of list) {
      const idRaw = s?.id ?? s?.supplierId ?? null;
      const id = Number(idRaw);
      const name = String(s?.name ?? s?.supplierName ?? '').trim();
      if (!Number.isFinite(id) || !name) continue;
      const key = norm(name);
      if (!map.has(key)) map.set(key, id);
    }
    return map;
  }, [suppliers]);

  const getSupplierName = (r) => {
    const s = r?.supplier ?? r?.Supplier ?? null;
    let name = '';
    if (typeof s === 'object' && s) name = s?.name ?? s?.supplierName ?? s?.title ?? s?.companyName ?? '';
    else if (typeof s === 'string') name = s;
    else name = r?.supplierName ?? r?.supplierTitle ?? r?.supplierFullName ?? r?.supplierDisplay ?? '';

    name = String(name ?? '').trim();
    if (name) return name;

    const sid = getSupplierId(r);
    if (sid == null) return '';
    return String(supplierNameById.get(String(sid)) ?? '').trim();
  };

  const baseByMode = useMemo(() => {
    const all = Array.isArray(receiptSummaries) ? receiptSummaries : [];
    return all;
  }, [receiptSummaries]);

  const supplierOptions = useMemo(() => {
    const all = Array.isArray(baseByMode) ? baseByMode : [];
    const map = new Map();
    for (const r of all) {
      const name = String(getSupplierName(r) ?? '').trim();
      if (!name) continue;
      const key = norm(name);
      if (!map.has(key)) map.set(key, name);
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'th'));
  }, [baseByMode, supplierNameById]);

  useEffect(() => {
    if (mode !== 'UNPRINTED') return;
    if (!Array.isArray(supplierOptions) || supplierOptions.length === 0) return;
    setUnprintedSupplierOptions((prev) => {
      const sameLen = Array.isArray(prev) && prev.length === supplierOptions.length;
      const same = sameLen && prev.every((v, i) => v === supplierOptions[i]);
      return same ? prev : supplierOptions;
    });
  }, [mode, supplierOptions]);

  const dropdownSupplierOptions = useMemo(() => {
    if (mode === 'REPRINT') {
      return Array.isArray(unprintedSupplierOptions) && unprintedSupplierOptions.length > 0
        ? unprintedSupplierOptions
        : supplierOptions;
    }
    return supplierOptions;
  }, [mode, unprintedSupplierOptions, supplierOptions]);

  const codeKeywordRef = useRef(codeKeyword);
  const supplierNameKeywordRef = useRef(supplierNameKeyword);
  const supplierSelectedRef = useRef(supplierSelected);

  useEffect(() => { codeKeywordRef.current = codeKeyword; }, [codeKeyword]);
  useEffect(() => { supplierNameKeywordRef.current = supplierNameKeyword; }, [supplierNameKeyword]);
  useEffect(() => { supplierSelectedRef.current = supplierSelected; }, [supplierSelected]);

  const runReceiptSearch = useCallback(
    ({ nextCodeKeyword, nextSupplierNameKeyword, nextSupplierSelected, source } = {}) => {
      if (typeof loadReceiptSummariesAction !== 'function') return;

      const printed = mode === 'UNPRINTED' ? false : true;
      const kwCode = String(nextCodeKeyword ?? codeKeywordRef.current ?? '').trim();
      const kwSupplierName = String(nextSupplierNameKeyword ?? supplierNameKeywordRef.current ?? '').trim();
      const selSup = String(nextSupplierSelected ?? supplierSelectedRef.current ?? 'ALL');

      const supplierKeywordEffective = kwSupplierName || (selSup && selSup !== 'ALL' ? selSup : '');
      const supplierIdEffective = !kwSupplierName && selSup && selSup !== 'ALL'
        ? supplierIdByNormalizedName.get(norm(selSup))
        : undefined;

      loadReceiptSummariesAction({
        printed,
        ...(kwCode ? { q: kwCode } : {}),
        ...(Number.isFinite(supplierIdEffective) ? { supplierId: supplierIdEffective } : {}),
        ...(!Number.isFinite(supplierIdEffective) && supplierKeywordEffective ? { supplier: supplierKeywordEffective } : {}),
        limit: 50,
      });

      setRemoteSupplierSearchActive(Boolean(kwSupplierName));
      setRemoteCodeSearchActive(Boolean(kwCode) && source === 'code');

      if (kwSupplierName && supplierSelectedRef.current !== 'ALL') {
        setSupplierSelected('ALL');
      }
      setLastLoadedAt(Date.now());
    },
    [loadReceiptSummariesAction, mode, supplierIdByNormalizedName]
  );

  useEffect(() => { runReceiptSearchFnRef.current = runReceiptSearch; }, [runReceiptSearch]);

  const lastModeRef = useRef(null);
  useEffect(() => {
    if (typeof loadReceiptSummariesAction !== 'function') return;
    if (lastModeRef.current === mode) return;
    lastModeRef.current = mode;

    setCodeKeyword('');
    setSupplierNameKeyword('');
    setRemoteSupplierSearchActive(false);
    setRemoteCodeSearchActive(false);
    setSupplierSelected('ALL');

    runReceiptSearch({ source: 'mode' });
  }, [mode, loadReceiptSummariesAction, runReceiptSearch]);

  useEffect(() => {
    const pending = pendingRestoreSupplierRef.current;
    if (!pending) return;
    if (supplierSelected !== 'ALL') return;

    const key = norm(pending);
    const matched = dropdownSupplierOptions.find((n) => norm(n) === key);
    if (matched) {
      setSupplierSelected(matched);
      if (mode !== 'UNPRINTED') {
        runReceiptSearch({ nextSupplierSelected: matched, nextSupplierNameKeyword: '', source: 'restoreSupplier' });
      }
    }
    pendingRestoreSupplierRef.current = null;
  }, [dropdownSupplierOptions, supplierSelected, runReceiptSearch, mode]);

  const codeDebounceRef = useRef(null);
  useEffect(() => {
    if (mode !== 'REPRINT') return;
    const kw = String(codeKeyword ?? '').trim();

    if (!kw) {
      setRemoteCodeSearchActive(false);
      if (codeDebounceRef.current) {
        clearTimeout(codeDebounceRef.current);
        codeDebounceRef.current = null;
      }
      return;
    }

    if (codeDebounceRef.current) {
      clearTimeout(codeDebounceRef.current);
      codeDebounceRef.current = null;
    }

    codeDebounceRef.current = setTimeout(() => {
      runReceiptSearch({ nextCodeKeyword: kw, source: 'code' });
    }, 500);

    return () => {
      if (codeDebounceRef.current) {
        clearTimeout(codeDebounceRef.current);
        codeDebounceRef.current = null;
      }
    };
  }, [codeKeyword, mode, runReceiptSearch]);

  const visibleReceipts = useMemo(() => {
    let list = Array.isArray(baseByMode) ? baseByMode : [];
    if (mode === 'UNPRINTED') {
      const sel = String(supplierSelected ?? 'ALL');
      if (sel && sel !== 'ALL') {
        const key = norm(sel);
        list = list.filter((r) => norm(getSupplierName(r)) === key);
      }
    }

    const ts = (r) => {
      const d = r?.receivedAt ?? r?.receiptDate ?? r?.dateReceived ?? r?.createdAt ?? r?.updatedAt ?? null;
      const t = d ? Date.parse(d) : NaN;
      return Number.isFinite(t) ? t : 0;
    };

    return [...list].sort((a, b) => {
      const dt = ts(b) - ts(a);
      if (dt) return dt;
      const rcA = String(a?.receiptCode ?? a?.code ?? a?.receiptNo ?? '');
      const rcB = String(b?.receiptCode ?? b?.code ?? b?.receiptNo ?? '');
      const c = rcB.localeCompare(rcA, 'en');
      if (c) return c;
      const poA = String(a?.purchaseOrderCode ?? a?.poCode ?? a?.purchaseOrder?.code ?? '');
      const poB = String(b?.purchaseOrderCode ?? b?.poCode ?? b?.purchaseOrder?.code ?? '');
      return poB.localeCompare(poA, 'en');
    });
  }, [baseByMode, mode, supplierSelected]);

  const showError = !loading && error != null;
  const reloadCurrentMode = () => { runReceiptSearch({ source: 'refresh' }); };
  const runRemoteSupplierSearch = () => {
    const kw = String(supplierNameKeyword ?? '').trim();
    runReceiptSearch({ nextSupplierNameKeyword: kw, source: 'supplierName' });
  };

  return (
    <div className="w-full h-full p-6 space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn">
      
      {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphism ผสานปุ่มฟังก์ชันสะท้อนออร่า */}
      <div className="bg-white/80 border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-md flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 transition-all duration-300">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Barcode className="w-5 h-5 text-orange-500" /> รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-bold tracking-wide">
            Barcode Issuance Command Center • ตรวจสอบรายการใบรับของภาษีพัสดุเพื่อจัดพิมพ์เลขซีเรียลประจำสาขา
          </p>
        </div>

        {/* ชุดปุ่มกดคำสั่งฝั่งขวา ลอยมน มีมิติสปริง */}
        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          {lastLoadedAt && (
            <div className="text-[11px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner select-none" title={new Date(lastLoadedAt).toLocaleString('th-TH')}>
              🔄 อัปเดตล่าสุด: {formatRelativeTh(lastLoadedAt)}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={reloadCurrentMode}
            className={`flex items-center gap-1.5 h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm border border-slate-200/60 rounded-xl shadow-sm transform active:scale-95 hover:-translate-y-px transition-all duration-200 ${loading ? 'opacity-60 cursor-not-allowed animate-pulse' : ''}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            <span>{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
          </button>

          <button
            type="button"
            onClick={goBarcodeRange}
            className="flex items-center gap-1.5 h-10 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl border border-orange-400/10 shadow-[0_4px_15px_rgba(249,115,22,0.2)] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            <span>พิมพ์บาร์โค้ด (ช่วงเลข)</span>
            <ArrowRight className="w-4 h-4 text-orange-100" />
          </button>
        </div>
      </div>

      {/* 🎨 2. แถบสวิตช์สลับโหมดแคบซูล Aurora Switch แทนที่เรดิโอโบราณ */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/40 shadow-inner select-none">
        <button
          type="button"
          onClick={() => setMode('UNPRINTED')}
          className={`px-5 py-2 text-xs font-black rounded-xl transition-all duration-300 ${mode === 'UNPRINTED' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          ยังไม่ได้พิมพ์
        </button>
        <button
          type="button"
          onClick={() => setMode('REPRINT')}
          className={`px-5 py-2 text-xs font-black rounded-xl transition-all duration-300 ${mode === 'REPRINT' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          พิมพ์ซ้ำ
        </button>
      </div>

      {/* 🟦 3. กล่องรวมศูนย์ควบคุมตัวกรองอัจฉริยะ (Smart Filter Hub Container) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        
        {/* แถบ Chips ตัวกรองแบรนด์เกรด */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
            <span className="text-[11px] font-black text-slate-400 flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5" /> กำลังใช้ตัวกรอง:</span>
            {activeFilterChips.map((c) => (
              <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/10 bg-orange-500/5 px-3 py-1 text-xs font-black text-orange-700 shadow-sm animate-fadeIn">
                {c.label}
                <button
                  type="button"
                  onClick={() => {
                    if (c.key === 'code') setCodeKeyword('');
                    if (c.key === 'supplierName') setSupplierNameKeyword('');
                    if (c.key === 'supplierSel') setSupplierSelected('ALL');
                    if (mode === 'REPRINT' && c.key !== 'supplierSel') {
                      runReceiptSearch({
                        nextCodeKeyword: c.key === 'code' ? '' : String(codeKeywordRef.current ?? '').trim(),
                        nextSupplierNameKeyword: c.key === 'supplierName' ? '' : String(supplierNameKeywordRef.current ?? '').trim(),
                        nextSupplierSelected: supplierSelectedRef.current ?? 'ALL',
                        source: 'chip',
                      });
                    }
                  }}
                  className="hover:bg-orange-500/10 text-orange-400 hover:text-orange-700 rounded-full h-4 w-4 inline-flex items-center justify-center font-bold text-xs transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button type="button" onClick={clearAllFilters} className="ml-2 text-xs font-black text-slate-400 underline hover:text-orange-500 transition-colors">
              ล้างทั้งหมด
            </button>
          </div>
        )}

        {/* ชุดเครื่องมือ Input กล่องเลือกซัพพลายเออร์และกรองลึก */}
        <div className="flex flex-wrap items-end gap-4">
          
          {mode === 'REPRINT' && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-xs font-black text-slate-500 flex items-center gap-1"><Search className="w-3.5 h-3.5" /> ค้นหาด้วยเลข RC/PO</label>
              <input
                type="text"
                className="h-10 w-64 rounded-xl border border-slate-200 px-3 text-sm font-bold bg-slate-50 focus:bg-white focus:border-orange-500 outline-none transition-all shadow-inner"
                placeholder="เช่น RC-... หรือ PO-..."
                value={codeKeyword}
                onChange={(e) => setCodeKeyword(e.target.value)}
              />
            </div>
          )}

          {mode === 'REPRINT' && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-xs font-black text-slate-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> ค้นหาคู่ค้า (Deep Search)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="h-10 w-60 rounded-xl border border-slate-200 px-3 text-sm font-bold bg-slate-50 focus:bg-white focus:border-orange-500 outline-none transition-all shadow-inner"
                  placeholder="พิมพ์ชื่อ Supplier แล้วกดค้นหา"
                  value={supplierNameKeyword}
                  onChange={(e) => setSupplierNameKeyword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={runRemoteSupplierSearch}
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black px-4 shadow-sm active:scale-95 transition-all"
                >
                  ค้นหา
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-500 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> ตัวกรองค่ายซัพพลายเออร์</label>
            <select
              className="h-10 w-[320px] rounded-xl border border-slate-200 px-3 bg-white text-sm font-bold outline-none focus:border-orange-500 shadow-sm transition-all cursor-pointer"
              value={supplierSelected}
              onChange={(e) => {
                const v = e.target.value;
                setSupplierSelected(v);
                if (supplierNameKeywordRef.current) setSupplierNameKeyword('');
                setRemoteSupplierSearchActive(false);
                if (mode === 'UNPRINTED') return;
                runReceiptSearch({
                  nextSupplierSelected: v,
                  nextSupplierNameKeyword: '',
                  source: 'supplierDropdown',
                });
              }}
            >
              <option value="ALL">ทั้งหมด (All Supplier Options)</option>
              {dropdownSupplierOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-4 text-xs sm:text-sm text-slate-500 font-bold select-none h-10">
            <div>
              ตรวจพบ: <span className="font-black text-slate-900 text-sm">{visibleReceipts.length}</span> ใบรับสินค้า
              {hasData && (
                <span className="ml-2 text-xs text-slate-400 font-bold">
                  • คู่ค้าในลิสต์: <span className="font-black text-slate-700">{dropdownSupplierOptions.length}ค่าย</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ 4. ส่วนแสดงโครงสร้างแจ้งเตือนเครือข่ายล่ม Error Fallback */}
      {showError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-4 rounded-2xl font-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>เกิดข้อผิดพลาดในการดึงพิกัดบาร์โค้ด: {error?.message ?? String(error)}</span>
          </div>
          <button type="button" className="px-4 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all" onClick={reloadCurrentMode}>
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* 📦 5. EMPTY STATE: แผงแจ้งเตือนไร้ข้อมูลกรณีฟิลเตอร์หลุดพิกัด */}
      {!loading && !error && Array.isArray(visibleReceipts) && visibleReceipts.length === 0 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center space-y-3 shadow-sm select-none animate-fadeIn">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200/40 shadow-sm">
            <Barcode className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">ยังไม่มีรายการใบรับของในระบบ</h3>
            <p className="mt-1 text-xs font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
              {mode === 'UNPRINTED'
                ? 'กระบวนการเคลียร์ของหลังบ้านเสร็จสิ้นแล้ว! ยังไม่พบใบตรวจรับพัสดุพอร์ต 5000 ค้างพิมพ์บาร์โค้ดในขณะนี้'
                : 'ระบุคีย์ตัวแปรหลุดเป้าหมาย ไม่พบข้อมูลใบเสร็จภาษีที่ตรงกับเงื่อนไขการค้นหาปัจจุบัน'}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button type="button" onClick={reloadCurrentMode} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl active:scale-95 transition-all shadow-sm">
              รีเฟรชรายการข้อมูล
            </button>
            {activeFilterChips.length > 0 && (
              <button type="button" onClick={clearAllFilters} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 active:scale-95 transition-all">
                ล้างหน้าตัวกรอง
              </button>
            )}
          </div>
        </div>
      )}

      {/* 📊 6. RENDER OUTPUT: ส่งต่อก้อนอาเรย์ให้ตารางย่อยเรนเดอร์บาร์โค้ด */}
      {!loading && (hasData || !error) && Array.isArray(visibleReceipts) && visibleReceipts.length > 0 && (
        <div className="animate-fadeIn">
          <BarcodePrintTable mode={mode} receipts={visibleReceipts} />
        </div>
      )}

    </div>
  );
};

export default BarcodeReceiptListPage;