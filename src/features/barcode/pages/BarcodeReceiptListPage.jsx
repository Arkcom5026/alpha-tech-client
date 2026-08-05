import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Barcode } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import BarcodeListToolbar from '../components/BarcodeListToolbar';
import BarcodeWorkspaceHeader from '../components/BarcodeWorkspaceHeader';
import BarcodePrintTable from '../controllers/BarcodePrintTable';

const LS_MODE_KEY = 'pos:barcodeReceiptList:lastMode';
const LS_SUPPLIER_KEY_UNPRINTED = 'pos:barcodeReceiptList:lastSupplier:UNPRINTED';
const LS_SUPPLIER_KEY_REPRINT = 'pos:barcodeReceiptList:lastSupplier:REPRINT';
const getSupplierLsKey = (mode) => (mode === 'REPRINT' ? LS_SUPPLIER_KEY_REPRINT : LS_SUPPLIER_KEY_UNPRINTED);
const normalize = (value) => String(value ?? '').trim().toLowerCase();

export default function BarcodeReceiptListPage() {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';

  const [codeKeyword, setCodeKeyword] = useState('');
  const [supplierSelected, setSupplierSelected] = useState('ALL');
  const [mode, setMode] = useState('UNPRINTED');
  const [unprintedSupplierOptions, setUnprintedSupplierOptions] = useState([]);
  const [supplierNameKeyword, setSupplierNameKeyword] = useState('');
  const [remoteSupplierSearchActive, setRemoteSupplierSearchActive] = useState(false);
  const [remoteCodeSearchActive, setRemoteCodeSearchActive] = useState(false);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const { receiptSummaries, loadReceiptSummariesAction, loading, error } = usePurchaseOrderReceiptStore();
  const suppliers = useSupplierStore((state) => state?.suppliers ?? state?.supplierList ?? []);

  const codeKeywordRef = useRef(codeKeyword);
  const supplierNameKeywordRef = useRef(supplierNameKeyword);
  const supplierSelectedRef = useRef(supplierSelected);
  const runReceiptSearchFnRef = useRef(null);
  const pendingRestoreSupplierRef = useRef(null);
  const lastModeRef = useRef(null);
  const codeDebounceRef = useRef(null);

  useEffect(() => { codeKeywordRef.current = codeKeyword; }, [codeKeyword]);
  useEffect(() => { supplierNameKeywordRef.current = supplierNameKeyword; }, [supplierNameKeyword]);
  useEffect(() => { supplierSelectedRef.current = supplierSelected; }, [supplierSelected]);

  useEffect(() => {
    if (!lastLoadedAt) return undefined;
    const timer = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [lastLoadedAt]);

  const formatRelativeTh = useCallback((timestamp) => {
    const value = Number(timestamp);
    if (!Number.isFinite(value) || value <= 0) return '';
    const seconds = Math.floor(Math.max(0, nowTick - value) / 1000);
    if (seconds < 10) return 'เมื่อสักครู่';
    if (seconds < 60) return `เมื่อ ${seconds} วินาทีที่แล้ว`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `เมื่อ ${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `เมื่อ ${hours} ชั่วโมงที่แล้ว`;
    return `เมื่อ ${Math.floor(hours / 24)} วันที่แล้ว`;
  }, [nowTick]);

  const supplierNameById = useMemo(() => {
    const map = new Map();
    (Array.isArray(suppliers) ? suppliers : []).forEach((supplier) => {
      const id = supplier?.id ?? supplier?.supplierId;
      const name = String(supplier?.name ?? supplier?.supplierName ?? '').trim();
      if (id != null && name) map.set(String(id), name);
    });
    return map;
  }, [suppliers]);

  const supplierIdByNormalizedName = useMemo(() => {
    const map = new Map();
    (Array.isArray(suppliers) ? suppliers : []).forEach((supplier) => {
      const id = Number(supplier?.id ?? supplier?.supplierId);
      const name = String(supplier?.name ?? supplier?.supplierName ?? '').trim();
      if (Number.isFinite(id) && name && !map.has(normalize(name))) map.set(normalize(name), id);
    });
    return map;
  }, [suppliers]);

  const getSupplierName = useCallback((receipt) => {
    const supplier = receipt?.supplier ?? receipt?.Supplier;
    if (supplier && typeof supplier === 'object') {
      const name = supplier?.name ?? supplier?.supplierName ?? supplier?.title ?? supplier?.companyName;
      if (String(name ?? '').trim()) return String(name).trim();
    }
    if (typeof supplier === 'string' && supplier.trim()) return supplier.trim();
    const direct = receipt?.supplierName ?? receipt?.supplierTitle ?? receipt?.supplierFullName ?? receipt?.supplierDisplay;
    if (String(direct ?? '').trim()) return String(direct).trim();
    const supplierId = receipt?.supplierId ?? receipt?.supplier?.id ?? receipt?.Supplier?.id;
    return supplierId == null ? '' : String(supplierNameById.get(String(supplierId)) ?? '').trim();
  }, [supplierNameById]);

  const baseReceipts = useMemo(
    () => (Array.isArray(receiptSummaries) ? receiptSummaries : []),
    [receiptSummaries]
  );

  const supplierOptions = useMemo(() => {
    const names = new Map();
    baseReceipts.forEach((receipt) => {
      const name = getSupplierName(receipt);
      if (name && !names.has(normalize(name))) names.set(normalize(name), name);
    });
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b, 'th'));
  }, [baseReceipts, getSupplierName]);

  useEffect(() => {
    if (mode !== 'UNPRINTED' || supplierOptions.length === 0) return;
    setUnprintedSupplierOptions((current) => (
      current.length === supplierOptions.length && current.every((value, index) => value === supplierOptions[index])
        ? current
        : supplierOptions
    ));
  }, [mode, supplierOptions]);

  const dropdownSupplierOptions = useMemo(() => (
    mode === 'REPRINT' && unprintedSupplierOptions.length > 0
      ? unprintedSupplierOptions
      : supplierOptions
  ), [mode, supplierOptions, unprintedSupplierOptions]);

  const runReceiptSearch = useCallback((options = {}) => {
    if (typeof loadReceiptSummariesAction !== 'function') return;
    const keyword = String(options.nextCodeKeyword ?? codeKeywordRef.current ?? '').trim();
    const supplierKeyword = String(options.nextSupplierNameKeyword ?? supplierNameKeywordRef.current ?? '').trim();
    const selectedSupplier = String(options.nextSupplierSelected ?? supplierSelectedRef.current ?? 'ALL');
    const effectiveSupplier = supplierKeyword || (selectedSupplier !== 'ALL' ? selectedSupplier : '');
    const supplierId = !supplierKeyword && selectedSupplier !== 'ALL'
      ? supplierIdByNormalizedName.get(normalize(selectedSupplier))
      : undefined;

    loadReceiptSummariesAction({
      printed: mode !== 'UNPRINTED',
      ...(keyword ? { q: keyword } : {}),
      ...(Number.isFinite(supplierId) ? { supplierId } : {}),
      ...(!Number.isFinite(supplierId) && effectiveSupplier ? { supplier: effectiveSupplier } : {}),
      limit: 50,
    });

    setRemoteSupplierSearchActive(Boolean(supplierKeyword));
    setRemoteCodeSearchActive(Boolean(keyword) && options.source === 'code');
    if (supplierKeyword && supplierSelectedRef.current !== 'ALL') setSupplierSelected('ALL');
    setLastLoadedAt(Date.now());
  }, [loadReceiptSummariesAction, mode, supplierIdByNormalizedName]);

  useEffect(() => { runReceiptSearchFnRef.current = runReceiptSearch; }, [runReceiptSearch]);

  useEffect(() => {
    setMode('UNPRINTED');
    try { localStorage.setItem(LS_MODE_KEY, 'UNPRINTED'); } catch (_) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_MODE_KEY, mode); } catch (_) {}
    try { pendingRestoreSupplierRef.current = localStorage.getItem(getSupplierLsKey(mode)); } catch (_) {
      pendingRestoreSupplierRef.current = null;
    }
  }, [mode]);

  useEffect(() => {
    if (supplierSelected === 'ALL') return;
    try { localStorage.setItem(getSupplierLsKey(mode), supplierSelected); } catch (_) {}
  }, [mode, supplierSelected]);

  useEffect(() => {
    if (typeof loadReceiptSummariesAction !== 'function' || lastModeRef.current === mode) return;
    lastModeRef.current = mode;
    setCodeKeyword('');
    setSupplierNameKeyword('');
    setRemoteSupplierSearchActive(false);
    setRemoteCodeSearchActive(false);
    setSupplierSelected('ALL');
    runReceiptSearch({ source: 'mode' });
  }, [loadReceiptSummariesAction, mode, runReceiptSearch]);

  useEffect(() => {
    const pending = pendingRestoreSupplierRef.current;
    if (!pending || supplierSelected !== 'ALL') return;
    const matched = dropdownSupplierOptions.find((name) => normalize(name) === normalize(pending));
    if (matched) {
      setSupplierSelected(matched);
      if (mode === 'REPRINT') runReceiptSearch({ nextSupplierSelected: matched, nextSupplierNameKeyword: '', source: 'restoreSupplier' });
    }
    pendingRestoreSupplierRef.current = null;
  }, [dropdownSupplierOptions, mode, runReceiptSearch, supplierSelected]);

  useEffect(() => {
    if (mode !== 'REPRINT') return undefined;
    const keyword = codeKeyword.trim();
    if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
    if (!keyword) {
      setRemoteCodeSearchActive(false);
      return undefined;
    }
    codeDebounceRef.current = setTimeout(() => runReceiptSearch({ nextCodeKeyword: keyword, source: 'code' }), 500);
    return () => {
      if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
    };
  }, [codeKeyword, mode, runReceiptSearch]);

  const visibleReceipts = useMemo(() => {
    let list = baseReceipts;
    if (mode === 'UNPRINTED' && supplierSelected !== 'ALL') {
      list = list.filter((receipt) => normalize(getSupplierName(receipt)) === normalize(supplierSelected));
    }
    const timestamp = (receipt) => {
      const value = receipt?.receivedAt ?? receipt?.receiptDate ?? receipt?.dateReceived ?? receipt?.createdAt ?? receipt?.updatedAt;
      const parsed = value ? Date.parse(value) : NaN;
      return Number.isFinite(parsed) ? parsed : 0;
    };
    return [...list].sort((a, b) => {
      const dateDifference = timestamp(b) - timestamp(a);
      if (dateDifference) return dateDifference;
      const receiptDifference = String(b?.receiptCode ?? b?.code ?? b?.receiptNo ?? '').localeCompare(
        String(a?.receiptCode ?? a?.code ?? a?.receiptNo ?? ''),
        'en'
      );
      if (receiptDifference) return receiptDifference;
      return String(b?.purchaseOrderCode ?? b?.poCode ?? b?.purchaseOrder?.code ?? '').localeCompare(
        String(a?.purchaseOrderCode ?? a?.poCode ?? a?.purchaseOrder?.code ?? ''),
        'en'
      );
    });
  }, [baseReceipts, getSupplierName, mode, supplierSelected]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (mode === 'REPRINT' && codeKeyword.trim()) chips.push({ key: 'code', label: `RC/PO: ${codeKeyword.trim()}` });
    if (mode === 'REPRINT' && supplierNameKeyword.trim()) chips.push({ key: 'supplierName', label: `Supplier: ${supplierNameKeyword.trim()}` });
    if (supplierSelected !== 'ALL') chips.push({ key: 'supplierSel', label: `กรอง: ${supplierSelected}` });
    return chips;
  }, [codeKeyword, mode, supplierNameKeyword, supplierSelected]);

  const clearAllFilters = useCallback(() => {
    setCodeKeyword('');
    setSupplierNameKeyword('');
    setSupplierSelected('ALL');
    setRemoteSupplierSearchActive(false);
    setRemoteCodeSearchActive(false);
    if (mode === 'REPRINT') runReceiptSearchFnRef.current?.({ nextCodeKeyword: '', nextSupplierNameKeyword: '', nextSupplierSelected: 'ALL', source: 'clear' });
  }, [mode]);

  const removeFilter = (key) => {
    const nextCode = key === 'code' ? '' : codeKeywordRef.current;
    const nextSupplierName = key === 'supplierName' ? '' : supplierNameKeywordRef.current;
    const nextSupplierSelected = key === 'supplierSel' ? 'ALL' : supplierSelectedRef.current;
    if (key === 'code') setCodeKeyword('');
    if (key === 'supplierName') setSupplierNameKeyword('');
    if (key === 'supplierSel') setSupplierSelected('ALL');
    if (mode === 'REPRINT') runReceiptSearch({ nextCodeKeyword: nextCode, nextSupplierNameKeyword: nextSupplierName, nextSupplierSelected, source: 'chip' });
  };

  const handleSupplierSelectedChange = (value) => {
    setSupplierSelected(value);
    if (supplierNameKeywordRef.current) setSupplierNameKeyword('');
    setRemoteSupplierSearchActive(false);
    if (mode === 'REPRINT') runReceiptSearch({ nextSupplierSelected: value, nextSupplierNameKeyword: '', source: 'supplierDropdown' });
  };

  const reloadCurrentMode = () => runReceiptSearch({ source: 'refresh' });
  const showError = !loading && error != null;

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-5 p-3 text-slate-800 sm:p-4 md:space-y-6 md:p-6">
      <BarcodeWorkspaceHeader
        loading={loading}
        lastLoadedLabel={lastLoadedAt ? formatRelativeTh(lastLoadedAt) : ''}
        onRefresh={reloadCurrentMode}
        onOpenRangePrint={() => navigate(`/${targetSlug}/pos/purchases/barcodes/range-print`)}
      />

      <BarcodeListToolbar
        mode={mode}
        onModeChange={setMode}
        activeFilterChips={activeFilterChips}
        onRemoveFilter={removeFilter}
        onClearFilters={clearAllFilters}
        codeKeyword={codeKeyword}
        onCodeKeywordChange={setCodeKeyword}
        supplierNameKeyword={supplierNameKeyword}
        onSupplierNameKeywordChange={setSupplierNameKeyword}
        onSupplierSearch={() => runReceiptSearch({ nextSupplierNameKeyword: supplierNameKeyword.trim(), source: 'supplierName' })}
        supplierSelected={supplierSelected}
        onSupplierSelectedChange={handleSupplierSelectedChange}
        supplierOptions={dropdownSupplierOptions}
        resultCount={visibleReceipts.length}
        supplierCount={dropdownSupplierOptions.length}
      />

      {(remoteSupplierSearchActive || remoteCodeSearchActive) && !loading ? (
        <p className="text-xs font-medium text-slate-500" role="status">กำลังแสดงผลจากการค้นหาข้อมูลส่วนกลาง</p>
      ) : null}

      {showError ? (
        <section role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2 font-semibold"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />เกิดข้อผิดพลาดในการโหลดรายการ: {error?.message ?? String(error)}</span>
          <button type="button" onClick={reloadCurrentMode} className="min-h-11 rounded-xl bg-rose-700 px-4 font-bold text-white hover:bg-rose-800">ลองอีกครั้ง</button>
        </section>
      ) : null}

      {!loading && !showError && visibleReceipts.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
          <Barcode className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            {mode === 'UNPRINTED' ? 'ไม่มีใบรับสินค้าค้างพิมพ์บาร์โค้ด' : 'ไม่พบรายการสำหรับพิมพ์ซ้ำ'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">ลองรีเฟรชรายการหรือปรับตัวกรองที่ใช้งาน</p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={reloadCurrentMode} className="min-h-11 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white hover:bg-teal-800">รีเฟรชรายการ</button>
            {activeFilterChips.length > 0 ? <button type="button" onClick={clearAllFilters} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">ล้างตัวกรอง</button> : null}
          </div>
        </section>
      ) : null}

      {!loading && !showError && visibleReceipts.length > 0 ? (
        <BarcodePrintTable mode={mode} receipts={visibleReceipts} />
      ) : null}
    </main>
  );
}
