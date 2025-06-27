// 📄 ManageBranchPricePage.jsx
import React, { useEffect, useState } from 'react';

import useBranchPriceStore from '../store/branchPriceStore';

import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import useProductStore from '@/features/product/store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
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
    fetchDropdownsAction,
  } = useProductStore();

  const { selectedBranchId } = useBranchStore();

  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  });

  const [searchText, setSearchText] = useState('');
  const [committedSearchText, setCommittedSearchText] = useState('');

  const [editablePrices, setEditablePrices] = useState({});
  const [pendingList, setPendingList] = useState([]); // ⬅️ รายการที่รอการยืนยัน
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    if (selectedBranchId) {
      console.log('📌 useEffect: โหลด dropdowns สำหรับ selectedBranchId →', selectedBranchId);
      fetchDropdownsAction(selectedBranchId);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (
      selectedBranchId &&
      (filter.categoryId || filter.productTypeId || filter.productProfileId || filter.templateId || committedSearchText)
    ) {
      console.log('📌 useEffect: โหลด products ตาม filter →', {
        selectedBranchId,
        filter,
        committedSearchText,
      });
      fetchAllProductsWithPriceByTokenAction({
        categoryId: filter.categoryId || undefined,
        productTypeId: filter.productTypeId || undefined,
        productProfileId: filter.productProfileId || undefined,
        templateId: filter.templateId || undefined,
        searchText: committedSearchText?.trim() || undefined,
      });
    }
  }, [selectedBranchId, filter, committedSearchText]);

  useEffect(() => {
    const shouldReset = committedSearchText || filter.categoryId || filter.productTypeId || filter.productProfileId || filter.templateId;
    if (shouldReset) {
      console.log('📌 useEffect: ตั้งค่า filteredEntries จาก allProductsWithPrice →', allProductsWithPrice);
      setFilteredEntries(allProductsWithPrice);
    }
  }, [allProductsWithPrice]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('🔍 handleSearchKeyDown: committedSearchText =', searchText);
      setCommittedSearchText(searchText);
    }
  };

  const handleCommitChanges = () => {
    const updatedItems = Object.entries(editablePrices).map(([productId, prices]) => {
      const original = allProductsWithPrice.find((p) => p.id === parseInt(productId));
      return {
        ...original,
        ...prices,
      };
    });

    console.log('📝 handleCommitChanges: รายการที่จะเพิ่มเข้าสู่ pendingList →', updatedItems);

    setPendingList((prev) => [...prev, ...updatedItems]);
    setEditablePrices({});
  };

  const handleConfirmOne = (productId, newEntry) => {
    console.log('✅ handleConfirmOne: เพิ่มไปยัง pendingList →', newEntry);
    setPendingList((prev) => [...prev, newEntry]);

    setEditablePrices((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      console.log('🧹 handleConfirmOne: ลบ editablePrices ของ productId →', productId);
      return newState;
    });

    const filtered = filteredEntries.filter((p) => p.product?.id !== productId);
    console.log('🧹 handleConfirmOne: ลบแถวจาก filteredEntries →', filtered);
    setFilteredEntries(filtered);
  };

  const handleRemoveOne = (productId) => {
    console.log('❌ handleRemoveOne: ลบรายการออกจาก pendingList →', productId);
    setPendingList((prev) => prev.filter((item) => item.product?.id !== productId));
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

        console.log('💾 handleSaveAll: กำลังส่งข้อมูลไปอัปเดต →', updates);

        await updateMultipleBranchPricesAction(updates);
        console.log('✅ handleSaveAll: บันทึกสำเร็จ ล้าง pendingList และรีโหลด');

        setPendingList([]);
        fetchAllProductsWithPriceByTokenAction({
          categoryId: filter.categoryId || undefined,
          productTypeId: filter.productTypeId || undefined,
          productProfileId: filter.productProfileId || undefined,
          templateId: filter.templateId || undefined,
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
        <CascadingFilterGroup
          value={filter}
          onChange={setFilter}
          dropdowns={dropdowns}
        />

        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อสินค้า หรือบาร์โค้ด"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="border px-3 py-2 rounded w-full mt-4"
        />
      </div>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && allProductsWithPrice.length === 0 && (
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
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleSaveAll}
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


