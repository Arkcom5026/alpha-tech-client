// ✅ src/features/productProfile/pages/ListProductProfilePage.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductProfileTable from '../components/ProductProfileTable';
import useProductProfileStore from '../store/productProfileStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import useProductStore from '@/features/product/store/productStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';

const ListProductProfilePage = () => {
  const navigate = useNavigate();
  const {
    profiles,
    fetchProfilesByCategory,
    profilesMap,
    setProfiles,
  } = useProductProfileStore();
  const { dropdowns, fetchDropdownsAction } = useProductStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductTypeId, setSelectedProductTypeId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    console.log('🔄 เรียก fetchDropdownsAction()');
    fetchDropdownsAction().then(() => {
      console.log('📥 dropdowns:', dropdowns);
    });
  }, []);

  const handleFilterChange = ({ categoryId, productTypeId }) => {
    console.log('📌 handleFilterChange:', { categoryId, productTypeId });

    let finalCategoryId = categoryId;

    if (!categoryId && productTypeId && dropdowns.productTypes?.length > 0) {
      const matched = dropdowns.productTypes.find(
        (type) => String(type.id) === String(productTypeId)
      );
      if (matched) {
        finalCategoryId = matched.categoryId;
        console.log('🔁 คำนวณ finalCategoryId จาก productTypeId:', finalCategoryId);
      }
    }

    setSelectedCategoryId(finalCategoryId);
    setSelectedProductTypeId(productTypeId);

    if (finalCategoryId) {
      if (
        typeof profilesMap === 'object' &&
        profilesMap !== null &&
        profilesMap[finalCategoryId]
      ) {
        console.log('✅ ใช้ profilesMap จาก Store:', profilesMap[finalCategoryId]);
        setProfiles(profilesMap[finalCategoryId]);
      } else {
        console.log('📡 เรียก fetchProfilesByCategory:', finalCategoryId);
        fetchProfilesByCategory(finalCategoryId);
      }
    }
  };

  const handleSearchTextChange = (text) => {
    setSearchInput(text);
  };

  const handleSearchCommit = (text) => {
    console.log('🔍 กด Enter เพื่อค้นหา:', text);
    setSearchText(text);
  };

  const filteredProfiles = useMemo(() => {
    const result = profiles?.filter((p) => {
      const matchType = selectedProductTypeId
        ? String(p.productTypeId) === String(selectedProductTypeId)
        : true;

      const matchName = searchText
        ? p.name?.toLowerCase().includes(searchText.toLowerCase())
        : true;

      return matchType && matchName;
    });

    console.log('📦 กรอง filteredProfiles:', result);
    return result;
  }, [profiles, selectedProductTypeId, searchText]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการลักษณะสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/profiles/create')} />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <CascadingFilterGroup
            value={{
              categoryId: selectedCategoryId,
              productTypeId: selectedProductTypeId,
            }}
            onChange={handleFilterChange}
            dropdowns={{
              categories: dropdowns.categories,
              productTypes: dropdowns.productTypes,
            }}
            hiddenFields={['template', 'profile', 'productProfile']}
            showReset
            searchText={searchInput}
            onSearchTextChange={handleSearchTextChange}
            onSearchCommit={handleSearchCommit}
          />
        </div>

        <ProductProfileTable profiles={filteredProfiles} onReload={() => setSearchText(searchInput)} />
      </div>
    </div>
  );
};

export default ListProductProfilePage;
