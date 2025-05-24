
// ✅ src/features/category/components/CategoryTable.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CategoryDeleteDialog from './CategoryDeleteDialog';

import { deleteCategory } from '../api/categoryTypeApi';
import { useCategoryStore } from '../Store/CategoryStore';


const CategoryTable = ({ data, onEdit }) => {
  const { fetchCategories } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id);
      await fetchCategories();
      setSelectedCategory(null);
    } catch (err) {
      console.error('❌ ลบหมวดหมู่ไม่สำเร็จ:', err);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-2 border">ชื่อหมวดหมู่</th>
            <th className="px-4 py-2 border text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="px-4 py-2 border">{cat.name}</td>
              <td className="px-4 py-2 border text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(cat)}>แก้ไข</Button>
                <Button size="sm" variant="destructive" onClick={() => setSelectedCategory(cat)}>ลบ</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryDeleteDialog
        open={!!selectedCategory}
        category={selectedCategory}
        onCancel={() => setSelectedCategory(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CategoryTable;
