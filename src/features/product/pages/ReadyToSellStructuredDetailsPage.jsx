















// ✅ src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx
// Show all IN_STOCK StockItems (STRUCTURED) for a product in the selected branch

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const ReadyToSellStructuredDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();

  const branchId = useBranchStore((s) => s.selectedBranchId);

  const pid = useMemo(() => {
    const n = Number(productId);
    return Number.isFinite(n) ? n : null;
  }, [productId]);

  const [searchText, setSearchText] = useState('');

  // ✅ Scan UX (no dialog/toast) — helps POS workflow
  const [scanMode, setScanMode] = useState(true);
  const [scanText, setScanText] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [highlightId, setHighlightId] = useState(null);

  // ✅ Local sort (fail-soft) — FIFO is useful for stock ops
  const [sortMode, setSortMode] = useState('NEWEST'); // NEWEST | FIFO

  const scanRef = useRef(null);
  const [committed, setCommitted] = useState('');

  const loading = useProductStore((s) => s.readyToSellStructuredDetailsLoading);
  const loadError = useProductStore((s) => s.readyToSellStructuredDetailsError);
  const data = useProductStore((s) => s.readyToSellStructuredDetails);

  const fetchAction = useProductStore((s) => s.fetchReadyToSellStructuredDetailsAction);
  const resetAction = useProductStore((s) => s.resetReadyToSellStructuredDetailsAction);

  const loadingRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setCommitted(searchText.trim()), 250);
    return () => clearTimeout(t);
  }, [searchText]);

  const safeFetch = useCallback(
    async (q) => {
      const fn = typeof fetchAction === 'function' ? fetchAction : null;
      if (!fn) throw new Error('READY_TO_SELL_DETAILS_ACTION_NOT_FOUND');
      return await fn({ branchId, productId: pid, q });
    },
    [fetchAction, branchId, pid]
  );

  const load = useCallback(async () => {
    if (!branchId || !pid) return;
    if (loadingRef.current || loading) return;
    loadingRef.current = true;
    try {
      await safeFetch(committed || '');
    } finally {
      loadingRef.current = false;
    }
  }, [branchId, pid, loading, committed, safeFetch]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (typeof resetAction === 'function') resetAction();
    };
  }, [resetAction]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ Autofocus scan input when scan mode is on
  useEffect(() => {
    try {
      if (scanMode && scanRef.current) scanRef.current.focus();
    } catch (_) {
      // ignore
    }
  }, [scanMode, pid, branchId]);

  const items = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);

  // ✅ Display list (sorting only; server filtering remains source-of-truth)
  const displayItems = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    const getT = (x) => {
      const v = x?.receivedAt ?? x?.createdAt ?? null;
      const t = v ? new Date(v).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };

    if (sortMode === 'FIFO') {
      // Oldest first
      arr.sort((a, b) => getT(a) - getT(b));
      return arr;
    }

    // Newest first
    arr.sort((a, b) => getT(b) - getT(a));
    return arr;
  }, [items, sortMode]);
  const total = useMemo(() => Number(data?.total ?? items.length) || items.length, [data, items]);

  // ✅ Header meta helpers (fast scan context)
  const latestReceivedAt = useMemo(() => {
    const first = displayItems?.[0];
    const v = first?.receivedAt ?? null;
    return v ? new Date(v).toLocaleString('th-TH') : '-';
  }, [displayItems]);

  const oldestReceivedAt = useMemo(() => {
    const last = displayItems?.[displayItems.length - 1];
    const v = last?.receivedAt ?? null;
    return v ? new Date(v).toLocaleString('th-TH') : '-';
  }, [displayItems]);

  const headerName = useMemo(() => {
    const first = items?.[0];
    return first?.productName ?? first?.product?.name ?? '-';
  }, [items]);

  const normalizeScan = useCallback((v) => {
    const s = String(v ?? '').trim();
    return s;
  }, []);

  const tryScanJump = useCallback(
    (raw) => {
      const s = normalizeScan(raw);
      if (!s) return;

      const key = s.toLowerCase();
      const digits = key.replace(/[^0-9]+/g, '');

      const found = (displayItems || []).find((it) => {
        const b = String(it?.barcode ?? '').toLowerCase();
        const sn = String(it?.serialNumber ?? '').toLowerCase();

        if (b && b === key) return true;
        if (sn && sn === key) return true;

        // allow digit-only match (common with scanners)
        if (digits && b.replace(/[^0-9]+/g, '') === digits) return true;
        if (digits && sn.replace(/[^0-9]+/g, '') === digits) return true;

        return false;
      });

      if (!found) {
        setHighlightId(null);
        setScanMessage(`ไม่พบรายการสำหรับ “${s}”`);
        return;
      }

      const id = found?.id ?? null;
      setHighlightId(id);
      setScanMessage('');

      // scroll into view (fail-soft)
      try {
        const el = document.getElementById(`sn-row-${id}`);
        if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (_) {
        // ignore
      }
    },
    [displayItems, normalizeScan]
  );

  // ✅ Quick meta for readability (fail-soft: show '-' when missing)
  const headerMeta = useMemo(() => {
    const first = items?.[0] || {};

    const brandName = first?.brandName ?? first?.brand?.name ?? first?.product?.brand?.name ?? '-';
    const categoryName = first?.categoryName ?? first?.category?.name ?? first?.product?.category?.name ?? '-';
    const productTypeName = first?.productTypeName ?? first?.productType?.name ?? first?.product?.productType?.name ?? '-';

    const sku = first?.sku ?? first?.productSku ?? first?.code ?? first?.product?.sku ?? first?.product?.productConfig?.sku ?? '-';
    const model = first?.model ?? first?.productModel ?? first?.product?.model ?? first?.product?.productConfig?.model ?? '-';

    const sellPriceRaw = first?.sellPrice ?? first?.salePrice ?? first?.price ?? first?.product?.sellPrice ?? first?.product?.branchPrice?.[0]?.priceRetail ?? null;
    const sellPriceNum = sellPriceRaw == null || sellPriceRaw === '' ? null : Number(sellPriceRaw);
    const sellPrice = Number.isFinite(sellPriceNum) ? sellPriceNum : null;

    const receivedAtRaw = first?.receivedAt ?? null;
    const receivedAt = receivedAtRaw ? new Date(receivedAtRaw).toLocaleString('th-TH') : '-';

    return {
      sku,
      model,
      brandName,
      categoryName,
      productTypeName,
      sellPrice,
      receivedAt,
    };
  }, [items]);

  const errorMessage = useMemo(() => {
    if (!loadError) return null;
    return loadError?.message || loadError?.raw?.message || 'โหลดข้อมูลไม่สำเร็จ';
  }, [loadError]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายละเอียดสินค้าแบบ SN</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {headerName} (productId: {pid ?? '-'})
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">URL: {location.pathname}</p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={loading}>
              กลับ
            </button>
            <button type="button" className="btn btn-outline" onClick={() => load()} disabled={loading || !branchId || !pid}>
              รีเฟรช
            </button>
          </div>
        </div>

        <div className="mt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800" />

        {/* ✅ Product summary (readability-first) */}
        <div className="mt-4 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">{headerName}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {headerMeta.brandName} • {headerMeta.categoryName} • {headerMeta.productTypeName}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">จำนวนพร้อมขาย</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{total.toLocaleString('th-TH')}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800/70 dark:bg-zinc-950/40">
                <div className="text-zinc-500">SKU/รหัสสินค้า</div>
                <div className="mt-1 font-medium text-zinc-900 dark:text-white break-words">{headerMeta.sku}</div>
              </div>
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800/70 dark:bg-zinc-950/40">
                <div className="text-zinc-500">รุ่น</div>
                <div className="mt-1 font-medium text-zinc-900 dark:text-white break-words">{headerMeta.model}</div>
              </div>
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800/70 dark:bg-zinc-950/40">
                <div className="text-zinc-500">ราคาขาย</div>
                <div className="mt-1 font-medium text-zinc-900 dark:text-white">
                  {headerMeta.sellPrice == null ? '-' : headerMeta.sellPrice.toLocaleString('th-TH')}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800/70 dark:bg-zinc-950/40">
                <div className="text-zinc-500">รับเข้า (ช่วง)</div>
                <div className="mt-1 font-medium text-zinc-900 dark:text-white">{oldestReceivedAt} → {latestReceivedAt}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="w-full xl:flex-1 xl:min-w-[360px]">
                <input
                  type="text"
                  placeholder="ค้นหา (SN / Barcode)"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                  disabled={!branchId || !pid}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`btn btn-outline ${scanMode ? 'ring-1 ring-blue-200' : ''}`}
                  onClick={() => {
                    setScanMode((v) => !v);
                    setScanMessage('');
                    setHighlightId(null);
                  }}
                  disabled={!branchId || !pid}
                >
                  {scanMode ? 'โหมดสแกน: เปิด' : 'โหมดสแกน: ปิด'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSortMode((m) => (m === 'FIFO' ? 'NEWEST' : 'FIFO'))}
                  disabled={!branchId || !pid}
                  title="สลับการเรียงลำดับ"
                >
                  {sortMode === 'FIFO' ? 'FIFO (เก่าก่อน)' : 'ใหม่ก่อน'}
                </button>
              </div>

              <div className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">
                พบ <span className="font-medium">{total.toLocaleString('th-TH')}</span> ชิ้น
              </div>
            </div>

            {scanMode && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:max-w-[520px]">
                  <input
                    ref={scanRef}
                    type="text"
                    placeholder="สแกน SN/Barcode แล้วกด Enter"
                    value={scanText}
                    onChange={(e) => setScanText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = String(scanText ?? '').trim();
                        if (!v) return;
                        tryScanJump(v);
                        setScanText('');
                      }
                    }}
                    className="border px-3 py-2 rounded w-full font-mono"
                    disabled={!branchId || !pid}
                  />
                </div>

                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  สแกนแล้วระบบจะเลื่อนไปยังรายการและไฮไลต์แถวให้
                </div>
              </div>
            )}

            {scanMessage && (
$1
            )}

            {!branchId && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                <div className="font-semibold">ยังไม่ได้เลือกสาขา</div>
                <div className="text-sm opacity-90">กรุณาเลือกสาขาก่อน</div>
              </div>
            )}

            {!pid && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                <div className="font-semibold">ลิงก์ไม่ถูกต้อง</div>
                <div className="text-sm opacity-90">ไม่พบ productId</div>
              </div>
            )}

            {loading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
                <div className="font-semibold">กำลังโหลดรายละเอียด…</div>
              </div>
            )}

            {!loading && errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                <div className="font-semibold">โหลดข้อมูลไม่สำเร็จ</div>
                <div className="text-sm opacity-90 whitespace-pre-line">{String(errorMessage)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border bg-white overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3 whitespace-nowrap">SN / Barcode</th>
                  <th className="px-4 py-3 whitespace-nowrap">สถานะ</th>
                  <th className="px-4 py-3 whitespace-nowrap">รับเข้า</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!loading && items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={3}>
                      ไม่พบรายการ SN ในสาขานี้
                    </td>
                  </tr>
                ) : (
                  displayItems.map((it, idx) => {
                    const code = it?.serialNumber ?? it?.barcode ?? it?.code ?? '-';
                    const st = (it?.status ?? 'IN_STOCK').toString();
                    const receivedAt = it?.receivedAt ? new Date(it.receivedAt).toLocaleString('th-TH') : '-';
                    const key = it?.id ?? `${code}-${idx}`;
                    return (
                      <tr
                        id={`sn-row-${it?.id ?? ''}`}
                        key={key}
                        className={`hover:bg-gray-50 ${highlightId != null && it?.id === highlightId ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-mono">{code}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border bg-gray-50 border-gray-200 text-gray-700">
                            {st}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{receivedAt}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyToSellStructuredDetailsPage;






