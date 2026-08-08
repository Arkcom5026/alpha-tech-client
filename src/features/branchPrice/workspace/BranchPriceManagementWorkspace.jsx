import React, { useEffect, useState } from 'react';

import useBranchPriceStore from '../store/branchPriceStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import useProductStore from '@/features/product/store/productStore';
import BranchPriceEditTable from '../components/BranchPriceEditTable.jsx';
import BranchPriceReadyTable from '../components/BranchPriceReadyTable.jsx';

const BranchPriceManagementWorkspace = () => {
  const {
    allProductsWithPrice,
    loading,
    error,
    fetchAllProductsWithPriceByTokenAction,
    updateMultipleBranchPricesAction,
  } = useBranchPriceStore();

  const { dropdowns, ensureDropdownsAction } = useProductStore();

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

  const pid = (entry) => Number(entry?.product?.id ?? entry?.id);

  useEffect(() => {
    setFilteredEntries(allProductsWithPrice ?? []);
  }, [allProductsWithPrice]);

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
    setPendingList((previous) => {
      const id = Number(productId);
      const exists = previous.some((item) => pid(item) === id);
      return exists
        ? previous.map((item) => (pid(item) === id ? newEntry : item))
        : [...previous, newEntry];
    });

    setEditablePrices((previous) => {
      const next = { ...previous };
      delete next[productId];
      return next;
    });

    setFilteredEntries((previous) => previous.filter((item) => pid(item) !== Number(productId)));
  };

  const handleRemoveOne = (productId) => {
    setPendingList((previous) => previous.filter((item) => pid(item) !== Number(productId)));
  };

  const handleSaveAll = async () => {
    if (!pendingList.length) return;

    try {
      const updates = pendingList.map((item) => ({
        productId: item.product?.id || item.id,
        costPrice: item.costPrice,
        retailPrice: item.retailPrice,
        wholesalePrice: item.wholesalePrice,
        technicianPrice: item.technicianPrice,
        priceOnline: item.priceOnline,
      }));

      await updateMultipleBranchPricesAction(updates);
      setPendingList([]);
      fetchAllProductsWithPriceByTokenAction({
        categoryId: filter.categoryId || undefined,
        productTypeId: filter.productTypeId || undefined,
        brandId: filter.brandId || undefined,
        searchText: committedSearchText?.trim() || undefined,
      });
    } catch (saveError) {
      console.error('❌ Error updating prices:', saveError);
    }
  };

  return (
    <div className="p-2 max-w-screen-xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">จัดการราคาสินค้าสาขานี้</h1>

      <div className="p-2">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.35fr)]">
          <CascadingFilterGroup
            value={filter}
            onChange={(next) => {
              setFilter((previous) => ({
                ...previous,
                categoryId: next.categoryId ?? '',
                productTypeId: next.productTypeId ?? '',
              }));
            }}
            dropdowns={dropdowns}
            hiddenFields={['product']}
            showSearch
            searchText={filter.searchText}
            onSearchTextChange={(text) => setFilter((previous) => ({ ...previous, searchText: text }))}
            onSearchCommit={(text) => setCommittedSearchText(text)}
          />

          <select
            aria-label="แบรนด์สินค้า"
            value={filter.brandId}
            onChange={(event) =>
              setFilter((previous) => ({ ...previous, brandId: event.target.value }))
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
      {!loading && (allProductsWithPrice?.length ?? 0) === 0 && (
        <p className="text-gray-500">ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
      )}

      <div className="space-y-8">
        <BranchPriceEditTable
          entries={filteredEntries}
          editablePrices={editablePrices}
          setEditablePrices={setEditablePrices}
          onConfirm={handleConfirmOne}
        />

        <div>
          <h2 className="text-lg font-semibold mb-2">🔵 รายการที่พร้อมบันทึก</h2>
          <BranchPriceReadyTable readyEntries={pendingList} onRemove={handleRemoveOne} />
          <div className="flex justify-end mt-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
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

export default BranchPriceManagementWorkspace;
