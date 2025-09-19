// =============================================================================
// File: src/features/quickReceive/components/QuickReceiveSimpleForm.jsx
// =============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import ProductSearchSimpleTable from './ProductSearchSimpleTable';
import QuickReceiveSimpleTable from './QuickReceiveSimpleTable';
import useProductStore from '@/features/product/store/productStore';

const QuickReceiveSimpleForm = ({ searchText, onSearchTextChange }) => {
  const [items, setItems] = useState([]);

  // cascading filters (category → type → profile → template)
  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    productTemplateId: '',
  });

  // product store selectors
  const fetchSimpleProductsAction = useProductStore((s) => s.fetchSimpleProductsAction);
  const dropdowns = useProductStore((s) => s.dropdowns);
  const ensureDropdownsAction = useProductStore((s) => s.ensureDropdownsAction);
  const simpleProducts = useProductStore((s) => s.simpleProducts);

  // ensure dropdowns loaded once
  useEffect(() => {
    if (typeof ensureDropdownsAction === 'function') {
      ensureDropdownsAction();
    }
  }, [ensureDropdownsAction]);

  const handleSearch = useCallback(() => {
    if (
      !searchText?.trim() &&
      !filter.categoryId &&
      !filter.productTypeId &&
      !filter.productProfileId &&
      !filter.productTemplateId
    ) {
      return;
    }

    const params = {
      searchText: searchText?.trim() || undefined,
      activeOnly: true,
      categoryId: filter.categoryId !== '' ? Number(filter.categoryId) : undefined,
      productTypeId: filter.productTypeId !== '' ? Number(filter.productTypeId) : undefined,
      productProfileId: filter.productProfileId !== '' ? Number(filter.productProfileId) : undefined,
      productTemplateId: filter.productTemplateId !== '' ? Number(filter.productTemplateId) : undefined,
    };
    fetchSimpleProductsAction(params);
  }, [searchText, filter, fetchSimpleProductsAction]);

  // auto-search when filter or searchText changes (debounced)
  useEffect(() => {
    const hasAnyFilter = (searchText?.trim()?.length > 0)
      || filter.categoryId !== ''
      || filter.productTypeId !== ''
      || filter.productProfileId !== ''
      || filter.productTemplateId !== '';
    if (!hasAnyFilter) return;
    const t = setTimeout(() => handleSearch(), 200);
    return () => clearTimeout(t);
  }, [handleSearch, searchText, filter]);

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
      <CascadingFilterGroup value={filter} onChange={setFilter} dropdowns={dropdowns} />
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
