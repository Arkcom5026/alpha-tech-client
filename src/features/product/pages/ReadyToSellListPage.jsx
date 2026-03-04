






// ✅ src/features/product/pages/ReadyToSellListPage.jsx
// Production-grade: no infinite loop from Zustand selector
// - ห้าม selector คืน object literal โดยไม่ใช้ shallow
// - โหลดแบบ on-demand (กด “แสดงข้อมูล”) เพื่อลด side effects ตอน mount
// - มี guard กัน StrictMode ยิงซ้ำ

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import ReadyToSellTable from '../components/ReadyToSellTable';
import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const ReadyToSellListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ helper: navigate to details page
  const goStructuredDetails = useCallback(
    (productId) => {
      const pid = productId == null || productId === '' ? null : Number(productId);
      if (!Number.isFinite(pid) || !pid) return;
      navigate(`/pos/stock/ready-to-sell/structured/${pid}`);
    },
    [navigate]
  );

  // ✅ branchId MUST come from store (ตามมาตรฐานคุณ)
  const branchId = useBranchStore((s) => s.selectedBranchId);

  // ✅ UI state
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ loading/error (จาก store) — ให้หน้าแสดงผลตรงกับผลลัพธ์ที่ store ถืออยู่เสมอ
  const loading = useProductStore((s) => s.readyToSellLoading);
  const loadError = useProductStore((s) => s.readyToSellError);
  const loadingRef = useRef(false);

  // ✅ IMPORTANT: ดึงจาก store เป็น primitive/field ที่ stable (กัน getSnapshot loop)
  const readyToSellData = useProductStore((s) => s.readyToSellData);
  const readyToSellItems = readyToSellData?.items ?? [];
  const readyToSellTotal = readyToSellData?.total ?? 0;

  // ✅ Action หลักของ ready-to-sell
  const fetchReadyToSellAction = useProductStore((s) => s.fetchReadyToSellAction);

  // ✅ Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setCommittedSearchText(searchText.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const perPage = pageSize;

  const paginated = useMemo(() => {
    const list = Array.isArray(readyToSellItems) ? readyToSellItems : [];

    // ถ้า BE ส่งมาแล้วเป็น page อยู่แล้ว เราจะ “ไม่ slice ซ้ำ”
    // heuristic: ถ้า total มีค่า และ list length <= perPage แปลว่าเป็น page อยู่แล้ว
    if (Number.isFinite(Number(readyToSellTotal)) && list.length <= perPage) return list;

    const start = (currentPage - 1) * perPage;
    return list.slice(start, start + perPage);
  }, [readyToSellItems, readyToSellTotal, currentPage, perPage]);

  const totalCount = useMemo(() => {
    const t = Number(readyToSellTotal);
    if (Number.isFinite(t) && t >= 0) return t;
    return Array.isArray(readyToSellItems) ? readyToSellItems.length : 0;
  }, [readyToSellTotal, readyToSellItems]);

  const totalPages = useMemo(() => {
    const n = Math.ceil((totalCount || 0) / perPage);
    return Math.max(1, Number.isFinite(n) ? n : 1);
  }, [totalCount, perPage]);

  const safeFetch = useCallback(
    async (opts = {}) => {
      const fn = typeof fetchReadyToSellAction === 'function' ? fetchReadyToSellAction : null;
      if (!fn) throw new Error('READY_TO_SELL_ACTION_NOT_FOUND');

      // ✅ store action รองรับ opts เดียว (production baseline)
      return await fn(opts);
    },
    [fetchReadyToSellAction]
  );

  const loadOnce = useCallback(async () => {
    if (!hasLoaded) return;
    if (!branchId) return;
    if (loadingRef.current || loading) return;

    loadingRef.current = true;

    try {
      const opts = {
        branchId,
        q: committedSearchText || '',
        page: currentPage,
        take: perPage,
        pageSize: perPage,
        limit: perPage,
        sort: 'receivedAt_desc',
      };

      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.log('✅ [ReadyToSell] load', opts);
      }

      await safeFetch(opts);
    } catch (err) {
      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.error('❌ [ReadyToSell] load error', err);
      }
      // ✅ error ถูก map/เก็บใน store แล้ว (readyToSellError)
    } finally {
      loadingRef.current = false;
    }
  }, [hasLoaded, branchId, committedSearchText, currentPage, perPage, safeFetch, loading]);

  // ✅ Auto load หลัง “กดแสดงข้อมูล” + branch พร้อม
  useEffect(() => {
    if (!hasLoaded) return;
    if (!branchId) return;
    loadOnce();
  }, [hasLoaded, branchId, loadOnce]);

  const errorMessage = useMemo(() => {
    if (!loadError) return null;
    return loadError?.message || loadError?.raw?.message || 'โหลดข้อมูลไม่สำเร็จ';
  }, [loadError]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">สินค้าพร้อมขาย</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              รายการสินค้าที่พร้อมขายในสาขานี้ (Ready-to-sell)
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">URL: {location.pathname}</p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/pos/stock')} disabled={loading}>
              กลับภาพรวมสต๊อก
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={loading || hasLoaded === true}
              onClick={() => {
                if (hasLoaded) return;
                setHasLoaded(true);
                setCurrentPage(1);
                queueMicrotask(() => loadOnce());
              }}
            >
              แสดงข้อมูล
            </button>
          </div>
        </div>

        <div className="mt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800" />

        {/* Controls */}
        <div className="mt-4">
          <div className="rounded-xl border border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="p-3 sm:p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:flex-wrap">
                <div className="w-full xl:flex-1 xl:min-w-[360px]">
                  <input
                    type="text"
                    placeholder="ค้นหา (SN / ชื่อสินค้า / รุ่น / บาร์โค้ด)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                    disabled={!hasLoaded}
                    aria-disabled={!hasLoaded}
                  />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">แสดงต่อหน้า</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border px-3 py-2 rounded"
                    disabled={!hasLoaded}
                    aria-disabled={!hasLoaded}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <button type="button" className="btn btn-outline" onClick={() => loadOnce()} disabled={!hasLoaded || loading}>
                    รีเฟรช
                  </button>
                </div>
              </div>

              {!branchId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                  <div className="font-semibold">ยังไม่ได้เลือกสาขา</div>
                  <div className="text-sm opacity-90">กรุณาเลือกสาขาก่อน เพื่อโหลดสินค้าพร้อมขาย</div>
                </div>
              )}

              {!hasLoaded && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-800">
                  <div className="font-semibold">ยังไม่ได้โหลดข้อมูล</div>
                  <div className="text-sm opacity-90">กดปุ่ม “แสดงข้อมูล” เพื่อเริ่มโหลด</div>
                </div>
              )}

              {hasLoaded && loading && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
                  <div className="font-semibold">กำลังโหลดสินค้าพร้อมขาย…</div>
                  <div className="text-sm opacity-90">โปรดรอสักครู่</div>
                </div>
              )}

              {hasLoaded && !loading && errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                  <div className="font-semibold">โหลดข้อมูลไม่สำเร็จ</div>
                  <div className="text-sm opacity-90 whitespace-pre-line">{String(errorMessage)}</div>
                </div>
              )}

              {hasLoaded && !loading && !errorMessage && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  พบ <span className="font-medium">{totalCount.toLocaleString('th-TH')}</span> รายการ
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4">
          <ReadyToSellTable items={paginated} loading={loading} onViewDetails={goStructuredDetails} />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!hasLoaded || loading || currentPage <= 1}
            >
              ก่อนหน้า
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasLoaded || loading || currentPage >= totalPages}
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyToSellListPage;







