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

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { useCategoryStore } from '../Store/CategoryStore';

const CategoryTable = ({ data, onEdit }) => {
  const { loadCategoriesAction } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id);
      await loadCategoriesAction();
      setSelectedCategory(null);
    } catch (err) {
      console.error('❌ ลบหมวดหมู่ไม่สำเร็จ:', err);
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[630px] border rounded-md overflow-hidden">
        <table className="min-w-full text-sm ">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 border  align-middle">ชื่อหมวดหมู่</th>
              <th className="px-4 py-2 border  align-middle">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cat) => (
              <tr key={cat.id} className="border-t  align-middle">
                <td className="px-4 py-2 border  align-middle min-w-[400px] ">{cat.name}</td>
                <td className="px-4 py-2 border text-center align-middle min-w-[230px] ">
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
