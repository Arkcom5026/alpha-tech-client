// 📄 ManageBranchPricePage.jsx
import React, { useEffect, useRef, useState } from 'react';

import useBranchPriceStore from '../store/branchPriceStore';

import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import { feedback } from '@/design-system';
import useProductStore from '@/features/product/store/productStore';
import BranchPriceEditTable from '../components/BranchPriceEditTable.jsx';
import BranchPriceReadyTable from '../components/BranchPriceReadyTable.jsx';

const ManageBranchPriceWorkspace = () => {
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
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const pid = (x) => Number(x?.product?.id ?? x?.id);

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
    if (savingRef.current) return;

    setPendingList((prev) => {
      const id = Number(productId);
      const exists = prev.some((it) => pid(it) === id);
      return exists ? prev.map((it) => (pid(it) === id ? newEntry : it)) : [...prev, newEntry];
    });

    setEditablePrices((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

    setFilteredEntries((prev) => prev.filter((p) => pid(p) !== Number(productId)));
  };

  const handleRemoveOne = (productId) => {
    if (savingRef.current) return;
    setPendingList((prev) => prev.filter((item) => pid(item) !== Number(productId)));
  };

  const handleSaveAll = async () => {
    if (pendingList.length === 0 || saving || savingRef.current) return;

    const updates = pendingList.map((item) => ({
      productId: item.product?.id || item.id,
      costPrice: item.costPrice,
      retailPrice: item.retailPrice,
      wholesalePrice: item.wholesalePrice,
      technicianPrice: item.technicianPrice,
      priceOnline: item.priceOnline,
    }));
    const refreshFilters = {
      categoryId: filter.categoryId || undefined,
      productTypeId: filter.productTypeId || undefined,
      brandId: filter.brandId || undefined,
      searchText: committedSearchText?.trim() || undefined,
    };

    savingRef.current = true;
    setSaving(true);
    try {
      await updateMultipleBranchPricesAction(updates);
      setPendingList([]);
      feedback.actionSuccess(
        'บันทึกการเปลี่ยนราคาสินค้าเรียบร้อยแล้ว',
        'branch-price:update:success',
      );

      try {
        await fetchAllProductsWithPriceByTokenAction(refreshFilters);
      } catch (refreshError) {
        feedback.actionError(
          refreshError,
          'บันทึกราคาสินค้าสำเร็จแล้ว แต่รีเฟรชรายการราคาล่าสุดไม่สำเร็จ',
          'branch-price:update:refresh:error',
        );
      }
    } catch (saveError) {
      feedback.actionError(
        saveError,
        'บันทึกการเปลี่ยนราคาสินค้าไม่สำเร็จ',
        'branch-price:update:error',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
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
              if (savingRef.current) return;
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
            onSearchTextChange={(text) => {
              if (savingRef.current) return;
              setFilter((prev) => ({ ...prev, searchText: text }));
            }}
            onSearchCommit={(text) => {
              if (savingRef.current) return;
              setCommittedSearchText(text);
            }}
          />

          <select
            aria-label="แบรนด์สินค้า"
            value={filter.brandId}
            onChange={(event) => {
              if (savingRef.current) return;
              setFilter((prev) => ({
                ...prev,
                brandId: event.target.value,
              }));
            }}
            className="h-10 rounded border px-3 text-sm"
            disabled={saving}
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
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSaveAll}
              disabled={!pendingList.length || saving}
            >
              {saving ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนราคา'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBranchPriceWorkspace;
