// =============================================================================
// File: src/features/quickReceive/components/QuickReceiveSimpleForm.jsx
// =============================================================================
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import _ from 'lodash';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductSearchSimpleTable from './ProductSearchSimpleTable';
import QuickReceiveSimpleTable from './QuickReceiveSimpleTable';
import useProductStore from '@/features/product/store/productStore';

const toSelectId = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
};

const QuickReceiveSimpleForm = ({ searchText, onSearchTextChange }) => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({
    productTypeId: '',
  });

  const fetchSimpleProductsAction = useProductStore((s) => s.fetchSimpleProductsAction);
  const dropdowns = useProductStore((s) => s.dropdowns);
  const dropdownsLoaded = useProductStore((s) => s.dropdownsLoaded);
  const dropdownsLoading = useProductStore((s) => s.dropdownsLoading);
  const ensureDropdownsAction = useProductStore((s) => s.ensureDropdownsAction);
  const fetchDropdownsAction = useProductStore((s) => s.fetchDropdownsAction);
  const simpleProducts = useProductStore((s) => s.simpleProducts);

  useEffect(() => {
    const hasProductTypes = Array.isArray(dropdowns?.productTypes) && dropdowns.productTypes.length > 0;
    if (dropdownsLoaded || dropdownsLoading || hasProductTypes) return;

    const fn =
      (typeof ensureDropdownsAction === 'function' && ensureDropdownsAction) ||
      (typeof fetchDropdownsAction === 'function' && fetchDropdownsAction);

    if (fn) Promise.resolve(fn()).catch(() => {});
  }, [
    dropdownsLoaded,
    dropdownsLoading,
    dropdowns?.productTypes?.length,
    ensureDropdownsAction,
    fetchDropdownsAction,
  ]);

  const productTypes = useMemo(() => {
    const raw = dropdowns?.productTypes ?? dropdowns?.types ?? [];
    const arr = Array.isArray(raw) ? raw : [];

    const normalized = arr
      .filter((item) => item && item.id != null)
      .map((item) => ({
        ...item,
        id: Number(item.id),
        name: String(item?.name ?? '').trim(),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name);

    const unique = _.uniqBy(normalized, (item) => item.name.toLowerCase());
    return _.sortBy(unique, (item) => item.name);
  }, [dropdowns?.productTypes, dropdowns?.types]);

  const handleProductTypeChange = useCallback((event) => {
    const productTypeId = toSelectId(event.target.value);
    setFilter({ productTypeId });
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchText?.trim() && !filter.productTypeId) return;

    const params = {
      searchText: searchText?.trim() || undefined,
      activeOnly: true,
      productTypeId: filter.productTypeId !== '' ? Number(filter.productTypeId) : undefined,
    };

    fetchSimpleProductsAction(params);
  }, [searchText, filter.productTypeId, fetchSimpleProductsAction]);

  useEffect(() => {
    const hasAnyFilter = (searchText?.trim()?.length > 0) || filter.productTypeId !== '';
    if (!hasAnyFilter) return;

    const t = setTimeout(() => handleSearch(), 200);
    return () => clearTimeout(t);
  }, [handleSearch, searchText, filter.productTypeId]);

  const handleSelectProduct = (item) => {
    setItems((prev) => {
      if (prev.some((it) => it.id === item.id)) return prev;
      return [
        ...prev,
        {
          id: item.id,
          code: item.sku ?? item.code ?? '',
          name: item.name ?? '',
          model: item.model ?? '',
          category: item.category ?? '',
          productType: item.productType ?? '',
          productProfile: item.productProfile ?? '',
          productTemplate: item.productTemplate ?? '',
          qty: 1,
          costPrice: typeof item?.costPrice === 'number' ? item.costPrice : (typeof item?.lastCost === 'number' ? item.lastCost : 0),
          priceWholesale: item.priceWholesale ?? 0,
          priceTechnician: item.priceTechnician ?? 0,
          priceRetail: item.priceRetail ?? 0,
          priceOnline: item.priceOnline ?? 0,
        },
      ];
    });
  };

  const handleConfirm = () => {
    if (items.length === 0) return;
    console.log('Confirm Quick Receive Items:', items);
    // TODO: integrate API call to backend for saving quick receive items
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">ประเภทสินค้า</label>
          <select
            aria-label="ประเภทสินค้า"
            value={filter.productTypeId === '' ? '' : filter.productTypeId}
            onChange={handleProductTypeChange}
            className="border px-3 py-2 rounded w-full text-sm bg-white"
          >
            <option value="">-- เลือกประเภทสินค้า --</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="ค้นหาสินค้า..."
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          className="h-9 text-sm"
        />
        <Button className="h-9" onClick={handleSearch}>ค้นหา</Button>
      </div>

      <ProductSearchSimpleTable products={simpleProducts} onSelect={handleSelectProduct} />
      <QuickReceiveSimpleTable items={items} setItems={setItems} />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="default"
          disabled={!items?.length}
          onClick={handleConfirm}
        >
          บันทึกรับเข้า
        </Button>
      </div>
    </div>
  );
};

export default QuickReceiveSimpleForm;
