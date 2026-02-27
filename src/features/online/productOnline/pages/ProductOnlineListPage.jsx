
// ProductOnlineListPage.jsx

import React, { useEffect, useMemo } from 'react';
import { useProductOnlineStore } from '../store/productOnlineStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

import ProductCardOnline from '../components/ProductCardOnline';

const ProductOnlineListPage = () => {
  // ✅ branch
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const isDetectingBranch = useBranchStore((state) => state.isDetectingBranch ?? false);
  const detectBranchError = useBranchStore((state) => state.detectBranchError ?? '');
    
  // ✅ online store (server-side paging/search/filter)
  const products = useProductOnlineStore((state) => state.products);
  const total = useProductOnlineStore((state) => state.total);
  const page = useProductOnlineStore((state) => state.page);  const loading = useProductOnlineStore((state) => state.isLoading);
  const error = useProductOnlineStore((state) => state.error);

    const nextPageAction = useProductOnlineStore((state) => state.nextPageAction);
  const loadProductsAction = useProductOnlineStore((state) => state.loadProductsAction);  
  // ✅ derived
  const shown = Array.isArray(products) ? products.length : 0;
  const hasMore = shown < Number(total || 0);

  const safeProducts = useMemo(() => {
    const base = Array.isArray(products) ? products : [];
    // guardrail (just in case BE misses): show only items with online price
    return base.filter((p) => Number(p?.priceOnline ?? p?.branchPriceOnline ?? 0) > 0);
  }, [products]);

  // ✅ initial load when branch becomes available (auto-select or manual)
  useEffect(() => {
    if (!selectedBranchId) return;
    loadProductsAction({ branchId: selectedBranchId, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  return (
    <div className="w-full px-4">
      <div className="text-xs text-gray-600">
        แสดง {shown.toLocaleString()} จาก {Number(total || 0).toLocaleString()} รายการ
      </div>

      {(!selectedBranchId || isDetectingBranch || detectBranchError) ? (
        <div className="mt-2 text-xs text-gray-600">
          {!selectedBranchId ? 'ระบบกำลังเลือกสาขาให้อัตโนมัติ…' : ''}
          {isDetectingBranch ? ' กำลังตรวจสอบตำแหน่ง…' : ''}
          {detectBranchError ? ` ${detectBranchError}` : ''}
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-2 text-2xl">⚠️</div>
          <h3 className="text-base font-semibold">เกิดปัญหาในการโหลดสินค้า</h3>
          <p className="mt-1 text-sm text-gray-600">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              if (!selectedBranchId) return;
              loadProductsAction({ branchId: selectedBranchId, page: 1 });
            }}
          >
            ลองใหม่
          </button>
        </div>
      ) : loading && shown === 0 ? (
        // Skeleton first load
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-[260px] animate-pulse rounded-2xl border bg-white p-4 shadow-sm">
              <div className="h-36 w-full rounded-xl bg-gray-200" />
              <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
              <div className="mt-4 h-10 w-full rounded-xl bg-gray-200" />
            </div>
          ))}
        </div>
      ) : safeProducts.length > 0 ? (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {safeProducts.map((item) => (
              <ProductCardOnline key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            {hasMore ? (
              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm"
                disabled={loading}
                onClick={() => {
                  if (!selectedBranchId) return;
                  nextPageAction();
                  loadProductsAction({ branchId: selectedBranchId, page: page + 1 });
                }}
              >
                {loading ? 'กำลังโหลด…' : 'แสดงเพิ่ม'}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-2 text-2xl">🛒</div>
          <h3 className="text-base font-semibold">ยังไม่มีสินค้าออนไลน์ในสาขานี้</h3>
          <p className="mt-1 text-sm text-gray-600">
            หากคุณเพิ่งตั้งค่าสาขาใหม่ ให้เพิ่ม “ราคาขายออนไลน์” (BranchPrice) ก่อน สินค้าจึงจะแสดงในหน้านี้
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductOnlineListPage;











