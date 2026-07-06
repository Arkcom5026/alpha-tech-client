// src/features/brand/pages/ListBrandPage.jsx
// Brand List Page (branch-scoped catalog master)

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBrandStore } from '../store/brandStore';
import useProductTypeStore from '@/features/productType/store/productTypeStore';

const normalizeActive = (brand) => brand?.isActive ?? brand?.active ?? true;

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

const ListBrandPage = () => {
  const navigate = useNavigate();
  const [productTypeId, setProductTypeId] = useState('');

  const items = useBrandStore((state) => state.items) || [];
  const page = useBrandStore((state) => state.page) || 1;
  const pageSize = useBrandStore((state) => state.pageSize) || 20;
  const total = useBrandStore((state) => state.total) || 0;
  const q = useBrandStore((state) => state.q) || '';
  const includeInactive = useBrandStore((state) => state.includeInactive) || false;
  const loading = useBrandStore((state) => state.loading) || false;
  const saving = useBrandStore((state) => state.saving) || false;
  const error = useBrandStore((state) => state.error);

  const fetchBrandsAction = useBrandStore((state) => state.fetchBrandsAction);
  const setQueryAction = useBrandStore((state) => state.setQueryAction);
  const setIncludeInactiveAction = useBrandStore((state) => state.setIncludeInactiveAction);
  const setPageAction = useBrandStore((state) => state.setPageAction);
  const setPageSizeAction = useBrandStore((state) => state.setPageSizeAction);
  const clearErrorAction = useBrandStore((state) => state.clearErrorAction);
  const toggleBrandActiveAction = useBrandStore((state) => state.toggleBrandActiveAction);

  const productTypes = useProductTypeStore((state) => state.items) || [];
  const productTypesLoading = useProductTypeStore((state) => state.isLoading) || false;
  const fetchProductTypesAction = useProductTypeStore((state) => state.fetchListAction);
  const setProductTypeLimitAction = useProductTypeStore((state) => state.setLimitAction);

  const selectedProductTypeId = useMemo(() => {
    const n = Number(productTypeId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [productTypeId]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(Number(total || 0) / Number(pageSize || 20))), [total, pageSize]);

  useEffect(() => {
    clearErrorAction?.();
  }, [clearErrorAction]);

  useEffect(() => {
    setProductTypeLimitAction?.(100);
    fetchProductTypesAction?.();
  }, [fetchProductTypesAction, setProductTypeLimitAction]);

  useEffect(() => {
    fetchBrandsAction?.({ q, page, pageSize, includeInactive, productTypeId: selectedProductTypeId });
  }, [fetchBrandsAction, q, page, pageSize, includeInactive, selectedProductTypeId]);

  const onSearchChange = (event) => {
    setQueryAction?.(event.target.value);
  };

  const onProductTypeChange = (event) => {
    setProductTypeId(event.target.value);
    setPageAction?.(1);
  };

  const onIncludeInactiveChange = (event) => {
    setIncludeInactiveAction?.(event.target.checked);
  };

  const onPageSizeChange = (event) => {
    setPageSizeAction?.(event.target.value);
  };

  const onToggle = async (brand) => {
    if (!brand?.id || saving) return;
    await toggleBrandActiveAction?.({ id: brand.id, isActive: !normalizeActive(brand) });
    await fetchBrandsAction?.({ q, page, pageSize, includeInactive, productTypeId: selectedProductTypeId });
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">จัดการแบรนด์</h1>
          <p className="mt-1 text-xs text-slate-500">จัดการข้อมูลแบรนด์สินค้าสำหรับสาขาปัจจุบัน</p>
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
            onChange={onProductTypeChange}
            className="rounded border border-slate-200 px-3 py-2 text-sm"
            disabled={productTypesLoading}
          >
            <option value="">-- ประเภทสินค้าทั้งหมด --</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <input
            value={q}
            onChange={onSearchChange}
            placeholder="ค้นหาแบรนด์"
            className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />

          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={includeInactive} onChange={onIncludeInactiveChange} />
            แสดงรายการที่ปิดใช้งานด้วย
          </label>

          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="rounded border border-slate-200 px-3 py-2 text-sm"
          >
            <option value={20}>20 / หน้า</option>
            <option value={50}>50 / หน้า</option>
            <option value={100}>100 / หน้า</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{error}</div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>รายการแบรนด์</span>
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
                const active = normalizeActive(brand);
                const rowNo = (Number(page || 1) - 1) * Number(pageSize || 20) + index + 1;

                return (
                  <tr key={brand.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{rowNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{brand.name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge active={active} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`edit/${brand.id}`)}
                          className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggle(brand)}
                          disabled={saving}
                          className={`rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 ${
                            active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
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
                    ไม่มีข้อมูลแบรนด์
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          หน้า {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPageAction?.(Math.max(1, Number(page || 1) - 1))}
            disabled={loading || Number(page || 1) <= 1}
            className="rounded border border-slate-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <button
            type="button"
            onClick={() => setPageAction?.(Math.min(totalPages, Number(page || 1) + 1))}
            disabled={loading || Number(page || 1) >= totalPages}
            className="rounded border border-slate-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListBrandPage;
