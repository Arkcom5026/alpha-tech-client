// ✅ src/features/category/pages/ListCategoryPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryTable from '../components/CategoryTable';
import { useCategoryStore } from '../Store/CategoryStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListCategoryPage = () => {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category) => {
    navigate(`edit/${category.id}`);
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className=" max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white">รายการหมวดหมู่สินค้า</h2>
          <StandardActionButtons onAdd={() => navigate('create')} />
        </div>

        <input
          type="text"
          placeholder="ค้นหาหมวดหมู่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded min-w-[300px] mb-4"
        />

        <CategoryTable data={filtered} onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default ListCategoryPage;
