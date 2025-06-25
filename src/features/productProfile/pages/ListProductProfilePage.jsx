// ✅ src/features/productProfile/pages/ListProductProfilePage.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductProfileTable from '../components/ProductProfileTable';
import useProductProfileStore from '../store/productProfileStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import useProductStore from '@/features/product/store/productStore';

const ListProductProfilePage = () => {
  const navigate = useNavigate();
  const { profiles, fetchProfilesByCategory } = useProductProfileStore();
  const { dropdowns, fetchDropdownsAction } = useProductStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductTypeId, setSelectedProductTypeId] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchDropdownsAction();
  }, []);

  const handleSearch = () => {
    if (selectedCategoryId) {
      fetchProfilesByCategory(selectedCategoryId);
    }
  };

  // ✅ กรองข้อมูล profiles จากประเภทสินค้า + ค้นหาด้วยชื่อ
  const filteredProfiles = useMemo(() => {
    return profiles?.filter((p) => {
      const matchType = selectedProductTypeId
        ? String(p.productTypeId) === String(selectedProductTypeId)
        : true;

      const matchName = searchName
        ? p.name?.toLowerCase().includes(searchName.toLowerCase())
        : true;

      return matchType && matchName;
    });
  }, [profiles, selectedProductTypeId, searchName]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการลักษณะสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/profiles/create')} />
        </div>

        {/* ✅ Dropdown หมวดหมู่สินค้า และ ประเภทสินค้า */}
        <div className="flex items-center gap-4 mb-4">
          <select
            className="border px-3 py-2 rounded"
            value={selectedCategoryId}
            onChange={(e) => {
              const categoryId = e.target.value;
              setSelectedCategoryId(categoryId);
              setSelectedProductTypeId('');
              if (categoryId) {
                fetchProfilesByCategory(categoryId);
              }
            }}
          >
            <option value="">-- เลือกหมวดหมู่สินค้า --</option>
            {dropdowns.categories?.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded"
            value={selectedProductTypeId}
            onChange={(e) => setSelectedProductTypeId(e.target.value)}
            disabled={!selectedCategoryId}
          >
            <option value="">-- เลือกประเภทสินค้า --</option>
            {dropdowns.productTypes
              ?.filter(pt => String(pt.categoryId) === String(selectedCategoryId))
              ?.map(pt => (
                <option key={pt.id} value={String(pt.id)}>{pt.name}</option>
              ))}
          </select>

          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อสินค้า"
            className="border px-3 py-2 rounded w-64"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ค้นหา
          </button>
        </div>

        <ProductProfileTable profiles={filteredProfiles} onReload={() => handleSearch()} />
      </div>
    </div>
  );
};

export default ListProductProfilePage;
