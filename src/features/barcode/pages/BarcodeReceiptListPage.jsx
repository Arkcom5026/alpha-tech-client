


// src/features/barcode/pages/BarcodeReceiptListPage.jsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import BarcodePrintTable from '../controllers/BarcodePrintTable';

const BarcodeReceiptListPage = () => {
  // ✅ Big-store UX: remember last mode + supplier per mode
  const LS_MODE_KEY = 'pos:barcodeReceiptList:lastMode';
  const LS_SUPPLIER_KEY_UNPRINTED = 'pos:barcodeReceiptList:lastSupplier:UNPRINTED';
  const LS_SUPPLIER_KEY_REPRINT = 'pos:barcodeReceiptList:lastSupplier:REPRINT';
  const getSupplierLsKey = (m) => (m === 'REPRINT' ? LS_SUPPLIER_KEY_REPRINT : LS_SUPPLIER_KEY_UNPRINTED);

  // ✅ Filters
  const [codeKeyword, setCodeKeyword] = useState('');
  const [supplierSelected, setSupplierSelected] = useState('ALL'); // ALL | <supplierName>

  // ✅ Page mode (must be defined before any hook reads it)
  const [mode, setMode] = useState('UNPRINTED'); // UNPRINTED | REPRINT

  // ✅ REPRINT dropdown should reuse UNPRINTED supplier list (no extra API call)
  const [unprintedSupplierOptions, setUnprintedSupplierOptions] = useState([]);

  // ✅ REPRINT: optional deep search by supplier name (BE filter; only when user asks)
  const [supplierNameKeyword, setSupplierNameKeyword] = useState('');
  const [remoteSupplierSearchActive, setRemoteSupplierSearchActive] = useState(false);
  const [remoteCodeSearchActive, setRemoteCodeSearchActive] = useState(false);

  
  // ✅ Operational
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  // ✅ Brand-grade UX: relative last-updated text (auto refresh every 30s)
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

  // ✅ clear filters (uses refs to avoid TDZ issues)
  const runReceiptSearchFnRef = useRef(null);

  const clearAllFilters = useCallback(() => {
    setCodeKeyword('');
    setSupplierNameKeyword('');
    setSupplierSelected('ALL');
    setRemoteSupplierSearchActive(false);
    setRemoteCodeSearchActive(false);

    // ✅ UNPRINTED: local reset only
    if (mode === 'UNPRINTED') return;

    // ✅ REPRINT: clear via API (if available)
    try {
      const fn = runReceiptSearchFnRef.current;
      if (typeof fn === 'function') fn({ nextCodeKeyword: '', nextSupplierNameKeyword: '', nextSupplierSelected: 'ALL', source: 'clear' });
    } catch (_) {
      // ignore
    }
  }, [mode]);


  const {
    receiptSummaries,
    loadReceiptSummariesAction,
    loading,
    error,
  } = usePurchaseOrderReceiptStore();

  // ✅ Supplier cache (NO extra API call): use whatever is already in supplierStore
  const suppliers = useSupplierStore((s) => s?.suppliers ?? s?.supplierList ?? []);

  // ------------------------------
  // ✅ Default mode on open: UNPRINTED (per requirement)
  // ------------------------------
  const restoreModeOnceRef = useRef(true);
  useEffect(() => {
    if (!restoreModeOnceRef.current) return;
    restoreModeOnceRef.current = false;

    // ✅ Always open this page in UNPRINTED mode (ร้านใช้งานจริงต้องเห็นงานค้างก่อน)
    setMode('UNPRINTED');
    try {
      localStorage.setItem(LS_MODE_KEY, 'UNPRINTED');
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MODE_KEY, mode);
    } catch (_) {
      // ignore
    }
  }, [mode]);

  // ✅ Remember last chosen supplier (per mode)
  const pendingRestoreSupplierRef = useRef(null);
  useEffect(() => {
    try {
      pendingRestoreSupplierRef.current = localStorage.getItem(getSupplierLsKey(mode));
    } catch (_) {
      pendingRestoreSupplierRef.current = null;
    }
  }, [mode]);

  // ✅ Persist supplier selection per mode (ignore ALL)
  useEffect(() => {
    if (!supplierSelected || supplierSelected === 'ALL') return;
    try {
      localStorage.setItem(getSupplierLsKey(mode), supplierSelected);
    } catch (_) {
      // ignore
    }
  }, [supplierSelected, mode]);

  // ------------------------------
  // ✅ Helpers
  // ------------------------------
  const hasData = Array.isArray(receiptSummaries) && receiptSummaries.length > 0;
  const norm = (v) => String(v ?? '').trim().toLowerCase();

  // ✅ Align supplier extraction with BarcodePrintTable normalization
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
    // รองรับได้หลาย shape จาก BE
    const s = r?.supplier ?? r?.Supplier ?? null;
    let name = '';
    if (typeof s === 'object' && s) name = s?.name ?? s?.supplierName ?? s?.title ?? s?.companyName ?? '';
    else if (typeof s === 'string') name = s;
    else name = r?.supplierName ?? r?.supplierTitle ?? r?.supplierFullName ?? r?.supplierDisplay ?? '';

    name = String(name ?? '').trim();
    if (name) return name;

    // ✅ fallback: if BE sends only supplierId, use supplierStore cache (no extra fetch)
    const sid = getSupplierId(r);
    if (sid == null) return '';
    return String(supplierNameById.get(String(sid)) ?? '').trim();
  };

  // ✅ Base list by mode (API is source-of-truth; keep table-safety only)
  const baseByMode = useMemo(() => {
    const all = Array.isArray(receiptSummaries) ? receiptSummaries : [];
    return all;
  }, [receiptSummaries]);

  // ✅ Supplier dropdown options: show ONLY suppliers that exist in the currently loaded list
  // (UNPRINTED + REPRINT use the same rule; no extra API call)
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

  // ✅ Cache supplier list from UNPRINTED (so REPRINT dropdown still shows suppliers even if printed list has none)
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

  // ------------------------------
  // ✅ One API for all filters (ERP-scale)
  // ------------------------------
  const codeKeywordRef = useRef(codeKeyword);
  const supplierNameKeywordRef = useRef(supplierNameKeyword);
  const supplierSelectedRef = useRef(supplierSelected);

  useEffect(() => {
    codeKeywordRef.current = codeKeyword;
  }, [codeKeyword]);
  useEffect(() => {
    supplierNameKeywordRef.current = supplierNameKeyword;
  }, [supplierNameKeyword]);
  useEffect(() => {
    supplierSelectedRef.current = supplierSelected;
  }, [supplierSelected]);

  const runReceiptSearch = useCallback(
    ({ nextCodeKeyword, nextSupplierNameKeyword, nextSupplierSelected, source } = {}) => {
      if (typeof loadReceiptSummariesAction !== 'function') return;

      const printed = mode === 'UNPRINTED' ? false : true;

      const kwCode = String(nextCodeKeyword ?? codeKeywordRef.current ?? '').trim();
      const kwSupplierName = String(nextSupplierNameKeyword ?? supplierNameKeywordRef.current ?? '').trim();
      const selSup = String(nextSupplierSelected ?? supplierSelectedRef.current ?? 'ALL');

      // Priority:
      // 1) supplier name search keyword (explicit)
      // 2) supplier dropdown selection (exact)
      const supplierKeywordEffective = kwSupplierName || (selSup && selSup !== 'ALL' ? selSup : '');
      const supplierIdEffective = !kwSupplierName && selSup && selSup !== 'ALL'
        ? supplierIdByNormalizedName.get(norm(selSup))
        : undefined;

      // ✅ Align query params with backend API
      // BE expects: printed, q (RC/PO search), supplier (supplier name), supplierId(optional)
      // Priority:
      // 1) supplierId from dropdown = exact filter
      // 2) supplier name keyword      = free-text deep search
      loadReceiptSummariesAction({
        printed,
        ...(kwCode ? { q: kwCode } : {}),
        ...(Number.isFinite(supplierIdEffective) ? { supplierId: supplierIdEffective } : {}),
        ...(!Number.isFinite(supplierIdEffective) && supplierKeywordEffective ? { supplier: supplierKeywordEffective } : {}),
        limit: 50,
      });

      // Flags for UX hints
      setRemoteSupplierSearchActive(Boolean(kwSupplierName));
      setRemoteCodeSearchActive(Boolean(kwCode) && source === 'code');

      // If supplier name search is used, keep dropdown at ALL to avoid double-intent
      if (kwSupplierName && supplierSelectedRef.current !== 'ALL') {
        setSupplierSelected('ALL');
      }

      setLastLoadedAt(Date.now());
    },
    [loadReceiptSummariesAction, mode, supplierIdByNormalizedName, norm]
  );

  // ✅ keep latest runReceiptSearch in a ref (used by clearAllFilters / chip actions safely)
  useEffect(() => {
    runReceiptSearchFnRef.current = runReceiptSearch;
  }, [runReceiptSearch]);

  // ✅ Load summaries when mode changes (guard StrictMode double-mount)
  const lastModeRef = useRef(null);
  useEffect(() => {
    if (typeof loadReceiptSummariesAction !== 'function') return;

    if (lastModeRef.current === mode) return;
    lastModeRef.current = mode;

    // ✅ Reset filters per mode switch (then restore last supplier per mode via LS)
    setCodeKeyword('');
    setSupplierNameKeyword('');
    setRemoteSupplierSearchActive(false);
    setRemoteCodeSearchActive(false);
    setSupplierSelected('ALL');

    runReceiptSearch({ source: 'mode' });
  }, [mode, loadReceiptSummariesAction, runReceiptSearch]);

  // ✅ Restore supplier only when options are ready
  useEffect(() => {
    const pending = pendingRestoreSupplierRef.current;
    if (!pending) return;

    // Only restore when current selection is ALL (don’t override user choice)
    if (supplierSelected !== 'ALL') return;

    const key = norm(pending);
    const matched = dropdownSupplierOptions.find((n) => norm(n) === key);
    if (matched) {
      setSupplierSelected(matched);

      // ✅ UNPRINTED: restore = local filter only (no API)
      if (mode !== 'UNPRINTED') {
        // ✅ REPRINT: restore should also re-query (same API)
        runReceiptSearch({ nextSupplierSelected: matched, nextSupplierNameKeyword: '', source: 'restoreSupplier' });
      }
    }

    pendingRestoreSupplierRef.current = null;
  }, [dropdownSupplierOptions, supplierSelected, runReceiptSearch, mode]);

  // ✅ Debounce RC/PO search 500ms (ERP-like), only in REPRINT
  const codeDebounceRef = useRef(null);
  useEffect(() => {
    if (mode !== 'REPRINT') return;

    const kw = String(codeKeyword ?? '').trim();

    // empty: don’t auto-search; user can refresh/reset explicitly
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

  // ✅ Visible list (UNPRINTED = local supplier filter; REPRINT = server-filtered)
  const visibleReceipts = useMemo(() => {
    let list = Array.isArray(baseByMode) ? baseByMode : [];

    // ✅ UNPRINTED: local filter by supplier dropdown (we already loaded all unprinted on open)
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

  // ------------------------------
  // ✅ UI handlers
  // ------------------------------
  const showError = !loading && error != null;

  const reloadCurrentMode = () => {
    // ✅ refresh = API (same endpoint)
    runReceiptSearch({ source: 'refresh' });
  };

  const runRemoteSupplierSearch = () => {
    // ✅ supplier name search = API (same endpoint)
    const kw = String(supplierNameKeyword ?? '').trim();
    runReceiptSearch({ nextSupplierNameKeyword: kw, source: 'supplierName' });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด</h2>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`h-9 rounded border bg-white px-3 text-sm text-gray-800 hover:bg-gray-50 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (loading) return;
              reloadCurrentMode();
            }}
            title="รีเฟรชรายการ"
            disabled={loading}
          >
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          {lastLoadedAt ? (
            <div className="text-xs text-gray-500" title={new Date(lastLoadedAt).toLocaleString('th-TH')}>
              อัปเดตล่าสุด: {formatRelativeTh(lastLoadedAt)}
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ Mode selector (legacy UX) */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <div className="text-sm text-gray-700">โหมด:</div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="barcodeReceiptMode"
            checked={mode === 'UNPRINTED'}
            onChange={() => setMode('UNPRINTED')}
          />
          ยังไม่ได้พิมพ์
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="barcodeReceiptMode"
            checked={mode === 'REPRINT'}
            onChange={() => setMode('REPRINT')}
          />
          พิมพ์ซ้ำ
        </label>
      </div>

      {/* ✅ Filters */}
      <div className="mb-4 rounded-lg border bg-white p-3">
        {/* ✅ Active filters (brand-grade chips) */}
        {activeFilterChips.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-500">กำลังกรอง:</div>
            {activeFilterChips.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-700"
                title={c.label}
              >
                {c.label}
                {c.key !== 'supplierSel' ? (
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-900"
                    onClick={() => {
                      if (c.key === 'code') setCodeKeyword('');
                      if (c.key === 'supplierName') setSupplierNameKeyword('');
                      // for these two, REPRINT should re-query; UNPRINTED is local anyway
                      if (mode === 'REPRINT') {
                        runReceiptSearch({
                          nextCodeKeyword: c.key === 'code' ? '' : String(codeKeywordRef.current ?? '').trim(),
                          nextSupplierNameKeyword: c.key === 'supplierName' ? '' : String(supplierNameKeywordRef.current ?? '').trim(),
                          nextSupplierSelected: supplierSelectedRef.current ?? 'ALL',
                          source: 'chip',
                        });
                      }
                    }}
                    aria-label="ลบตัวกรอง"
                  >
                    ×
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-900"
                    onClick={() => setSupplierSelected('ALL')}
                    aria-label="ลบตัวกรอง"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            <button
              type="button"
              className="ml-1 text-xs text-gray-600 underline hover:text-gray-900"
              onClick={clearAllFilters}
            >
              ล้างทั้งหมด
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-end gap-3">
          {/* ✅ REPRINT: keyword search by RC/PO (API + debounce) */}
          {mode === 'REPRINT' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">ค้นหาด้วยเลข RC/PO</label>
              <input
                type="text"
                className="h-10 w-[260px] rounded border px-3 outline-none focus:ring"
                placeholder="เช่น RC-... หรือ PO-..."
                value={codeKeyword}
                onChange={(e) => setCodeKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setCodeKeyword('');
                    setRemoteCodeSearchActive(false);
                    runReceiptSearch({ nextCodeKeyword: '', source: 'code' });
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const kw = String(e.currentTarget.value ?? '').trim();
                    setCodeKeyword(kw);

                    // flush debounce
                    if (codeDebounceRef.current) {
                      clearTimeout(codeDebounceRef.current);
                      codeDebounceRef.current = null;
                    }

                    runReceiptSearch({ nextCodeKeyword: kw, source: 'code' });
                    e.currentTarget.blur();
                  }
                }}
              />
              {remoteCodeSearchActive ? (
                <div className="text-xs text-gray-500">กำลังใช้ผลการค้นหาด้วย RC/PO (API)</div>
              ) : (
                <div className="text-xs text-gray-500"></div>
              )}
            </div>
          )}

          {/* ✅ REPRINT: optional deep search by supplier name (API) */}
          {mode === 'REPRINT' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">ค้นหา Supplier (ชื่อ)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="h-10 w-[260px] rounded border px-3 outline-none focus:ring"
                  placeholder="พิมพ์ชื่อ Supplier แล้วกด Enter"
                  value={supplierNameKeyword}
                  onChange={(e) => setSupplierNameKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setSupplierNameKeyword('');
                      setRemoteSupplierSearchActive(false);
                      setRemoteCodeSearchActive(false);
                      // clear supplier name search (API)
                      runReceiptSearch({ nextSupplierNameKeyword: '', source: 'supplierName' });
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      runRemoteSupplierSearch();
                      e.currentTarget.blur();
                    }
                  }}
                />
                <button
                  type="button"
                  className="h-10 rounded bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
                  onClick={runRemoteSupplierSearch}
                  title="ค้นหาด้วยชื่อ Supplier"
                >
                  ค้นหา
                </button>
              </div>
              {remoteSupplierSearchActive ? (
                <div className="text-xs text-gray-500"></div>
              ) : (
                <div className="text-xs text-gray-500"></div>
              )}
            </div>
          )}

          {/* ✅ Supplier dropdown (UNPRINTED = local filter, REPRINT = API) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">กรองด้วย Supplier</label>
            <select
              className="h-10 w-[320px] rounded border px-3 bg-white outline-none focus:ring"
              value={supplierSelected}
              onChange={(e) => {
                const v = e.target.value;
                setSupplierSelected(v);

                // clear supplier name search intent when choosing dropdown
                if (supplierNameKeywordRef.current) setSupplierNameKeyword('');
                setRemoteSupplierSearchActive(false);

                // ✅ UNPRINTED: local filter only (no API) — we already loaded all unprinted on open
                if (mode === 'UNPRINTED') return;

                // ✅ REPRINT: keep ERP behavior (API)
                runReceiptSearch({
                  nextSupplierSelected: v,
                  nextSupplierNameKeyword: '',
                  source: 'supplierDropdown',
                });
              }}
            >
              <option value="ALL">ทั้งหมด</option>
              {dropdownSupplierOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="h-10 rounded bg-gray-100 px-4 text-gray-800 hover:bg-gray-200"
            onClick={clearAllFilters}
            disabled={activeFilterChips.length === 0}
            title="ล้างตัวกรองทั้งหมด"
          >
            ล้าง
          </button>

          <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
            <div>
              แสดงผล: <span className="font-medium">{visibleReceipts.length}</span> รายการ
              {hasData ? (
                <span className="ml-2 text-xs text-gray-500">
                  • Supplier: <span className="font-medium">{dropdownSupplierOptions.length}</span>
                </span>
              ) : null}
            </div>
            {loading ? <div className="text-xs text-gray-500">กำลังโหลดข้อมูล…</div> : null}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mb-3 rounded-lg border bg-white p-3">
          <div className="text-sm text-gray-700">กำลังโหลดข้อมูล…</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-100">
            <div className="h-2 w-1/2 animate-pulse rounded bg-gray-300" />
          </div>
        </div>
      )}

      {showError && (
        <div className="text-red-600">
          <span>เกิดข้อผิดพลาด: {error?.message ?? String(error)}</span>
          <button
            type="button"
            className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={reloadCurrentMode}
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* ✅ Empty state (brand-grade) */}
      {!loading && !error && Array.isArray(visibleReceipts) && visibleReceipts.length === 0 ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="text-base font-medium text-gray-900">ยังไม่มีรายการให้แสดง</div>
          <div className="mt-1 text-sm text-gray-600">
            {mode === 'UNPRINTED'
              ? 'ยังไม่พบใบรับสินค้าที่รอพิมพ์บาร์โค้ดในขณะนี้'
              : 'ไม่พบข้อมูลที่ตรงกับตัวกรอง/คำค้น'}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="h-10 rounded bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
              onClick={() => {
                if (loading) return;
                reloadCurrentMode();
              }}
            >
              รีเฟรช
            </button>
            {activeFilterChips.length > 0 ? (
              <button
                type="button"
                className="h-10 rounded border bg-white px-4 text-sm text-gray-800 hover:bg-gray-50"
                onClick={clearAllFilters}
              >
                ล้างตัวกรอง
              </button>
            ) : null}
            {mode === 'REPRINT' ? (
              <button
                type="button"
                className="h-10 rounded border bg-white px-4 text-sm text-gray-800 hover:bg-gray-50"
                onClick={() => setMode('UNPRINTED')}
              >
                ไปโหมด “ยังไม่ได้พิมพ์”
              </button>
            ) : null}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Tip: กด <span className="font-mono">Esc</span> เพื่อล้างช่องค้นหา (โหมดพิมพ์ซ้ำ)
          </div>
        </div>
      ) : null}

      {!loading && (hasData || !error) && Array.isArray(visibleReceipts) && visibleReceipts.length > 0 ? (
        <BarcodePrintTable mode={mode} receipts={visibleReceipts} />
      ) : null}
    </div>
  );
};

export default BarcodeReceiptListPage;









