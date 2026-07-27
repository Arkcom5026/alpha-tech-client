// src/features/brand/pages/ListBrandPage.jsx
// Brand List Page with ProductTypeBrand mapping management

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { confirmation } from '@/runtime';
import { useBrandStore } from '../store/brandStore';

export const normalizeBrandActive = (brand) => brand?.isActive ?? brand?.active ?? true;

export const projectBrandErrorMessage = (error) => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error?.message || error?.code || error?.error || 'เกิดข้อผิดพลาดในการจัดการแบรนด์';
};

export const buildBrandToggleConfirmationKey = (brandId) => `brand.toggleActive.${brandId}`;
export const buildBrandDetachConfirmationKey = (linkId) => `brand.detachFromProductType.${linkId}`;

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
      active
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-500'
    }`}
  >
    {active ? 'ใช้งาน' : 'ปิดใช้งาน'}
  </span>
);

const getLinkBrand = (link) => link?.brand || link;

const ListBrandPage = () => {
  const navigate = useNavigate();
  const [productTypeId, setProductTypeId] = useState('');
  const [didAutoSelectProductType, setDidAutoSelectProductType] = useState(false);
  const [brandToAttachId, setBrandToAttachId] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const items = useBrandStore((state) => state.items) || [];
  const page = useBrandStore((state) => state.page) || 1;
  const pageSize = useBrandStore((state) => state.pageSize) || 20;
  const total = useBrandStore((state) => state.total) || 0;
  const q = useBrandStore((state) => state.q) || '';
  const includeInactive = useBrandStore((state) => state.includeInactive) || false;
  const loading = useBrandStore((state) => state.loading) || false;
  const saving = useBrandStore((state) => state.saving) || false;
  const error = useBrandStore((state) => state.error);
  const runtimeProductTypes = useBrandStore((state) => state.runtimeProductTypes) || [];
  const runtimeProductTypesLoading = useBrandStore((state) => state.runtimeProductTypesLoading) || false;
  const allBrandOptions = useBrandStore((state) => state.allBrandOptions) || [];
  const allBrandOptionsLoading = useBrandStore((state) => state.allBrandOptionsLoading) || false;
  const productTypeBrandLinks = useBrandStore((state) => state.productTypeBrandLinks) || [];
  const productTypeBrandLinksLoading = useBrandStore((state) => state.productTypeBrandLinksLoading) || false;

  const fetchRuntimeProductTypesAction = useBrandStore((state) => state.fetchRuntimeProductTypesAction);
  const fetchBrandsAction = useBrandStore((state) => state.fetchBrandsAction);
  const setQueryAction = useBrandStore((state) => state.setQueryAction);
  const setIncludeInactiveAction = useBrandStore((state) => state.setIncludeInactiveAction);
  const setPageAction = useBrandStore((state) => state.setPageAction);
  const setPageSizeAction = useBrandStore((state) => state.setPageSizeAction);
  const clearErrorAction = useBrandStore((state) => state.clearErrorAction);
  const toggleBrandActiveAction = useBrandStore((state) => state.toggleBrandActiveAction);
  const fetchAllBrandOptionsAction = useBrandStore((state) => state.fetchAllBrandOptionsAction);
  const fetchProductTypeBrandLinksAction = useBrandStore((state) => state.fetchProductTypeBrandLinksAction);
  const attachBrandToProductTypeAction = useBrandStore((state) => state.attachBrandToProductTypeAction);
  const detachBrandFromProductTypeAction = useBrandStore((state) => state.detachBrandFromProductTypeAction);

  const selectedProductTypeId = useMemo(() => {
    const value = Number(productTypeId);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [productTypeId]);

  const selectedProductType = useMemo(
    () => runtimeProductTypes.find((type) => Number(type?.id) === Number(selectedProductTypeId)) || null,
    [runtimeProductTypes, selectedProductTypeId]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(Number(total || 0) / Number(pageSize || 20))),
    [total, pageSize]
  );

  const linkedBrandIds = useMemo(
    () =>
      new Set(
        productTypeBrandLinks
          .map((link) => Number(link?.brandId || link?.brand?.id))
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    [productTypeBrandLinks]
  );

  const attachableBrandOptions = useMemo(
    () =>
      allBrandOptions.filter((brand) => {
        const id = Number(brand?.id);
        return Number.isFinite(id) && id > 0 && !linkedBrandIds.has(id) && normalizeBrandActive(brand);
      }),
    [allBrandOptions, linkedBrandIds]
  );

  useEffect(() => {
    clearErrorAction?.();
  }, [clearErrorAction]);

  useEffect(() => {
    fetchRuntimeProductTypesAction?.({ includeInactive: false, pageSize: 100 });
    fetchAllBrandOptionsAction?.({ includeInactive: false });
  }, [fetchAllBrandOptionsAction, fetchRuntimeProductTypesAction]);

  useEffect(() => {
    if (didAutoSelectProductType || productTypeId || runtimeProductTypes.length === 0) return;
    setProductTypeId(String(runtimeProductTypes[0].id));
    setDidAutoSelectProductType(true);
    setPageAction?.(1);
  }, [didAutoSelectProductType, productTypeId, runtimeProductTypes, setPageAction]);

  useEffect(() => {
    fetchBrandsAction?.({ q, page, pageSize, includeInactive, productTypeId: selectedProductTypeId });
  }, [fetchBrandsAction, q, page, pageSize, includeInactive, selectedProductTypeId]);

  useEffect(() => {
    fetchProductTypeBrandLinksAction?.({ productTypeId: selectedProductTypeId, includeInactive: true });
    setBrandToAttachId('');
  }, [fetchProductTypeBrandLinksAction, selectedProductTypeId]);

  const runConfirmation = async (request) => {
    setPendingConfirmation(request);
    const accepted = await confirmation.confirm({ key: request.key });
    if (!accepted) {
      setPendingConfirmation((current) => (current?.key === request.key ? null : current));
      return false;
    }
    return true;
  };

  const finishConfirmation = (key) => {
    setPendingConfirmation((current) => (current?.key === key ? null : current));
  };

  const cancelConfirmation = () => {
    if (pendingConfirmation?.key) confirmation.cancel(pendingConfirmation.key);
  };

  const acceptConfirmation = () => {
    if (pendingConfirmation?.key) confirmation.resolve(pendingConfirmation.key, true);
  };

  const onToggle = async (brand) => {
    if (!brand?.id || saving) return;
    const nextActive = !normalizeBrandActive(brand);
    const key = buildBrandToggleConfirmationKey(brand.id);
    const accepted = await runConfirmation({
      key,
      title: nextActive ? 'ยืนยันการเปิดใช้งานแบรนด์' : 'ยืนยันการปิดใช้งานแบรนด์',
      message: `ต้องการ${nextActive ? 'เปิด' : 'ปิด'}ใช้งานแบรนด์ “${brand.name || '-'}” หรือไม่?`,
    });
    if (!accepted) return;

    try {
      const result = await toggleBrandActiveAction?.({ id: brand.id, isActive: nextActive });
      if (result?.ok) {
        await fetchBrandsAction?.({ q, page, pageSize, includeInactive, productTypeId: selectedProductTypeId });
        await fetchAllBrandOptionsAction?.({ includeInactive: false });
      }
    } finally {
      finishConfirmation(key);
    }
  };

  const onAttachBrand = async () => {
    if (!selectedProductTypeId || !brandToAttachId || saving) return;
    const result = await attachBrandToProductTypeAction?.({
      productTypeId: selectedProductTypeId,
      brandId: brandToAttachId,
    });
    if (result?.ok) setBrandToAttachId('');
  };

  const onDetachBrand = async (link) => {
    if (!link?.id || !selectedProductTypeId || saving) return;
    const brandName = getLinkBrand(link)?.name || 'แบรนด์นี้';
    const key = buildBrandDetachConfirmationKey(link.id);
    const accepted = await runConfirmation({
      key,
      title: 'ยืนยันการถอดแบรนด์',
      message: `ต้องการถอด “${brandName}” ออกจากประเภทสินค้า “${selectedProductType?.name || '-'}” หรือไม่?`,
    });
    if (!accepted) return;

    try {
      await detachBrandFromProductTypeAction?.({ id: link.id, productTypeId: selectedProductTypeId });
    } finally {
      finishConfirmation(key);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">จัดการแบรนด์</h1>
          <p className="mt-1 text-xs text-slate-500">
            ผูกแบรนด์กับประเภทสินค้าของสาขาปัจจุบัน เพื่อให้หน้าสินค้าเลือกแบรนด์ได้ถูกต้อง
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('create')}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={saving}
        >
          + เพิ่มแบรนด์
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr_auto_auto] lg:items-center">
          <select
            value={productTypeId}
            onChange={(event) => {
              setProductTypeId(event.target.value);
              setDidAutoSelectProductType(true);
              setPageAction?.(1);
            }}
            className="rounded border border-slate-200 px-3 py-2 text-sm"
            disabled={runtimeProductTypesLoading}
          >
            <option value="">-- เลือกประเภทสินค้า --</option>
            {runtimeProductTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(event) => setQueryAction?.(event.target.value)}
            placeholder="ค้นหาแบรนด์ที่ผูกกับประเภทสินค้านี้"
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactiveAction?.(event.target.checked)}
            />
            แสดงรายการที่ปิดใช้งานด้วย
          </label>
          <select
            value={pageSize}
            onChange={(event) => setPageSizeAction?.(event.target.value)}
            className="rounded border border-slate-200 px-3 py-2 text-sm"
          >
            <option value={20}>20 / หน้า</option>
            <option value={50}>50 / หน้า</option>
            <option value={100}>100 / หน้า</option>
          </select>
        </div>
      </div>

      {selectedProductTypeId ? (
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-blue-900">
            ผูกแบรนด์กับประเภทสินค้า: {selectedProductType?.name || '-'}
          </div>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto]">
            <select
              value={brandToAttachId}
              onChange={(event) => setBrandToAttachId(event.target.value)}
              className="rounded border border-blue-200 bg-white px-3 py-2 text-sm"
              disabled={saving || allBrandOptionsLoading}
            >
              <option value="">-- เลือกแบรนด์เพื่อผูกกับประเภทสินค้านี้ --</option>
              {attachableBrandOptions.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={onAttachBrand}
              disabled={!brandToAttachId || saving}
              className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              ผูกแบรนด์
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {productTypeBrandLinks.map((link) => {
              const brand = getLinkBrand(link);
              return (
                <span
                  key={link.id || `${link.productTypeId}-${link.brandId}`}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-900"
                >
                  {brand?.name || `Brand #${link.brandId}`}
                  <button
                    type="button"
                    onClick={() => void onDetachBrand(link)}
                    disabled={saving}
                    className="rounded-full px-1 text-blue-500 hover:text-rose-600 disabled:opacity-50"
                    title="ถอดแบรนด์"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {!productTypeBrandLinksLoading && productTypeBrandLinks.length === 0 ? (
              <span className="text-xs text-blue-700">ยังไม่มีแบรนด์ที่ผูกกับประเภทสินค้านี้</span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          กรุณาเลือกประเภทสินค้าก่อน เพื่อจัดการแบรนด์ที่อนุญาตให้ใช้กับประเภทสินค้านั้น
        </div>
      )}

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{projectBrandErrorMessage(error)}</div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>รายการแบรนด์ที่ผูกกับประเภทสินค้านี้</span>
          <span>{loading ? 'กำลังโหลด...' : `ทั้งหมด ${total} รายการ`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="w-16 px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">ชื่อแบรนด์</th>
                <th className="w-36 px-4 py-3 text-center font-semibold">สถานะ</th>
                <th className="w-44 px-4 py-3 text-center font-semibold">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((brand, index) => {
                const active = normalizeBrandActive(brand);
                return (
                  <tr key={brand.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{(page - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{brand.name || '-'}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge active={active} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`edit/${brand.id}`)}
                          className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => void onToggle(brand)}
                          disabled={saving}
                          className={`rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 ${
                            active ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}
                        >
                          {active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    {selectedProductTypeId ? 'ยังไม่มีแบรนด์ที่ผูกกับประเภทสินค้านี้' : 'กรุณาเลือกประเภทสินค้า'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>หน้า {page} / {totalPages}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPageAction?.(Math.max(1, page - 1))}
            disabled={loading || page <= 1}
            className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <button
            type="button"
            onClick={() => setPageAction?.(Math.min(totalPages, page + 1))}
            disabled={loading || page >= totalPages}
            className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>

      {pendingConfirmation ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div>
            <div className="text-sm font-semibold text-amber-900">{pendingConfirmation.title}</div>
            <div className="mt-1 text-sm text-amber-800">{pendingConfirmation.message}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelConfirmation}
              className="rounded border border-amber-300 px-3 py-1.5 text-sm text-amber-900"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={acceptConfirmation}
              className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ListBrandPage;
