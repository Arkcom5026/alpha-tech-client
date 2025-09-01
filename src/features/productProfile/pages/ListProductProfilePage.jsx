// ✅ src/features/productProfile/pages/ListProductProfilePage.jsx
import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import ProductProfileTable from '../components/ProductProfileTable';
import useProductProfileStore from '../store/productProfileStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListProductProfilePage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const isListPath = /\/pos\/stock\/profiles\/?$/.test(location.pathname);

  const {
    items,
    page,
    limit,
    totalPages,
    search,
    includeInactive,
    categoryId,
    productTypeId,
    isLoading,
    error,
    setPageAction,
    setSearchAction,
    setIncludeInactiveAction,
    setCategoryFilterAction,
    setProductTypeFilterAction,
    setLimitAction,
    fetchListAction,
  } = useProductProfileStore();

  const { dropdowns, ensureDropdownsAction } = useProductStore();

  React.useEffect(() => {
    ensureDropdownsAction?.();
  }, [ensureDropdownsAction]);

  // Init from URL → Store
  React.useEffect(() => {
    if (!isListPath) return;
    const p = Number(params.get('page') || 1);
    const s = params.get('search') || '';
    const inc = params.get('includeInactive') === 'true';
    const cat = params.get('categoryId');
    const type = params.get('productTypeId');

    setPageAction(p);
    setSearchAction(s);
    setIncludeInactiveAction(inc);
    setCategoryFilterAction(cat ? Number(cat) : null);
    setProductTypeFilterAction(type ? Number(type) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListPath]);

  const isSameParams = React.useCallback((a, b) => {
    if (a.toString() === b.toString()) return true;
    if (a.size !== b.size) return false;
    for (const [k, v] of a.entries()) {
      if (b.get(k) !== v) return false;
    }
    return true;
  }, []);

  // Fetch list + sync URL
  React.useEffect(() => {
    if (!isListPath) return;

    fetchListAction();

    const next = new URLSearchParams();
    next.set('page', String(page));
    if (search) next.set('search', search);
    if (includeInactive) next.set('includeInactive', 'true');
    if (categoryId != null) next.set('categoryId', String(categoryId));
    if (productTypeId != null) next.set('productTypeId', String(productTypeId));

    if (!isSameParams(next, params)) {
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListPath, page, limit, search, includeInactive, categoryId, productTypeId]);

  const handleCreate = (e) => {
    e.preventDefault();
    console.log('[ListProfile] navigate to create');
    navigate('/pos/stock/profiles/create'); // absolute path ปลอดภัย
  };

  const handleEdit = (row) => {
    const id = Number(row?.id);
    if (!id) return;
    console.log('[ListProfile] navigate to edit', id);
    navigate(`/pos/stock/profiles/edit/${id}`); // absolute path ปลอดภัย
  };

  const onPrev = () => page > 1 && setPageAction(page - 1);
  const onNext = () => page < totalPages && setPageAction(page + 1);

  const onCascadeChange = ({ categoryId: catId, productTypeId: typeId }) => {
    setCategoryFilterAction(catId ? Number(catId) : null);
    setProductTypeFilterAction(typeId ? Number(typeId) : null);
    setPageAction(1);
  };

  const onSearchChange = (e) => {
    setSearchAction(e.target.value || '');
    setPageAction(1);
  };

  const clearSearch = () => {
    setSearchAction('');
    setPageAction(1);
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการลักษณะสินค้า (Product Profiles)</h1>
          <StandardActionButtons onAdd={handleCreate} />
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <CascadingFilterGroup
            value={{ categoryId, productTypeId }}
            onChange={onCascadeChange}
            dropdowns={dropdowns}
            hiddenFields={["template", "productProfile"]}
            showReset
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 grow max-w-xl">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="ค้นหา..."
                value={search}
                onChange={onSearchChange}
              />
              {search ? (
                <button type="button" className="btn" onClick={clearSearch}>ล้าง</button>
              ) : null}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                className="checkbox"
                checked={!!includeInactive}
                onChange={(e) => setIncludeInactiveAction(e.target.checked)}
              />
              แสดงข้อมูลที่ถูกปิดใช้งานด้วย
            </label>

            <div className="flex items-center gap-2 text-sm ml-auto">
              <span className="text-zinc-700 dark:text-zinc-300">แถว/หน้า</span>
              <select
                className="select select-bordered"
                value={limit}
                onChange={(e) => {
                  setLimitAction(Number(e.target.value));
                  setPageAction(1);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductProfileTable
            data={items}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            onEdit={handleEdit}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">หน้า {page} / {Math.max(totalPages || 1, 1)}</div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={onPrev} disabled={page <= 1 || isLoading}>
              ก่อนหน้า
            </button>
            <button className="btn btn-outline" onClick={onNext} disabled={page >= totalPages || isLoading}>
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProductProfilePage;