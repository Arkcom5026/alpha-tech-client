

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

  // ✅ REPRINT dropdown should reuse UNPRINTED supplier list (no extra API call)
  const [unprintedSupplierOptions, setUnprintedSupplierOptions] = useState([]);

  // ✅ REPRINT: optional deep search by supplier name (BE filter; only when user asks)
  const [supplierNameKeyword, setSupplierNameKeyword] = useState('');
  const [remoteSupplierSearchActive, setRemoteSupplierSearchActive] = useState(false);
  const [remoteCodeSearchActive, setRemoteCodeSearchActive] = useState(false);

  // ✅ Operational
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  // ✅ Legacy UX: searching is primarily for "พิมพ์ซ้ำ" mode
  const [mode, setMode] = useState('UNPRINTED'); // UNPRINTED | REPRINT

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

      loadReceiptSummariesAction({
        printed,
        ...(kwCode ? { codeKeyword: kwCode } : {}),
        ...(supplierKeywordEffective ? { supplierKeyword: supplierKeywordEffective } : {}),
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
    [loadReceiptSummariesAction, mode]
  );

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
      // ✅ restore should also re-query (same API)
      runReceiptSearch({ nextSupplierSelected: matched, nextSupplierNameKeyword: '', source: 'restoreSupplier' });
    }

    pendingRestoreSupplierRef.current = null;
  }, [dropdownSupplierOptions, supplierSelected, runReceiptSearch]);

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

  // ✅ Client-side sort only (server filtering is the source of truth)
  const visibleReceipts = useMemo(() => {
    const list = Array.isArray(baseByMode) ? baseByMode : [];

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
  }, [baseByMode]);

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
            className="h-9 rounded border bg-white px-3 text-sm text-gray-800 hover:bg-gray-50"
            onClick={reloadCurrentMode}
            title="รีเฟรชรายการ"
          >
            รีเฟรช
          </button>
          {lastLoadedAt ? (
            <div className="text-xs text-gray-500">อัปเดตล่าสุด: {new Date(lastLoadedAt).toLocaleTimeString('th-TH')}</div>
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
                <div className="text-xs text-gray-500">กำลังใช้ผลการค้นหาจากชื่อ Supplier (API)</div>
              ) : (
                <div className="text-xs text-gray-500"></div>
              )}
            </div>
          )}

          {/* ✅ Supplier dropdown (API) */}
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
            onClick={() => {
              setCodeKeyword('');
              setSupplierNameKeyword('');
              setSupplierSelected('ALL');
              setRemoteSupplierSearchActive(false);
              setRemoteCodeSearchActive(false);
              runReceiptSearch({ nextCodeKeyword: '', nextSupplierNameKeyword: '', nextSupplierSelected: 'ALL', source: 'clear' });
            }}
            disabled={!codeKeyword && !supplierNameKeyword && supplierSelected === 'ALL' && !remoteSupplierSearchActive && !remoteCodeSearchActive}
            title="ล้างตัวกรอง"
          >
            ล้าง
          </button>

          <div className="ml-auto text-sm text-gray-600">
            แสดงผล: <span className="font-medium">{visibleReceipts.length}</span> รายการ
            {hasData ? (
              <span className="ml-2 text-xs text-gray-500">
                • Supplier: <span className="font-medium">{dropdownSupplierOptions.length}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {loading && <p>กำลังโหลดข้อมูล...</p>}

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

      {!loading && (hasData || !error) && <BarcodePrintTable mode={mode} receipts={visibleReceipts} />}
    </div>
  );
};

export default BarcodeReceiptListPage;
