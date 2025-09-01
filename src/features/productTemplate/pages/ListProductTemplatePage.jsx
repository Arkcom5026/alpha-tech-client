// ✅ src/features/productTemplate/pages/ListProductTemplatePage.jsx (ปรับสิทธิ์ให้ SuperAdmin + Admin จัดการได้ และสอดคล้อง RBAC)
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductTemplateTable from '../components/ProductTemplateTable';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { useAuthStore } from '@/features/auth/store/authStore';
import useProductTemplateStore from '../store/productTemplateStore';
import useProductStore from '@/features/product/store/productStore';

const ListProductTemplatePage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const { canManageProductOrdering, isSuperAdmin } = useAuthStore();
  const canManage = isSuperAdmin || canManageProductOrdering;

  const {
    items,
    page,
    limit,
    totalPages,
    includeInactive,
    categoryId,
    productTypeId,
    productProfileId,
    isLoading,
    error,
    setPageAction,
    setIncludeInactiveAction,
    setCategoryFilterAction,
    setProductTypeFilterAction,
    setProductProfileFilterAction,
    setLimitAction,
    fetchListAction,
  } = useProductTemplateStore();

  const { dropdowns, ensureDropdownsAction } = useProductStore();

  React.useEffect(() => {
    ensureDropdownsAction();
  }, [ensureDropdownsAction]);

  React.useEffect(() => {
    const p = Number(params.get('page') || 1);
    const inc = params.get('includeInactive') === 'true';
    const cat = params.get('categoryId');
    const type = params.get('productTypeId');
    const prof = params.get('productProfileId');

    setPageAction(p);
    setIncludeInactiveAction(inc);
    setCategoryFilterAction(cat ? Number(cat) : null);
    setProductTypeFilterAction(type ? Number(type) : null);
    setProductProfileFilterAction(prof ? Number(prof) : null);
  }, [params, setPageAction, setIncludeInactiveAction, setCategoryFilterAction, setProductTypeFilterAction, setProductProfileFilterAction]);

  React.useEffect(() => {
    fetchListAction();
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    if (includeInactive) next.set('includeInactive', 'true'); else next.delete('includeInactive');
    if (categoryId != null) next.set('categoryId', String(categoryId)); else next.delete('categoryId');
    if (productTypeId != null) next.set('productTypeId', String(productTypeId)); else next.delete('productTypeId');
    if (productProfileId != null) next.set('productProfileId', String(productProfileId)); else next.delete('productProfileId');
    setParams(next, { replace: true });
  }, [page, limit, includeInactive, categoryId, productTypeId, productProfileId, fetchListAction, params, setParams]);

  const handleCreate = () => navigate('/pos/stock/templates/create');
  const handleEdit = (row) => navigate(`/pos/stock/templates/edit/${row.id}`);
  const onPrev = () => page > 1 && setPageAction(page - 1);
  const onNext = () => page < totalPages && setPageAction(page + 1);

  const onCascadeChange = ({ categoryId: c, productTypeId: t, productProfileId: p }) => {
    setCategoryFilterAction(c ? Number(c) : null);
    setProductTypeFilterAction(t ? Number(t) : null);
    setProductProfileFilterAction(p ? Number(p) : null);
    setPageAction(1);
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการรูปแบบสินค้า (Product Template)</h1>
          {canManage && <StandardActionButtons onAdd={handleCreate} />}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <CascadingFilterGroup
            value={{ categoryId, productTypeId, productProfileId }}
            onChange={onCascadeChange}
            dropdowns={dropdowns}
            hiddenFields={["template"]}
            showReset
          />

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

        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTemplateTable
            data={items}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            onEdit={canManage ? handleEdit : undefined}
            onToggleActive={isSuperAdmin ? useProductTemplateStore.getState().toggleActiveAction : undefined}
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

export default ListProductTemplatePage;
