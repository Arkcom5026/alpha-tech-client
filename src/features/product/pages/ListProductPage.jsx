import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import ProductTable from '../components/ProductTable';
import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ListProductPage() {
  const [searchText, setSearchText] = useState('');
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [filter, setFilter] = useState({
    categoryId: null,
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
  const shopSlug = location.pathname.split('/')[1] || 'advancetech';

  const authRole = useAuthStore((s) => s?.user?.role ?? s?.role ?? null);
  const isSuperAdmin = String(authRole || '').toUpperCase() === 'SUPERADMIN';

  const {
    products,
    fetchProductsAction,
    fetchProducts,
    dropdowns,
    dropdownsLoaded,
    ensureDropdownsAction,
    deleteProductAction,
    deleteProduct,
  } = useProductStore();

  const fetchForList = isSuperAdmin ? fetchProducts : fetchProductsAction;
  const dropdownsFetchRef = useRef({ branchId: null, done: false });

  useEffect(() => {
    if (!hasLoaded) return;
    if (!isSuperAdmin && !branchId) return;
    if (dropdownsLoaded === true) return;

    if (dropdownsFetchRef.current.branchId !== branchId) {
      dropdownsFetchRef.current = { branchId, done: false };
    }

    if (dropdownsFetchRef.current.done) return;
    dropdownsFetchRef.current.done = true;

    ensureDropdownsAction();
  }, [hasLoaded, branchId, dropdownsLoaded, ensureDropdownsAction, isSuperAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const s = params.get('sort') || 'name-asc';
    const cat = params.get('categoryId');
    const type = params.get('productTypeId');
    setSearchText(q);
    setCommittedSearchText(q);
    setSortOrder(s);

    setFilter((prev) => ({
      ...prev,
      categoryId: cat != null ? Number(cat) : null,
      productTypeId: type != null ? Number(type) : null,
    }));
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.categoryId != null) params.set('categoryId', String(filter.categoryId));
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
    if (!deleteTarget?.id) return;
    if (!isSuperAdmin) {
      setDeleteError('สิทธิ์ไม่เพียงพอ: เฉพาะ SUPERADMIN เท่านั้นที่สามารถลบสินค้าได้');
      setDeleteTarget(null);
      return;
    }

    const targetId = deleteTarget.id;
    setDeletingId(targetId);
    setDeleteError(null);
    try {
      const deleteFn = typeof deleteProductAction === 'function' ? deleteProductAction : deleteProduct;
      if (typeof deleteFn !== 'function') throw new Error('FE_NOT_READY_DELETE_ACTION');

      await deleteFn(targetId);
      setAllProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p?.id !== targetId) : prev));
      setDeleteTarget(null);
      await loadAllProductsOnce();
    } catch (error) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'ลบสินค้าไม่สำเร็จ';
      setDeleteError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const getPrice = (p) => p.prices?.find((pr) => pr.level === 1)?.price || 0;

  const resolveCategoryId = (p) => {
    const direct = p?.categoryId ?? p?.category?.id;
    if (direct != null) return direct;

    const name = p?.categoryName ?? p?.category?.name ?? p?.category_name;
    if (name && Array.isArray(dropdowns?.categories)) {
      const hit = dropdowns.categories.find((c) => String(c?.name || '').trim() === String(name).trim());
      if (hit?.id != null) return hit.id;
    }
    const viaType = p?.productType?.categoryId ?? p?.productType?.category?.id;
    if (viaType != null) return viaType;
    return undefined;
  };

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
      const resolvedCategoryId = resolveCategoryId(p);
      const okCategory = matchesId(filter.categoryId, resolvedCategoryId);

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

      return okCategory && okType && okBrand && okSearch;
    });
  }, [allProducts, filter, committedSearchText, dropdowns, dropdownsLoaded]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'price-asc': return getPrice(a) - getPrice(b);
        case 'price-desc': return getPrice(b) - getPrice(a);
        default: return 0;
      }
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    return sorted.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [sorted, currentPage, perPage]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / perPage), [filtered.length, perPage]);

  // 🟢 FIXED SYNTAX: ปิดปีกกาฟังก์ชันทำความสะอาดระเบ็บบล็อก Git/Vite เรียบร้อย
  const loadAllProductsOnce = useCallback(async () => {
    if (!isSuperAdmin && !branchId) return;
    if (loadingAllRef.current) return;

    loadingAllRef.current = true;
    setLoadingAll(true);
    setLoadAllError(null);

    try {
      let page = 1;
      let acc = [];

      while (page <= MAX_PAGES_SAFETY) {
        const pageFilters = { page, take: TAKE, pageSize: TAKE, limit: TAKE, includeInactive: 0 };
        await fetchForList(pageFilters);
        const rawList = useProductStore.getState().products;

        const pickArr = (x) => {
          if (Array.isArray(x)) return x;
          if (x && Array.isArray(x.items)) return x.items;
          if (x && Array.isArray(x.products)) return x.products;
          if (x && Array.isArray(x.data)) return x.data;
          return [];
        };

        const list = pickArr(rawList);
        const normalizeRow = (p) => {
          const bp = Array.isArray(p?.branchPrice) ? p.branchPrice[0] : p?.branchPrice;
          return {
            ...p,
            category: p?.category?.name ?? p?.categoryName ?? null,
            productType: p?.productType?.name ?? p?.productTypeName ?? null,
            brandName: p?.brand?.name ?? p?.brandName ?? null,
            sku: p?.sku ?? p?.model ?? p?.spec ?? null,
            costPrice: bp?.costPrice ?? p?.costPrice ?? null,
            priceRetail: bp?.priceRetail ?? p?.priceRetail ?? null,
            priceOnline: bp?.priceOnline ?? p?.priceOnline ?? null,
            priceWholesale: bp?.priceWholesale ?? p?.priceWholesale ?? null,
            priceTechnician: bp?.priceTechnician ?? p?.priceTechnician ?? null,
          };
        };

        const normalized = list.map(normalizeRow);
        acc = acc.concat(normalized);
        if (list.length < TAKE) break;
        page += 1;
      }
      setAllProducts(acc);
    } catch (err) {
      setLoadAllError(err);
    } finally {
      loadingAllRef.current = false;
      setLoadingAll(false);
    }
  }, [isSuperAdmin, branchId, fetchForList]);

  useEffect(() => {
    if (!hasLoaded) return;
    loadAllProductsOnce();
  }, [hasLoaded, loadAllProductsOnce]);

  const handleFilterChange = (next) => {
    if (!hasLoaded) return;
    const toIdOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    setFilter((prev) => ({
      ...prev,
      categoryId: toIdOrNull(next?.categoryId),
      productTypeId: toIdOrNull(next?.productTypeId),
      brandId: toIdOrNull(next?.brandId),
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setCommittedSearchText(searchText.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  return (
    <div className="p-6 w-full flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="w-full max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">รายการสินค้า</h1>
            <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              จัดการสินค้าในระบบสต๊อก • เปลี่ยนตัวกรองแล้วแสดงผลทันทีโดยไม่เรียก API ซ้ำ
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              นโยบาย: Product เป็นข้อมูลกลาง (Global) — ไม่มีการปิดใช้งานจาก POS • ลบถาวรได้เฉพาะ SUPERADMIN
            </p>
          </div>
          <StandardActionButtons onAdd={() => navigate(`/${shopSlug}/pos/stock/products/create`)} />
        </div>
        <div className="mt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800" />

        {/* Filters Panel */}
        <div className="mt-4">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap xl:flex-nowrap">
              <div className="w-full xl:flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาคำเรียก / แบรนด์"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              <div className="w-full lg:w-[180px]">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!hasLoaded}
                >
                  <option value="">แบรนด์ทั้งหมด</option>
                  {(Array.isArray(dropdowns?.brands) ? dropdowns.brands : []).map((b) => (
                    <option key={String(b.id)} value={String(b.id)}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">แสดง</label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-2 py-2 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Cascading filters Wrapper */}
            <div className={`text-zinc-900 dark:text-zinc-100 ${!hasLoaded ? 'pointer-events-none opacity-40' : ''}`}>
              <CascadingFilterGroup
                value={filter}
                onChange={handleFilterChange}
                dropdowns={dropdowns}
                showReset
                hiddenFields={['product']}
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
              {hasLoaded && !loadingAll && (
                <div className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                  โหลดแล้ว <span className="text-blue-600 dark:text-blue-400 font-bold">{allProducts.length}</span> รายการ • กรองพบ <span className="text-emerald-600 dark:text-emerald-400 font-bold">{filtered.length}</span> รายการ
                </div>
              )}
              {!hasLoaded && <div className="text-sm text-zinc-500 dark:text-zinc-400">ยังไม่ได้เปิดการเรียกข้อมูล</div>}

              <button
                type="button"
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                disabled={loadingAll || hasLoaded}
                onClick={() => setHasLoaded(true)}
              >
                {loadingAll ? 'กำลังโหลดข้อมูล...' : 'แสดงข้อมูล'}
              </button>
            </div>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="mt-5 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-md bg-white dark:bg-zinc-900">
          <ProductTable
            products={hasLoaded ? paginated : []}
            onEdit={(id) => navigate(`/${shopSlug}/pos/stock/products/edit/${id}`)}
            onDelete={confirmDelete}
            deleting={deletingId}
            canDelete={isSuperAdmin}
            density={density}
          />
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between mt-5 px-1">
          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            หน้า {currentPage} จากทั้งหมด {Math.max(totalPages, 1)} หน้า
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              ก่อนหน้า
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              ถัดไป
            </button>
          </div>
        </div>

        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          itemLabel={deleteTarget?.name || ''}
          loading={deletingId === deleteTarget?.id}
        />
      </div>
    </div>
  );
}