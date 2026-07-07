// ✅ src/features/productType/pages/ListProductTypePage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductTypeTable from '../components/ProductTypeTable.jsx';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons.jsx';
import useProductTypeStore from '../store/productTypeStore.js';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const ListProductTypePage = () => {
  const [hasSearched, setHasSearched] = React.useState(false);
  const didFetchRef = React.useRef(false);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const { canManageProductOrdering, isSuperAdmin } = useAuthStore();
  const canManage = isSuperAdmin || canManageProductOrdering();

  const {
    items,
    page,
    limit,
    search,
    includeInactive,
    isLoading,
    error,
    setPageAction,
    setLimitAction,
    setSearchAction,
    setIncludeInactiveAction,
    fetchListAction,
  } = useProductTypeStore();

  React.useEffect(() => {
    const p = Number(params.get('page') || 1);
    const s = params.get('search') || '';
    const inc = params.get('includeInactive') === 'true';

    setPageAction(p);
    setSearchAction(s);
    setIncludeInactiveAction(inc);
  }, [params, setPageAction, setSearchAction, setIncludeInactiveAction]);

  React.useEffect(() => {
    if (!hasSearched) return;
    if (didFetchRef.current) return;

    didFetchRef.current = true;
    fetchListAction();
  }, [hasSearched, fetchListAction]);

  React.useEffect(() => {
    if (!hasSearched) return;

    const next = new URLSearchParams(params);
    next.set('page', String(page));

    if (search) next.set('search', search);
    else next.delete('search');

    if (includeInactive) next.set('includeInactive', 'true');
    else next.delete('includeInactive');

    next.delete('categoryId');

    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [hasSearched, page, search, includeInactive, params, setParams]);

  const handleEdit = (row) => navigate(`edit/${row.id}`);
  const handleCreate = () => navigate('create');

  const filteredItems = React.useMemo(() => {
    if (!hasSearched) return [];

    const isRowActive = (r) => {
      const v = r?.isActive ?? r?.active ?? r?.enabled;
      return v === undefined ? true : v !== false;
    };

    return (items || [])
      .filter((r) => {
        if (!includeInactive && !isRowActive(r)) return false;
        return true;
      })
      .filter((r) => {
        const q = (search || '').trim().toLowerCase();
        if (!q) return true;
        const name = String(r?.name ?? r?.typeName ?? '').toLowerCase();
        return name.includes(q);
      });
  }, [hasSearched, items, includeInactive, search]);

  const totalPagesClient = React.useMemo(() => {
    if (!hasSearched) return 1;
    const n = Math.ceil((filteredItems.length || 0) / Math.max(limit || 1, 1));
    return Math.max(n, 1);
  }, [hasSearched, filteredItems.length, limit]);

  const pageItems = React.useMemo(() => {
    if (!hasSearched) return [];
    const safePage = Math.min(Math.max(page || 1, 1), totalPagesClient);
    const start = (safePage - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [hasSearched, filteredItems, page, limit, totalPagesClient]);

  const onPrev = () => {
    if (!hasSearched) return;
    if (page > 1) setPageAction(page - 1);
  };

  const onNext = () => {
    if (!hasSearched) return;
    if (page < totalPagesClient) setPageAction(page + 1);
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">จัดการประเภทสินค้า</h1>
          {canManage && <StandardActionButtons onAdd={handleCreate} />}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                className="checkbox"
                checked={!!includeInactive}
                onChange={(e) => {
                  setIncludeInactiveAction(e.target.checked);
                  setPageAction(1);
                }}
              />
              แสดงข้อมูลที่ถูกปิดใช้งานด้วย
            </label>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
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

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50"
                disabled={isLoading || hasSearched}
                onClick={() => {
                  if (hasSearched) return;
                  didFetchRef.current = false;
                  setHasSearched(true);
                  setPageAction(1);

                  const next = new URLSearchParams(params);
                  next.set('page', '1');

                  if (search) next.set('search', search);
                  else next.delete('search');

                  if (includeInactive) next.set('includeInactive', 'true');
                  else next.delete('includeInactive');

                  next.delete('categoryId');

                  setParams(next, { replace: true });
                }}
              >
                แสดงข้อมูล
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTypeTable
            data={hasSearched ? pageItems : []}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            canManage={canManage}
            onEdit={canManage ? handleEdit : undefined}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {page} / {totalPagesClient}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={onPrev} disabled={!hasSearched || page <= 1 || isLoading}>
              ก่อนหน้า
            </button>
            <button className="btn btn-outline" onClick={onNext} disabled={!hasSearched || page >= totalPagesClient || isLoading}>
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProductTypePage;
