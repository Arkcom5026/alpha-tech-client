// ✅ src/features/category/components/CategoryCreateDialog.jsx
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import CategoryForm from './CategoryForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategorySchema } from '../schema/CategorySchema';
import { useCategoryStore } from '../Store/CategoryStore';
import { createCategory, updateCategory } from '../api/categoryTypeApi';

const CategoryCreateDialog = ({ open, onOpenChange, mode, defaultValues }) => {
  const form = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: defaultValues || { name: '' },
  });

  const { fetchCategories } = useCategoryStore();

  const handleSubmit = async (data) => {
    try {
      if (mode === 'create') {
        await createCategory(data);
      } else {
        await updateCategory(defaultValues.id, data);
      }
      await fetchCategories();
      form.reset();
      onOpenChange(false);
    } catch (err) {
      console.error('❌ บันทึกหมวดหมู่ไม่สำเร็จ:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>{mode === 'create' ? 'เพิ่มหมวดหมู่' : 'แก้ไขหมวดหมู่'}</DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'กรุณากรอกชื่อหมวดหมู่สินค้าใหม่'
            : 'แก้ไขชื่อหมวดหมู่สินค้าที่คุณต้องการ'}
        </DialogDescription>
        <CategoryForm
          form={form}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CategoryCreateDialog;
