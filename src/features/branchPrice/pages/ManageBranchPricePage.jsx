// 📄 ManageBranchPricePage.jsx
import React, { useEffect, useState } from 'react';

import useBranchPriceStore from '../store/branchPriceStore';

import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import useProductStore from '@/features/product/store/productStore';
import BranchPriceEditTable from '../components/BranchPriceEditTable.jsx';
import BranchPriceReadyTable from '../components/BranchPriceReadyTable.jsx';

const ManageBranchPricePage = () => {
  const {
    allProductsWithPrice,
    loading,
    error,
    fetchAllProductsWithPriceByTokenAction,
    updateMultipleBranchPricesAction,
  } = useBranchPriceStore();

  const {
    dropdowns,
    ensureDropdownsAction,
  } = useProductStore();


  // ensure dropdowns are loaded once on mount
  useEffect(() => {
    ensureDropdownsAction();
  }, [ensureDropdownsAction]);

  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    brandId: '',
    searchText: '',
  });

  const [committedSearchText, setCommittedSearchText] = useState('');

  const [editablePrices, setEditablePrices] = useState({});
  const [pendingList, setPendingList] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);

  // ใช้ id ให้สม่ำเสมอทั้ง object ที่อาจอยู่ใต้ product หรือบน root
  const pid = (x) => Number(x?.product?.id ?? x?.id);

  useEffect(() => {
    setFilteredEntries(allProductsWithPrice ?? []);
  }, [allProductsWithPrice]);


  // (removed) ดึงครั้งแรกซ้ำกับ useEffect ด้านล่างที่ผูกกับ filter + committedSearchText

  // โหลดข้อมูลใหม่เมื่อ filter หรือ committedSearchText เปลี่ยน
  useEffect(() => {
    fetchAllProductsWithPriceByTokenAction({
      categoryId: filter.categoryId || undefined,
      productTypeId: filter.productTypeId || undefined,
      brandId: filter.brandId || undefined,
      searchText: committedSearchText?.trim() || undefined,
    });
  }, [
    filter.categoryId,
    filter.productTypeId,
    filter.brandId,
    committedSearchText,
    fetchAllProductsWithPriceByTokenAction,
  ]);

  const handleConfirmOne = (productId, newEntry) => {
    console.log('✅ handleConfirmOne: เพิ่มไปยัง pendingList →', newEntry);
    setPendingList((prev) => {
      const id = Number(productId);
      const exists = prev.some((it) => pid(it) === id);
      return exists ? prev.map((it) => (pid(it) === id ? newEntry : it)) : [...prev, newEntry];
    });

    setEditablePrices((prev) => {
      const next = { ...prev };
      delete next[productId];
      console.log('🧹 handleConfirmOne: ลบ editablePrices ของ productId →', productId);
      return next;
    });

    setFilteredEntries((prev) => prev.filter((p) => pid(p) !== Number(productId)));
  };

  const handleRemoveOne = (productId) => {
    console.log('❌ handleRemoveOne: ลบรายการออกจาก pendingList →', productId);
    setPendingList((prev) => prev.filter((item) => pid(item) !== Number(productId)));
  };

  const handleSaveAll = async () => {
    if (pendingList.length > 0) {
      try {
        const updates = pendingList.map((item) => ({
          productId: item.product?.id || item.id,
          costPrice: item.costPrice,
          retailPrice: item.retailPrice,
          wholesalePrice: item.wholesalePrice,
          technicianPrice: item.technicianPrice,
          priceOnline: item.priceOnline,
        }));

        console.log('📂 handleSaveAll: กำลังส่งข้อมูไปอัปเดต →', updates);

        await updateMultipleBranchPricesAction(updates);
        console.log('✅ handleSaveAll: บันทึกสำเร็จ ล้าง pendingList และรีโหลด');

        setPendingList([]);
        fetchAllProductsWithPriceByTokenAction({
          categoryId: filter.categoryId || undefined,
          productTypeId: filter.productTypeId || undefined,
          brandId: filter.brandId || undefined,
          searchText: committedSearchText?.trim() || undefined,
        });
      } catch (error) {
        console.error('❌ Error updating prices:', error);
      }
    }
  };

  return (
    <div className="p-2 max-w-screen-xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">จัดการราคาสินค้าสาขานี้</h1>

      <div className='p-2'>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.35fr)]">
          <CascadingFilterGroup
            value={filter}
            onChange={(next) => {
              setFilter((prev) => ({
                ...prev,
                categoryId: next.categoryId ?? '',
                productTypeId: next.productTypeId ?? '',
              }));
            }}
            dropdowns={dropdowns}
            hiddenFields={['product']}
            showSearch
            searchText={filter.searchText}
            onSearchTextChange={(text) => setFilter((prev) => ({ ...prev, searchText: text }))}
            onSearchCommit={(text) => setCommittedSearchText(text)}
          />

          <select
            aria-label="แบรนด์สินค้า"
            value={filter.brandId}
            onChange={(event) =>
              setFilter((prev) => ({
                ...prev,
                brandId: event.target.value,
              }))
            }
            className="h-10 rounded border px-3 text-sm"
          >
            <option value="">-- เลือกแบรนด์ --</option>
            {(dropdowns?.brands || []).map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && ((allProductsWithPrice?.length ?? 0) === 0) && (
        <p className="text-gray-500">ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
      )}

      <div className="space-y-8">
        <div>
          <BranchPriceEditTable
            entries={filteredEntries}
            editablePrices={editablePrices}
            setEditablePrices={setEditablePrices}
            onConfirm={handleConfirmOne}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">🔵 รายการที่พร้อมบันทึก</h2>
          <BranchPriceReadyTable
            readyEntries={pendingList}
            onRemove={handleRemoveOne}
          />
          <div className="flex justify-end mt-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSaveAll}
              disabled={!pendingList.length}
            >
              บันทึกการเปลี่ยนราคา
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBranchPricePage;



