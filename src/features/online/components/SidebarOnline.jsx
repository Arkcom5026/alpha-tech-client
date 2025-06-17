import React, { useEffect, useState } from 'react';
import { useProductOnlineStore } from '../productOnline/store/productOnlineStore';
import CascadingFilterGroupOnline from '@/components/shared/form/CascadingFilterGroupOnline';

const SidebarOnline = () => {
  const dropdowns = useProductOnlineStore((state) => state.dropdowns);
  const loadDropdownsAction = useProductOnlineStore((state) => state.loadDropdownsAction);
  const loadProductsAction = useProductOnlineStore((state) => state.loadProductsAction);

  const [filters, setFilters] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  });

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadDropdownsAction();
  }, [loadDropdownsAction]);

  useEffect(() => {
    loadProductsAction({
      ...filters,
      searchText, // ✅ รวม text search
    });
  }, [filters, searchText, loadProductsAction]);

  return (
    <div className="space-y-2 px-2 py-2">
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="ค้นหาชื่อสินค้า..."
        className="border px-3 py-2 rounded w-full"
      />

      <CascadingFilterGroupOnline
        value={filters}
        onChange={setFilters}
        dropdowns={dropdowns || {}}
        showReset
      />
    </div>
  );
};

export default SidebarOnline;
