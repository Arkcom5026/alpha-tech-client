// ✅ src/features/product/pages/ListProductPage.jsx
// ✅ Policy update (Production):
// - Product เป็น Global Master Data → ห้ามปิดใช้งานจาก POS
// - อนุญาต “ลบถาวร” เฉพาะ SUPERADMIN เท่านั้น
// - หากสินค้ามีการอ้างอิง (ถูกใช้แล้ว) BE ควรปฏิเสธ และ FE จะแสดงข้อความในหน้า

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import ProductTable from '../components/ProductTable';
import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ListProductPage() {
  const [searchText, setSearchText] = useState('');
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [filter, setFilter] = useState({
    productTypeId: null,
    brandId: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [pageSize, setPageSize] = useState(25);
  const [density, setDensity] = useState('normal');
  const [showAllPrices, setShowAllPrices] = useState(false);
  const perPage = pageSize;
  const [allProducts, setAllProducts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadAllError, setLoadAllError] = useState(null);
  const loadingAllRef = useRef(false);

  const TAKE = 200;
  const MAX_PAGES_SAFETY = 500;

  const branchId = useBranchStore((state) => state.selectedBranchId);
  const navigate = useNavigate();
  const location = useLocation();
  const authRole = useAuthStore((s) => s?.user?.role ?? s?.role ?? null);
  const isSuperAdmin = String(authRole || '').toUpperCase() === 'SUPERADMIN';

  const {
    products,
    fetchOperationalProductsAction,
    dropdowns,
    dropdownsLoaded,
    ensureDropdownsAction,
    deleteProductAction,
    deleteProduct,
  } = useProductStore();

  const fetchForList = fetchOperationalProductsAction;
  // eslint-disable-next-line no-unused-vars
  const _storeProducts = products;
  const dropdownsFetchRef = useRef({ branchId: null, done: false });

  useEffect(() => {
    if (!hasLoaded) return;
    if (!branchId) return;
    if (dropdownsLoaded === true) return;

    if (dropdownsFetchRef.current.branchId !== branchId) {
      dropdownsFetchRef.current = { branchId, done: false };
    }

    if (dropdownsFetchRef.current.done) return;
    dropdownsFetchRef.current.done = true;

    if (typeof ensureDropdownsAction === 'function') {
      ensureDropdownsAction();
    }
  }, [hasLoaded, branchId, dropdownsLoaded, ensureDropdownsAction]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const s = params.get('sort') || 'name-asc';
    const type = params.get('productTypeId');
    setSearchText(q);
    setCommittedSearchText(q);
    setSortOrder(s);

    setFilter((prev) => ({
      ...prev,
      productTypeId: type != null ? Number(type) : null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filter.productTypeId != null) params.set('productTypeId', String(filter.productTypeId));
    if (committedSearchText) params.set('q', committedSearchText);
    if (sortOrder && sortOrder !== 'name-asc') params.set('sort', sortOrder);

    const nextSearch = params.toString();
    const currSearch = new URLSearchParams(location.search).toString();
    if (nextSearch !== currSearch) {
      navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
    }
  }, [filter, committedSearchText, sortOrder, navigate, location.pathname, location.search]);

  const confirmDelete = (prodId) => {
    if (!isSuperAdmin) return;
    const target = allProducts.find((p) => p.id === prodId);
    if (target) {
      setDeleteError(null);
      setDeleteTarget(target);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id || deletingId) return;

    if (!isSuperAdmin) {
      const message = 'สิทธิ์ไม่เพียงพอ: เฉพาะ SUPERADMIN เท่านั้นที่สามารถลบสินค้าได้';
      setDeleteError(message);
      feedback.error(message, { eventKey: 'product:delete:forbidden' });
      setDeleteTarget(null);
      return;
    }

    const targetId = deleteTarget.id;
    setDeletingId(targetId);
    setDeleteError(null);
    try {
      const deleteFn = typeof deleteProductAction === 'function' ? deleteProductAction : deleteProduct;

      if (typeof deleteFn !== 'function') {
        throw new Error('FE_NOT_READY_DELETE_ACTION');
      }

      const deleted = await deleteFn(targetId);
      if (deleted === false) {
        const storeError = useProductStore.getState().error;
        const message =
          storeError?.message ||
          storeError?.raw?.response?.data?.error?.message ||
          storeError?.raw?.response?.data?.message ||
          'ลบสินค้าไม่สำเร็จ';
        throw Object.assign(new Error(message), { code: storeError?.code, cause: storeError?.raw });
      }

      setAllProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p?.id !== targetId) : prev));
      setDeleteTarget(null);
      await loadAllProductsOnce();
      feedback.actionSuccess('ลบสินค้าเรียบร้อยแล้ว', 'product:delete:success');
    } catch (error) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        (typeof error?.response?.data?.error === 'string' ? error.response.data.error : '') ||
        (error?.message === 'FE_NOT_READY_DELETE_ACTION'
          ? 'ระบบยังไม่รองรับการลบสินค้าในฝั่งหน้าบ้าน (deleteProductAction ยังไม่ถูกเพิ่มใน productStore)'
          : error?.message) ||
        'ลบสินค้าไม่สำเร็จ';
      setDeleteError(msg);
      feedback.actionError(error, msg, 'product:delete:error');
    } finally {
      setDeletingId(null);
    }
  };

  const getPrice = (p) => p.prices?.find((pr) => pr.level === 1)?.price || 0;

  const resolveTypeId = (p) => {
    const direct = p?.productTypeId ?? p?.productType?.id ?? p?.product_type_id;
    if (direct != null) return direct;

    const name = p?.productTypeName ?? p?.typeName ?? p?.productType?.name ?? p?.product_type_name;
    if (!name || !Array.isArray(dropdowns?.productTypes)) return undefined;
    const hit = dropdowns.productTypes.find((t) => String(t?.name || '').trim() === String(name).trim());
    return hit?.id;
  };

  const toNum = (v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const matchesId = (filterVal, resolvedVal) => {
    const f = toNum(filterVal);
    if (f === undefined) return true;

    const r = toNum(resolvedVal);
    if (r === undefined && dropdownsLoaded !== true) return true;
    if (r === undefined) return false;
    return r === f;
  };

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const resolvedTypeId = resolveTypeId(p);
      const okType = matchesId(filter.productTypeId, resolvedTypeId);
      const resolvedBrandId = p?.brandId ?? p?.brand?.id ?? undefined;
      const okBrand = matchesId(filter.brandId, resolvedBrandId);

      const q = (committedSearchText || '').toLowerCase();
      const okSearch =
        !q ||
        (p.name?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q) ||
          (p.brandName || p.brand?.name || '').toLowerCase().includes(q));

      return okType && okBrand && okSearch;
    });
  }, [allProducts, filter, committedSearchText, dropdowns, dropdownsLoaded]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return getPrice(a) - getPrice(b);
        case 'price-desc':
          return getPrice(b) - getPrice(a);
        default:
          return 0;
      }
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    return sorted.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [sorted, currentPage, perPage]);

  useEffect(() => {
    if (!(import.meta && import.meta.env && import.meta.env.DEV)) return;

    console.log('🧪 [ListProductPage] counts', {
      branchId,
      products: Array.isArray(allProducts) ? allProducts.length : 'not-array',
      filtered: Array.isArray(filtered) ? filtered.length : 'not-array',
      sorted: Array.isArray(sorted) ? sorted.length : 'not-array',
      paginated: Array.isArray(paginated) ? paginated.length : 'not-array',
      filter,
      committedSearchText,
    });
  }, [branchId, allProducts, filtered, sorted, paginated, filter, committedSearchText]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / perPage), [filtered.length, perPage]);

  const loadAllProductsOnce = useCallback(async () => {
    if (!branchId) return;
    if (loadingAllRef.current) return;

    loadingAllRef.current = true;
    setLoadingAll(true);
    setLoadAllError(null);

    try {
      let page = 1;
      let acc = [];

      if (import.meta?.env?.DEV) {
        console.log('✅ [ListProductPage] loadAllProducts start', { branchId, isSuperAdmin, TAKE });
      }

      while (page <= MAX_PAGES_SAFETY) {
        const pageFilters = {
          page,
          take: TAKE,
          pageSize: TAKE,
          limit: TAKE,
          includeInactive: 0,
        };

        if (import.meta?.env?.DEV) {
          console.log('➡️ [ListProductPage] fetch page', { page, TAKE });
        }

        await fetchForList(pageFilters);
        const rawList = useProductStore.getState().products;

        const pickArr = (x) => {
          if (Array.isArray(x)) return x;
          if (x && Array.isArray(x.items)) return x.items;
          if (x && Array.isArray(x.products)) return x.products;
          if (x && Array.isArray(x.data)) return x.data;
          if (x && x.data && Array.isArray(x.data.items)) return x.data.items;
          if (x && x.data && Array.isArray(x.data.products)) return x.data.products;
          if (x && x.data && Array.isArray(x.data.data)) return x.data.data;
          return [];
        };

        const list = pickArr(rawList);

        if (import.meta?.env?.DEV) {
          console.log('✅ [ListProductPage] got', { page, count: list.length });
        }

        const normalizeRow = (p) => {
          const bp = Array.isArray(p?.branchPrice) ? p.branchPrice[0] : p?.branchPrice;
          const sb = Array.isArray(p?.stockBalances) ? p.stockBalances[0] : p?.stockBalances;

          const typeName =
            typeof p?.productType === 'string'
              ? p.productType
              : p?.productTypeName ??
                p?.productType?.name ??
                p?.typeName ??
                p?.product_type_name ??
                null;

          const categoryName =
            p?.categoryName ??
            p?.productType?.globalProductType?.category?.name ??
            null;

          const brandName =
            p?.brandName ??
            p?.brand?.name ??
            p?.brand_name ??
            null;

          const templateTraceName =
            p?.templateName ??
            p?.productTemplateName ??
            p?.templateProduct?.name ??
            null;

          const unitName = p?.unitName ?? p?.unit?.name ?? null;

          return {
            ...p,
            productType: typeName,
            productTypeName: typeName,
            categoryName,
            brandName,
            unitName,
            templateName: templateTraceName,
            sku: p?.sku ?? p?.model ?? p?.spec ?? null,
            costPrice: bp?.costPrice ?? p?.costPrice ?? null,
            priceRetail: bp?.priceRetail ?? p?.priceRetail ?? null,
            priceOnline: bp?.priceOnline ?? p?.priceOnline ?? null,
            priceWholesale: bp?.priceWholesale ?? p?.priceWholesale ?? null,
            priceTechnician: bp?.priceTechnician ?? p?.priceTechnician ?? null,
            stockQuantity: sb?.quantity ?? p?.stockQuantity ?? null,
            stockReserved: sb?.reserved ?? p?.stockReserved ?? null,
            lastReceivedCost: sb?.lastReceivedCost ?? p?.lastReceivedCost ?? null,
          };
        };

        const normalized = Array.isArray(list) ? list.map(normalizeRow) : [];
        acc = acc.concat(normalized);
        if (list.length < TAKE) break;
        page += 1;
      }

      if (import.meta?.env?.DEV) {
        console.log('🏁 [ListProductPage] loadAllProducts done', { total: acc.length });
      }

      setAllProducts(acc);
    } catch (err) {
      console.error('❌ [ListProductPage] loadAllProducts error', err);
      setAllProducts([]);
      setLoadAllError(err);
    } finally {
      setLoadingAll(false);
      loadingAllRef.current = false;
    }
  }, [isSuperAdmin, branchId, fetchForList]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (!branchId) return;
    loadAllProductsOnce();
  }, [isSuperAdmin, branchId, hasLoaded, loadAllProductsOnce]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refresh = params.get('refresh');
    if (refresh && branchId) {
      loadAllProductsOnce();
      params.delete('refresh');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search, location.pathname, isSuperAdmin, branchId, loadAllProductsOnce, navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCommittedSearchText(searchText.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการสินค้า</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              จัดการสินค้าในระบบสต๊อก • เปลี่ยนตัวกรองแล้วแสดงผลทันทีโดยไม่เรียก API ซ้ำ
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              นโยบาย: Product เป็นข้อมูลกลาง (Global) — ไม่มีการปิดใช้งานจาก POS • ลบถาวรได้เฉพาะ SUPERADMIN
            </p>
          </div>
          <StandardActionButtons
            onAdd={() =>
              navigate('create', {
                state: {
                  mode: 'create',
                  source: 'ProductList',
                },
              })
            }
          />
        </div>
        <div className="mt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800" />

        <div className="mt-4">
          <div className="sticky top-0 z-20 rounded-xl border border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="p-3 sm:p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:flex-wrap xl:flex-nowrap">
                <div className="w-full xl:flex-1 xl:min-w-[360px]">
                  <input
                    type="text"
                    placeholder="ค้นหาคำเรียก / แบรนด์"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>

                <div className="w-full lg:w-[180px]">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value="name-asc">คำเรียก A-Z</option>
                    <option value="name-desc">คำเรียก Z-A</option>
                    <option value="price-asc">ราคาน้อย → มาก</option>
                    <option value="price-desc">ราคามาก → น้อย</option>
                  </select>
                </div>

                <div className="w-full lg:w-[220px]">
                  <select
                    value={filter.brandId == null ? '' : String(filter.brandId)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFilter((prev) => ({ ...prev, brandId: v === '' ? null : Number(v) }));
                      setCurrentPage(1);
                    }}
                    className="border px-3 py-2 rounded w-full"
                    disabled={!hasLoaded}
                    aria-disabled={!hasLoaded}
                  >
                    <option value="">แบรนด์ทั้งหมด</option>
                    {(Array.isArray(dropdowns?.brands) ? dropdowns.brands : []).map((b) => (
                      <option key={String(b.id)} value={String(b.id)}>{b.name}</option>
                    ))}
                  </select>
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
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">ความหนาแน่น</label>
                  <select value={density} onChange={(e) => setDensity(e.target.value)} className="border px-3 py-2 rounded">
                    <option value="normal">ปกติ</option>
                    <option value="compact">กะทัดรัด</option>
                  </select>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 select-none w-full lg:w-auto whitespace-nowrap">
                  <input type="checkbox" checked={showAllPrices} onChange={(e) => setShowAllPrices(e.target.checked)} />
                  แสดงราคาทั้งหมด
                </label>
              </div>

              <div className={!hasLoaded ? 'pointer-events-none opacity-60' : ''} aria-disabled={!hasLoaded}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={filter.productTypeId == null ? '' : String(filter.productTypeId)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilter((prev) => ({ ...prev, productTypeId: value === '' ? null : Number(value) }));
                      setCurrentPage(1);
                    }}
                    className="border px-3 py-2 rounded w-full"
                    disabled={!hasLoaded}
                    aria-disabled={!hasLoaded}
                  >
                    <option value="">-- เลือกประเภทสินค้า --</option>
                    {(Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : []).map((type) => (
                      <option key={String(type.id)} value={String(type.id)}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50"
                    disabled={loadingAll || hasLoaded}
                    onClick={() => {
                      if (hasLoaded) return;
                      setHasLoaded(true);
                      setCurrentPage(1);
                      queueMicrotask(() => {
                        loadAllProductsOnce();
                      });
                    }}
                  >
                    แสดงข้อมูล
                  </button>
                </div>
              </div>

              {!hasLoaded && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-800">
                  <div className="font-semibold">ยังไม่ได้โหลดข้อมูล</div>
                  <div className="text-sm opacity-90">กรุณากดปุ่ม “แสดงข้อมูล” เพื่อโหลดรายการสินค้า ก่อนเริ่มใช้งานตัวกรอง</div>
                </div>
              )}

              {hasLoaded && loadingAll && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
                  <div className="font-semibold">กำลังโหลดรายการสินค้า…</div>
                  <div className="text-sm opacity-90">โปรดรอสักครู่ ระบบกำลังดึงข้อมูลทั้งหมดเพื่อกรองในหน้านี้</div>
                </div>
              )}

              {hasLoaded && loadAllError && !loadingAll && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                  <div className="font-semibold">โหลดรายการสินค้าไม่สำเร็จ</div>
                  <div className="text-sm opacity-90">กรุณาลองใหม่อีกครั้ง</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline" onClick={() => loadAllProductsOnce()}>ลองใหม่</button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        navigate(
                          {
                            pathname: location.pathname,
                            search: new URLSearchParams({
                              ...Object.fromEntries(new URLSearchParams(location.search)),
                              refresh: '1',
                            }).toString(),
                          },
                          { replace: true }
                        )
                      }
                    >
                      รีโหลด (refresh=1)
                    </button>
                  </div>
                </div>
              )}

              {hasLoaded && !loadingAll && !loadAllError && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  แสดงผลจากข้อมูลที่โหลดแล้ว <span className="font-medium">{allProducts.length.toLocaleString('th-TH')}</span> รายการ • พบตามเงื่อนไข{' '}
                  <span className="font-medium">{filtered.length.toLocaleString('th-TH')}</span> รายการ
                </div>
              )}

              {hasLoaded && deleteError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                  <div className="font-semibold">ลบสินค้าไม่สำเร็จ</div>
                  <div className="text-sm opacity-90 whitespace-pre-line">{String(deleteError)}</div>
                  <div className="mt-2 text-xs opacity-80">
                    หมายเหตุ: ถ้าสินค้าถูกใช้งานแล้ว ระบบควรบังคับให้ “ห้ามลบ” และใช้วิธี Archive แทน (เพื่อรักษาประวัติ)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTable
            products={hasLoaded ? paginated : []}
            items={hasLoaded ? paginated : []}
            data={hasLoaded ? paginated : []}
            onEdit={(id) =>
              navigate(`edit/${id}`, {
                state: {
                  mode: 'edit',
                  source: 'ProductList',
                },
              })
            }
            onDelete={confirmDelete}
            deleting={deletingId}
            canDelete={isSuperAdmin}
            density={density}
            showAllPrices={showAllPrices}
            productTypes={dropdowns?.productTypes || []}
            hideCategory
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {currentPage} / {Math.max(totalPages || 1, 1)}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>ก่อนหน้า</button>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage >= (totalPages || 1)}
            >
              ถัดไป
            </button>
          </div>
        </div>

        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onClose={() => {
            if (!deletingId) setDeleteTarget(null);
          }}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !deletingId) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
          itemLabel={deleteTarget?.name || 'ไม่พบคำเรียกสินค้า'}
          name="ยืนยันการลบสินค้า (ถาวร)"
          description={`คุณแน่ใจว่าต้องการลบ “${deleteTarget?.name || 'ไม่พบคำเรียกสินค้า'}” หรือไม่?\n\n⚠️ การลบเป็นการลบถาวร และอาจลบไม่ได้หากสินค้าถูกใช้งานแล้ว (มีการอ้างอิงในสต๊อก/จัดซื้อ/ขาย/ออนไลน์)`}
          loading={deletingId === deleteTarget?.id}
        />

        {hasLoaded && !isSuperAdmin && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <div className="text-sm">
              สิทธิ์ปัจจุบัน: <span className="font-medium">{authRole || '-'}</span> • การลบสินค้า (ถาวร) อนุญาตเฉพาะ SUPERADMIN เท่านั้น
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
