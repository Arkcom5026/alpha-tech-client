// src/features/product/pages/ReadyToSellListPage.jsx
// 🏛️ Tenant-Safe Premium Inventory Hub: (Fixed Parameter Drift, Glassmorphic Dashboard & Micro Physics Control)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// 🟢 [IMPORT FIXED] ดึง useParams ดักจับค่าบริษัท/สาขาคั่นกลาง URL เพื่อรักษาเส้นทาง Multi-Tenant
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ReadyToSellTable from '../components/ReadyToSellTable';
import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { PackageCheck, ArrowLeft, Eye, RefreshCw, Search, SlidersHorizontal, AlertCircle, Loader2 } from 'lucide-react';

const ReadyToSellListPage = () => {
  // 🟢 [SLUG ACTIVATED] แกะคีย์ Dynamic Shop Slug ประจำหน้างานปัจจุบัน
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🟢 [ROUTING FIXED] สลักรหัส shopSlug คั่นหน้าเส้นทางหน้ารายละเอียดโครงสร้างสินค้า
  const goStructuredDetails = useCallback(
    (productId) => {
      const pid = productId == null || productId === '' ? null : Number(productId);
      if (!Number.isFinite(pid) || !pid) return;
      
      const targetSlug = shopSlug || 'advancetech';
      navigate(`/${targetSlug}/pos/stock/ready-to-sell/structured/${pid}`);
    },
    [navigate, shopSlug]
  );

  // ✅ branchId MUST come from store 
  const branchId = useBranchStore((s) => s.selectedBranchId);

  // ✅ UI state
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ loading/error (จาก store)
  const loading = useProductStore((s) => s.readyToSellLoading);
  const loadError = useProductStore((s) => s.readyToSellError);
  const loadingRef = useRef(false);

  // ✅ IMPORTANT: ดึงจาก store เป็น primitive/field ที่ stable
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
        console.log('✅ [ReadyToSell] load', opts);
      }

      await safeFetch(opts);
    } catch (err) {
      if (import.meta?.env?.DEV) {
        console.error('❌ [ReadyToSell] load error', err);
      }
    } finally {
      loadingRef.current = false;
    }
  }, [hasLoaded, branchId, committedSearchText, currentPage, perPage, safeFetch, loading]);

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
    <div className="w-full h-full p-6 space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn font-sans">
      <div className="w-full max-w-[1400px] mx-auto space-y-6">
        
        {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphism ผสานปุ่ม Action เรืองแสง */}
        <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-5 transition-all duration-300">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-orange-500" /> สินค้าพร้อมขาย
            </h1>
            <p className="mt-1 text-xs font-bold text-slate-400 dark:text-zinc-400 tracking-wide">
              Ready-to-Sell Inventory Management • รายการสินค้าจัดสรรส่วนกลางคลังพร้อมแปรสภาพเป็นยอดขายของสาขา
            </p>
            <p className="mt-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md inline-block">PATH: {location.pathname}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {/* 🟢 [ROUTING FIXED] ปุ่มถอยกลับภาพรวมสต๊อก เสียบรหัสตัวแปร shopSlug ไว้เสมอ */}
            <button 
              type="button" 
              onClick={() => {
                const targetSlug = shopSlug || 'advancetech';
                navigate(`/${targetSlug}/pos/stock`);
              }} 
              disabled={loading}
              className="flex items-center gap-1.5 px-4 h-10 text-xs font-black bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl transform active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับภาพรวมสต๊อก</span>
            </button>

            <button
              type="button"
              disabled={loading || hasLoaded === true}
              onClick={() => {
                if (hasLoaded) return;
                setHasLoaded(true);
                setCurrentPage(1);
                queueMicrotask(() => loadOnce());
              }}
              className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl border border-orange-400/10 shadow-[0_4px_15px_rgba(249,115,22,0.2)] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>แสดงข้อมูล</span>
            </button>
          </div>
        </div>

        {/* 🎛️ 2. แผงควบคุมกล่องฟิลเตอร์การค้นหาระดับพรีเมียม */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              
              {/* INPUT ค้นหาพร้อม Icon */}
              <div className="w-full lg:flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหา (SN / ชื่อสินค้า / รุ่น / บาร์โค้ด)..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium transition-all disabled:opacity-50"
                  disabled={!hasLoaded}
                  aria-disabled={!hasLoaded}
                />
              </div>

              {/* SELECT แสดงต่อหน้า */}
              <div className="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <label className="text-xs font-black text-slate-500 dark:text-zinc-400 whitespace-nowrap">แสดงต่อหน้า</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
                  disabled={!hasLoaded}
                  aria-disabled={!hasLoaded}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* ปุ่มรีเฟรช */}
              <button 
                type="button" 
                onClick={() => loadOnce()} 
                disabled={!hasLoaded || loading}
                className="inline-flex items-center justify-center gap-1 px-4 h-10 text-xs font-black bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200/40 dark:border-zinc-700/40 rounded-xl transform active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:transform-none"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
                <span>รีเฟรช</span>
              </button>
            </div>

            {/* แผงข้อความแจ้งเตือนสถานะต่างๆ */}
            <div className="space-y-2">
              {!branchId && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-amber-900 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <div className="text-xs font-black">ยังไม่ได้เลือกสาขาหลัก</div>
                    <div className="text-[11px] font-medium opacity-90 mt-0.5">กรุณาทำการเลือกสลับสาขาในแถบบาร์ระบบหลักก่อน เพื่อดึงคลังสินค้าพร้อมขาย</div>
                  </div>
                </div>
              )}

              {!hasLoaded && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 p-3 text-slate-600 dark:text-zinc-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  <div>
                    <div className="text-xs font-black">แสตนด์บายรอโหลดข้อมูลคลัง</div>
                    <div className="text-[11px] font-medium opacity-90 mt-0.5">กรุณากดปุ่ม “แสดงข้อมูล” ด้านบนขวาเพื่อดึงโครงสร้างคลัง On-Demand</div>
                  </div>
                </div>
              )}

              {hasLoaded && loading && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 p-3 text-blue-800 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-blue-500" />
                  <div>
                    <div className="text-xs font-black">กำลังประมวลผลดึงโครงสร้างสต๊อก…</div>
                    <div className="text-[11px] font-medium opacity-90 mt-0.5">กำลังสื่อสารกับ Server กลางเพื่อจัดวางตำแหน่ง SN สต๊อกสินค้า โปรดรอสักครู่</div>
                  </div>
                </div>
              )}

              {hasLoaded && !loading && errorMessage && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 p-3 text-rose-800 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <div className="text-xs font-black">เกิดข้อผิดพลาดในการโหลดคลังข้อมูล</div>
                    <div className="text-[11px] font-medium opacity-90 mt-0.5 whitespace-pre-line">{String(errorMessage)}</div>
                  </div>
                </div>
              )}

              {hasLoaded && !loading && !errorMessage && (
                <div className="text-xs font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1 select-none">
                  <span>ค้นพบพิกัดข้อมูลสต๊อกทั้งหมด</span>
                  <span className="font-black text-orange-500 px-1.5 py-0.5 bg-orange-50 dark:bg-zinc-800 rounded-md text-xs">{totalCount.toLocaleString('th-TH')}</span>
                  <span>รายการ</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 📊 3. ตารางแสดงผลโมเดิร์นคลาส */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden">
          <ReadyToSellTable items={paginated} loading={loading} onViewDetails={goStructuredDetails} />
        </div>

        {/* 📑 4. ชุดควบคุมเลขหน้า Pagination แบบแผงแคปซูลลอยตัว */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 px-5 py-3 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex items-center justify-between gap-4">
          <div className="text-xs font-black text-slate-400 dark:text-zinc-500">
            หน้า <span className="text-slate-700 dark:text-zinc-300 font-mono text-sm">{currentPage}</span> / <span className="font-mono">{totalPages}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!hasLoaded || loading || currentPage <= 1}
              className="px-4 h-8 text-xs font-black bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl transform active:scale-95 transition-all disabled:opacity-40 disabled:transform-none select-none shadow-sm"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasLoaded || loading || currentPage >= totalPages}
              className="px-4 h-8 text-xs font-black bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl transform active:scale-95 transition-all disabled:opacity-40 disabled:transform-none select-none shadow-sm"
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