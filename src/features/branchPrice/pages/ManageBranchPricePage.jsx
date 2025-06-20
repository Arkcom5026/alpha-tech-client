// 📄 ManageBranchPricePage.jsx
import React, { useEffect, useState } from 'react';

import BranchPriceForm from '../components/BranchPriceForm';
import useBranchPriceStore from '../store/branchPriceStore';

import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import useProductStore from '@/features/product/store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const ManageBranchPricePage = () => {
  const {
    allProductsWithPrice,
    loading,
    error,
    fetchAllProductsWithPriceByTokenAction,
  } = useBranchPriceStore();

  const {
    dropdowns,
    fetchDropdowns,
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

  useEffect(() => {
    if (selectedBranchId) {
      fetchDropdowns(selectedBranchId);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (
      selectedBranchId &&
      (filter.categoryId || filter.productTypeId || filter.productProfileId || filter.templateId || committedSearchText)
    ) {
      const transformedFilter = {
        categoryId: filter.categoryId ? Number(filter.categoryId) : undefined,
        productTypeId: filter.productTypeId ? Number(filter.productTypeId) : undefined,
        productProfileId: filter.productProfileId ? Number(filter.productProfileId) : undefined,
        templateId: filter.templateId ? Number(filter.templateId) : undefined,
        searchText: committedSearchText?.trim() || undefined,
      };

      fetchAllProductsWithPriceByTokenAction(transformedFilter);
    }
  }, [selectedBranchId, filter, committedSearchText]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setCommittedSearchText(searchText);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">จัดการราคาสินค้าสาขานี้</h1>
      <div className='p-4'>
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

      {!loading && allProductsWithPrice.length > 0 && (
        <div className="space-y-6">
          {allProductsWithPrice.map((entry) => (
            <div key={entry.product.id} className="border rounded p-4 bg-white shadow">
              <h2 className="text-lg font-medium mb-2">{`ตั้งราคาสำหรับ: ${entry.product.name}`}</h2>
              <BranchPriceForm
                productId={entry.product.id}
                defaultValues={entry.branchPrice || {}}
                rawPrices={entry.rawPrices}
                latestCostPrice={entry.latestCostPrice}
                avgCostPrice={entry.avgCostPrice}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBranchPricePage;
