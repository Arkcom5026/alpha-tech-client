// ✅ src/features/productTemplate/pages/ListProductTemplatePage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTemplateTable from '../components/ProductTemplateTable';

import useProductTemplateStore from '../store/productTemplateStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { useBranchStore } from '@/features/branch/store/branchStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import useProductStore from '@/features/product/store/productStore';

const ListProductTemplatePage = () => {
  const { templates, fetchTemplates } = useProductTemplateStore();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const { dropdowns } = useProductStore();
  const { categories, productTypes, productProfiles } = dropdowns;

  const [filter, setFilter] = useState({ categoryId: '', productTypeId: '', productProfileId: '' });
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  // ✅ เปิดใช้งานโหลด templates ครั้งเดียวแบบ frontend filtering
  useEffect(() => {
    if (selectedBranchId) {
      fetchTemplates(selectedBranchId);
    }
  }, [fetchTemplates, selectedBranchId]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSearchTextChange = (text) => {
    setSearchInput(text);
  };

  const handleSearchCommit = (text) => {
    setSearchText(text);
  };

  const hasFilter = filter.categoryId || filter.productTypeId || filter.productProfileId || searchText;

  const filteredTemplates = hasFilter
    ? templates.filter((template) => {
        const matchCategory =
          !filter.categoryId || String(template.categoryId) === String(filter.categoryId);
        const matchProductType =
          !filter.productTypeId || String(template.productTypeId) === String(filter.productTypeId);
        const matchProductProfile =
          !filter.productProfileId || String(template.productProfileId) === String(filter.productProfileId);
        const matchSearch =
          !searchText ||
          template.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          template.barcode?.toLowerCase().includes(searchText.toLowerCase());

        return matchCategory && matchProductType && matchProductProfile && matchSearch;
      })
    : [];

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">จัดการรูปแบบสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/templates/create')} />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <CascadingFilterGroup
            value={filter}
            onChange={handleFilterChange}
            dropdowns={{
              categories,
              productTypes,
              productProfiles,
            }}
            hiddenFields={['template']}
            showReset
            searchText={searchInput}
            onSearchTextChange={handleSearchTextChange}
            onSearchCommit={handleSearchCommit}
          />
        </div>

        <ProductTemplateTable templates={filteredTemplates} />
      </div>
    </div>
  );
};

export default ListProductTemplatePage;
