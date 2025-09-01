// ✅ src/features/productType/pages/ListProductTypePage.jsx

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductTypeTable from '../components/ProductTypeTable';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import useProductTypeStore from '../store/productTypeStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import { useAuthStore } from '@/features/auth/store/authStore';

const ListProductTypePage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { canManageProductOrdering, isSuperAdmin } = useAuthStore();

  const {
    items,
    page,
    limit,
    totalPages,
    search,
    includeInactive,
    categoryId,
    isLoading,
    error,
    setPageAction,
    setLimitAction,
    setSearchAction,
    setIncludeInactiveAction,
    setCategoryFilterAction,
    fetchListAction,
  } = useProductTypeStore();

  // ✅ ใช้ pattern เดียวกับ ListProductProfilePage: โหลด dropdowns ผ่าน productStore
  const { dropdowns, ensureDropdownsAction } = useProductStore();
  React.useEffect(() => { ensureDropdownsAction(); }, [ensureDropdownsAction]);

  // --- Sync URL <-> Store (page, search, includeInactive, categoryId)
  React.useEffect(() => {
    const p = Number(params.get('page') || 1);
    const s = params.get('search') || '';
    const inc = params.get('includeInactive') === 'true';
    const cat = params.get('categoryId');

    setPageAction(p);
    setSearchAction(s);
    setIncludeInactiveAction(inc);
    setCategoryFilterAction(cat ? Number(cat) : null);
  }, [params, setPageAction, setSearchAction, setIncludeInactiveAction, setCategoryFilterAction]);

  // --- Fetch list whenever filters change
  React.useEffect(() => {
    fetchListAction();
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    if (search) next.set('search', search); else next.delete('search');
    if (includeInactive) next.set('includeInactive', 'true'); else next.delete('includeInactive');
    if (categoryId != null) next.set('categoryId', String(categoryId)); else next.delete('categoryId');
    setParams(next, { replace: true });
  }, [page, limit, search, includeInactive, categoryId, fetchListAction, params, setParams]);

  const handleEdit = (row) => navigate(`/pos/stock/types/edit/${row.id}`);
  const handleCreate = () => navigate('/pos/stock/types/create');

  const onPrev = () => page > 1 && setPageAction(page - 1);
  const onNext = () => page < totalPages && setPageAction(page + 1);

  // ✅ ใช้รูปแบบเดียวกับ ListProductProfilePage ในการใช้ CascadingFilterGroup
  const onCascadeChange = ({ categoryId: catId }) => {
    setCategoryFilterAction(catId ? Number(catId) : null);
    setPageAction(1);
  };

  const canManage = isSuperAdmin || canManageProductOrdering;

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">จัดการประเภทสินค้า</h1>
          {/* ✅ แสดงปุ่มเพิ่มทั้ง Admin และ SuperAdmin */}
          {canManage && <StandardActionButtons onAdd={handleCreate} />}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <CascadingFilterGroup
            value={{ categoryId }}
            onChange={onCascadeChange}
            dropdowns={dropdowns}
            hiddenFields={["template", "productProfile", "productType"]}
            showReset
          />

          {/* Include Inactive toggle + Page size */}
          <div className="flex flex-wrap items-center gap-3">
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

        {/* Table */}
        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTypeTable
            data={items}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            onEdit={canManage ? handleEdit : undefined}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {page} / {Math.max(totalPages || 1, 1)}
          </div>
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

export default ListProductTypePage;
