


// ✅ src/features/productTemplate/pages/ListProductTemplatePage.jsx
// - โหมด on-demand: ต้องกด “แสดงข้อมูล” ก่อน 1 ครั้ง
// - หลังจากโหลดแล้ว: เปลี่ยน dropdown / includeInactive / page / limit → fetch ทันที
// - โฟลว์ dropdown แบบ cascade: เปลี่ยนหมวด → ล้างประเภท+แบรนด์, เปลี่ยนประเภท → ล้างแบรนด์
// - URL sync: เก็บ filter/page ไว้เพื่อ refresh/back/forward
import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import ProductTemplateTable from '../components/ProductTemplateTable';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { useAuthStore } from '@/features/auth/store/authStore';
import useProductTemplateStore from '../store/productTemplateStore';
import useProductStore from '@/features/product/store/productStore';

const ListProductTemplatePage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const isListPath = /\/pos\/stock\/templates\/?$/.test(location.pathname);

  // ✅ อ่านสิทธิ์จาก authStore แบบ tolerant (รองรับทั้ง value และ function)
  const auth = useAuthStore();
  const isSuperAdmin = React.useMemo(() => {
    const v = auth?.isSuperAdmin;
    return typeof v === 'function' ? !!v() : !!v;
  }, [auth]);

  const canManageProductOrdering = React.useMemo(() => {
    const v = auth?.canManageProductOrdering;
    return typeof v === 'function' ? !!v() : !!v;
  }, [auth]);

  const canManage = React.useMemo(() => {
    return !!isSuperAdmin || !!canManageProductOrdering;
  }, [isSuperAdmin, canManageProductOrdering]);

  // ✅ โหมด on-demand: ต้องกด “แสดงข้อมูล” ก่อน 1 ครั้ง
  const [hasLoaded, setHasLoaded] = React.useState(false);

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
    ensureDropdownsAction?.();
  }, [ensureDropdownsAction]);

  // ✅ Init จาก URL → Store (ยึดโฟลว์เดิม)
  React.useEffect(() => {
    if (!isListPath) return;

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

  // ✅ โฟลว์ “เหมือนของเดิม”:
  // - เมื่อเปลี่ยน filter/page/limit/includeInactive → fetchListAction ทันที
  // - แต่จะเริ่มทำงานหลังผู้ใช้กด “แสดงข้อมูล” เท่านั้น
  //
  // หมายเหตุสำคัญ:
  // - เปลี่ยน “หมวดหมู่” → ล้าง productTypeId + productProfileId
  // - เปลี่ยน “ประเภทสินค้า” → ล้าง productProfileId
  //   เพื่อกันเคส intermediate state ทำให้ยิง fetch ด้วยค่าเก่าแล้วได้ข้อมูลว่าง
  const skipAutoFetchOnceRef = React.useRef(false);

  React.useEffect(() => {
    if (!isListPath) return;
    if (!hasLoaded) return;

    // ✅ กันเคสเปลี่ยนหมวด/ประเภท แล้วเราจะยิง fetch แบบ deterministic จาก onCascadeChange เอง 1 ครั้ง
    if (skipAutoFetchOnceRef.current) return;
    fetchListAction({ page, limit, includeInactive, categoryId, productTypeId, productProfileId });

    const next = new URLSearchParams();
    next.set('page', String(page));
    if (includeInactive) next.set('includeInactive', 'true');
    if (categoryId != null) next.set('categoryId', String(categoryId));
    if (productTypeId != null) next.set('productTypeId', String(productTypeId));
    if (productProfileId != null) next.set('productProfileId', String(productProfileId));

    if (!isSameParams(next, params)) {
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListPath, hasLoaded, page, limit, includeInactive, categoryId, productTypeId, productProfileId]);

  const handleCreate = () => navigate('/pos/stock/templates/create');
  const handleEdit = (row) => navigate(`/pos/stock/templates/edit/${row.id}`);

  const onPrev = () => hasLoaded && page > 1 && setPageAction(page - 1);
  const onNext = () => hasLoaded && page < Math.max(totalPages || 1, 1) && setPageAction(page + 1);

  const prevCategoryRef = React.useRef(categoryId);
  const prevTypeRef = React.useRef(productTypeId);
  const lastCascadeKeyRef = React.useRef('');

  // ✅ เผื่อกรณี API ยังไม่กรองครบทุก field → กรองซ้ำฝั่ง FE แบบปลอดภัย (ไม่กระทบถ้า BE กรองอยู่แล้ว)
  const filteredItems = React.useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const cat = categoryId ?? null;
    const type = productTypeId ?? null;
    const prof = productProfileId ?? null;

    return arr.filter((it) => {
      const itCat = it?.categoryId ?? it?.category?.id ?? it?.category?.categoryId ?? null;
      const itType = it?.productTypeId ?? it?.typeId ?? it?.productType?.id ?? it?.productType?.productTypeId ?? null;
      const itProf = it?.productProfileId ?? it?.profileId ?? it?.productProfile?.id ?? it?.productProfile?.productProfileId ?? null;

      if (cat != null && Number(itCat) !== Number(cat)) return false;
      if (type != null && Number(itType) !== Number(type)) return false;
      if (prof != null && Number(itProf) !== Number(prof)) return false;
      return true;
    });
  }, [items, categoryId, productTypeId, productProfileId]);

  const onCascadeChange = (payload) => {
    // ✅ CascadingFilterGroup: onChange({ categoryId, productTypeId, productProfileId })
    // ⚠️ ปัญหาที่เจอบ่อย: ตอนเลือก “ประเภท/แบรนด์” บาง implementation จะส่งมาเฉพาะ field ที่เปลี่ยน
    // ถ้าเราแปลง rawCat/rawType/rawProf เป็น null ทันที → dropdown เด้งเคลียร์ทั้งหมด

    const rawCat = payload?.categoryId ?? payload?.catId ?? payload?.category?.id;
    const rawType = payload?.productTypeId ?? payload?.typeId ?? payload?.productType?.id;
    const rawProf = payload?.productProfileId ?? payload?.profileId ?? payload?.productProfile?.id;

    // ✅ ถ้า payload ไม่ส่ง field บางตัวมา → ให้ “คงค่าเดิม” ไว้
    const nextCat = rawCat != null ? Number(rawCat) : (categoryId ?? null);
    const nextType = rawType != null ? Number(rawType) : (productTypeId ?? null);
    const nextProf = rawProf != null ? Number(rawProf) : (productProfileId ?? null);

    const prevCat = prevCategoryRef.current ?? (categoryId ?? null);
    const prevType = prevTypeRef.current ?? (productTypeId ?? null);

    const isCategoryChanged = (prevCat ?? null) !== (nextCat ?? null);
    const isTypeChanged = (prevType ?? null) !== (nextType ?? null);

    // ✅ Cascade rules (คง flow เดิม)
    // - เปลี่ยนหมวด → ล้างประเภท + แบรนด์
    // - เปลี่ยนประเภท → ล้างแบรนด์
    setCategoryFilterAction(nextCat);
    setProductTypeFilterAction(isCategoryChanged ? null : nextType);
    setProductProfileFilterAction(isCategoryChanged || isTypeChanged ? null : nextProf);

    prevCategoryRef.current = nextCat;
    prevTypeRef.current = isCategoryChanged ? null : nextType;

    setPageAction(1);

    // ถ้ายังไม่โหลดข้อมูล (on-demand) → แค่ตั้งค่า filter ไว้เฉย ๆ
    if (!hasLoaded) return;

    // ✅ ป้องกันการยิง fetch ซ้ำ (เช่น onChange ถูกเรียกซ้ำจาก component)
    const cascadeKey = `${nextCat ?? ''}|${isCategoryChanged ? '' : nextType ?? ''}|${(isCategoryChanged || isTypeChanged) ? '' : nextProf ?? ''}`;
    if (lastCascadeKeyRef.current === cascadeKey) return;
    lastCascadeKeyRef.current = cascadeKey;

    // ✅ กัน effect ตัวหลักยิง fetch ด้วย state ชั่วคราว (intermediate)
    skipAutoFetchOnceRef.current = true;

    queueMicrotask(() => {
      fetchListAction({
        page: 1,
        limit,
        includeInactive,
        categoryId: nextCat,
        productTypeId: !isCategoryChanged ? nextType : null,
        productProfileId: !isCategoryChanged && !isTypeChanged ? nextProf : null,
      });

      // sync URL ทันที (กันรีเฟรชแล้วหลุด)
      const next = new URLSearchParams(params);
      next.set('page', '1');

      if (includeInactive) next.set('includeInactive', 'true');
      else next.delete('includeInactive');

      if (nextCat != null) next.set('categoryId', String(nextCat));
      else next.delete('categoryId');

      if (!isCategoryChanged && nextType != null) next.set('productTypeId', String(nextType));
      else next.delete('productTypeId');

      if (!isCategoryChanged && !isTypeChanged && nextProf != null) next.set('productProfileId', String(nextProf));
      else next.delete('productProfileId');

      setParams(next, { replace: true });

      queueMicrotask(() => {
        skipAutoFetchOnceRef.current = false;
      });
    });
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการสเปกสินค้า (SKU)</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              สเปกสินค้า (SKU) = ตัวเลือกย่อยของ “แบรนด์” ที่แยกการขาย/ราคา/สต๊อก เช่น 4GB/64GB, 4GB/128GB (ไม่ใช่รุ่น)
            </p>
          </div>
          {canManage && <StandardActionButtons onAdd={handleCreate} />}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {/* ✅ ก่อนกด “แสดงข้อมูล” ให้ disable ตัวกรอง เพื่อไม่ให้ผู้ใช้สับสน */}
          <div className={!hasLoaded ? 'pointer-events-none opacity-60' : ''} aria-disabled={!hasLoaded}>
            <CascadingFilterGroup
              value={{ categoryId, productTypeId, productProfileId }}
              onChange={onCascadeChange}
              dropdowns={dropdowns}
              hiddenFields={["template"]}
              showReset
            />
          </div>

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
                disabled={!hasLoaded}
              />
              แสดงข้อมูลที่ถูกปิดใช้งานด้วย
            </label>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">แถว/หน้า</span>
                <select
                  className="select select-bordered"
                  value={limit}
                  disabled={!hasLoaded}
                  onChange={(e) => {
                    setLimitAction(Number(e.target.value));
                    setPageAction(1);
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50"
                disabled={isLoading || hasLoaded}
                onClick={() => {
                  if (hasLoaded) return;
                  setHasLoaded(true);
                  setPageAction(1);

                  // sync URL ทันที (เพื่อรีเฟรชแล้วยังอยู่ที่ filter เดิม)
                  const next = new URLSearchParams(params);
                  next.set('page', '1');

                  if (includeInactive) next.set('includeInactive', 'true');
                  else next.delete('includeInactive');

                  if (categoryId != null) next.set('categoryId', String(categoryId));
                  else next.delete('categoryId');

                  if (productTypeId != null) next.set('productTypeId', String(productTypeId));
                  else next.delete('productTypeId');

                  if (productProfileId != null) next.set('productProfileId', String(productProfileId));
                  else next.delete('productProfileId');

                  setParams(next, { replace: true });
                }}
              >
                แสดงข้อมูล
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTemplateTable
            data={hasLoaded ? filteredItems : []}
            loading={isLoading}
            error={error}
            page={page}
            limit={limit}
            onEdit={canManage ? handleEdit : undefined}
            onToggleActive={isSuperAdmin ? useProductTemplateStore.getState().toggleActiveAction : undefined}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {page} / {Math.max(totalPages || 1, 1)}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={onPrev} disabled={!hasLoaded || page <= 1 || isLoading}>
              ก่อนหน้า
            </button>
            <button
              className="btn btn-outline"
              onClick={onNext}
              disabled={!hasLoaded || page >= Math.max(totalPages || 1, 1) || isLoading}
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProductTemplatePage;








