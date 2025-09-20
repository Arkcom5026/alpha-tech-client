


// ProductOnlineListPage.jsx

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useProductOnlineStore } from '../store/productOnlineStore';

import ProductCardOnline from '../components/ProductCardOnline';
import { useBranchStore } from '@/features/branch/store/branchStore';


const ProductOnlineListPage = () => {
  const rawProducts = useProductOnlineStore((state) => state.products);
  const loadProductsAction = useProductOnlineStore((state) => state.loadProductsAction);
  const loadDropdownsAction = useProductOnlineStore((state) => state.loadDropdownsAction);

  const selectedBranchId = useBranchStore((state) => state.selectedBranchId); 
  const autoDetectAndSetBranchByGeo = useBranchStore((state) => state.autoDetectAndSetBranchByGeo);
  const loadAllBranchesAction = useBranchStore((state) => state.loadAllBranchesAction);
  const setSelectedBranchId = useBranchStore((state) => state.setSelectedBranchId);
  const branches = useBranchStore((state) => state.branches);

  const [autoSelectTried, setAutoSelectTried] = useState(false);
  const [branchesLoaded, setBranchesLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const loadCountRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const products = useMemo(() => {
    const result = rawProducts.map((p) => {
      const branchPriceMatch = p.branchPrice?.find((bp) => bp.branchId === selectedBranchId);
      const priceOnline = branchPriceMatch?.priceOnline ?? p.priceOnline ?? 0;
      return { ...p, priceOnline };
    });
    console.log(`[PRODUCT MAP ✅] mapped ${result.length} รายการพร้อม priceOnline`);
    return result;
  }, [rawProducts, selectedBranchId]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadAllBranchesAction();
        setBranchesLoaded(true);
      } catch (err) {
        console.error('❌ โหลดรายชื่อสาขาล้มเหลว:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (branchesLoaded && !selectedBranchId) {
      const detect = async () => {
        await autoDetectAndSetBranchByGeo();
        setAutoSelectTried(true);
      };
      detect();
    }
  }, [branchesLoaded, selectedBranchId]);

  useEffect(() => {
    const loadProducts = async () => {
      loadCountRef.current++;
      console.log(`[LOAD #${loadCountRef.current}] 🛒 เรียกโหลดสินค้าจากสาขา ${selectedBranchId}`);
      await loadProductsAction({ branchId: selectedBranchId });
      setProductsLoaded(true);
    };

    if (
      selectedBranchId &&
      !productsLoaded &&
      rawProducts.length === 0 &&
      !hasLoadedOnceRef.current
    ) {
      hasLoadedOnceRef.current = true;
      loadProducts();
    }
  }, [selectedBranchId, productsLoaded, rawProducts]);

  useEffect(() => { loadDropdownsAction?.(); }, [loadDropdownsAction]);
  // NOTE: ลบ useEffect โหลดซ้ำเมื่อ filters เปลี่ยนออก
  // เหตุผล: store จัดการ debounce และ reload เองเมื่อ setFilters* ถูกเรียกแล้ว
  // หากต้องการให้เพจเป็นคนสั่งโหลด ให้เรียก: loadProductsAction({ branchId: selectedBranchId, filters })


  if (!selectedBranchId && autoSelectTried) {
    return (
      <div className="p-4">
        <p className="text-red-500 mb-2">⚠️ ไม่สามารถระบุสาขาอัตโนมัติได้ กรุณาเลือกสาขาด้วยตนเอง:</p>
        <select
          className="border border-gray-300 rounded px-3 py-1"
          onChange={(e) => setSelectedBranchId(Number(e.target.value))}
        >
          <option value="">-- เลือกสาขา --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
    );
  }

  if (!selectedBranchId) {
    return <p className="text-red-500 mt-4">⚠️ กรุณาระบุสาขาก่อน</p>;
  }

  return (
    <div className="w-full">
      {products && products.length > 0 ? (
        <div className="flex flex-wrap gap-6 justify-start mt-4">
          {products.map((item) => (
            <ProductCardOnline key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">ไม่มีสินค้าออนไลน์</p>
      )}
    </div>
  );
};

export default ProductOnlineListPage;






