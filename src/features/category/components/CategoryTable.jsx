// ✅ src/features/category/components/CategoryTable.jsx
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { deleteCategory } from '../api/categoryApi';
import { useCategoryStore } from '../Store/CategoryStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

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
    <div className="w-full flex justify-center mt-4">
      <div className="w-[900px] border rounded-md overflow-hidden">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 border text-center align-middle">ชื่อหมวดหมู่</th>
              <th className="px-4 py-2 border text-center align-middle">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cat) => (
              <tr key={cat.id} className="border-t text-center align-middle">
                <td className="px-4 py-2 border text-center align-middle">{cat.name}</td>
                <td className="px-4 py-2 border text-center align-middle">
                  <div className="flex justify-center items-center gap-2">
                    <StandardActionButtons
                      onEdit={() => onEdit(cat)}
                      onDelete={() => setSelectedCategory(cat)}
                    />
                  </div>
                  <AlertDialog open={selectedCategory?.id === cat.id} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบหมวดหมู่</AlertDialogTitle>
                      </AlertDialogHeader>
                      <p>คุณแน่ใจว่าต้องการลบหมวดหมู่ "{selectedCategory?.name}" หรือไม่?</p>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedCategory(null)}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>ยืนยันลบ</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;
