import React, { useEffect, useState } from 'react';
import { useProductOnlineStore } from '../store/productOnlineStore';
import ProductCardOnline from '../components/ProductCardOnline';
import { useBranchStore } from '@/features/branch/store/branchStore';

const ProductOnlineListPage = () => {
  const products = useProductOnlineStore((state) => state.products);
  const loadProductsAction = useProductOnlineStore((state) => state.loadProductsAction);

  const selectedBranchId = useBranchStore((state) => state.selectedBranchId); 
  const autoDetectAndSetBranchByGeo = useBranchStore((state) => state.autoDetectAndSetBranchByGeo);
  const loadAllBranchesAction = useBranchStore((state) => state.loadAllBranchesAction);
  const setSelectedBranchId = useBranchStore((state) => state.setSelectedBranchId);
  const branches = useBranchStore((state) => state.branches);
  const [autoSelectTried, setAutoSelectTried] = useState(false);
  const [branchesLoaded, setBranchesLoaded] = useState(false);

  // ✅ STEP 1: โหลดรายชื่อสาขาทั้งหมดก่อน
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

  // ✅ STEP 2: เมื่อโหลดเสร็จแล้วและยังไม่มีสาขา → ตรวจหาจากพิกัด
  useEffect(() => {
    if (branchesLoaded && !selectedBranchId) {
      const detect = async () => {
        await autoDetectAndSetBranchByGeo();
        setAutoSelectTried(true);
      };
      detect();
    }
  }, [branchesLoaded, selectedBranchId]);

  // ✅ STEP 3: เมื่อเลือกสาขาได้แล้ว → ค่อยโหลดสินค้า
  useEffect(() => {
    if (selectedBranchId) {
      loadProductsAction({ branchId: selectedBranchId });
    }
  }, [selectedBranchId]);

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
    <div className="p-4">
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
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


