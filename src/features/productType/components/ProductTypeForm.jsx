// ProductTypeForm.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AlertDialog from '@/components/shared/dialogs/AlertDialog';
import { useCategoryStore } from '@/features/category/Store/CategoryStore';

const schema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อประเภทสินค้า'),
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่สินค้า'),
});

const ProductTypeForm = ({ defaultValues = {}, onSubmit, mode = 'create', isSubmitting = false }) => {
  const [alert, setAlert] = useState({ open: false, title: '', description: '' });
  const { categories, fetchCategories } = useCategoryStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // โหลดหมวดหมู่สินค้าเมื่อ categories ว่าง
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().catch((error) => {
        console.error('โหลดหมวดหมู่ไม่สำเร็จ', error);
        setAlert({
          open: true,
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดหมวดหมู่สินค้าได้',
        });
      });
    }
  }, [categories.length, fetchCategories]);

  // เซตค่า default แค่ตอน defaultValues เปลี่ยนจริง พร้อมแปลง categoryId เป็น string
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      const fixedDefaults = {
        ...defaultValues,
        categoryId: String(defaultValues.categoryId ?? ''),
      };

      reset((prev) => {
        const same = JSON.stringify(prev) === JSON.stringify(fixedDefaults);
        return same ? prev : fixedDefaults;
      });
    }
  }, [defaultValues, reset]);

  const handleError = (message) => {
    setAlert({
      open: true,
      title: 'ไม่สามารถบันทึกข้อมูลได้',
      description: message,
    });
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      const msg =
        error?.response?.data?.error ??
        (typeof error?.response?.data === 'string' ? error.response.data : null) ??
        error?.message ??
        'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      handleError(msg);
    }
  };

  return (
    <>
      <AlertDialog
        open={alert.open}
        onOpenChange={(open) => setAlert((prev) => ({ ...prev, open }))}
        title={alert.title}
        description={alert.description}
      />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">ชื่อประเภทสินค้า</label>
          <input
            type="text"
            {...register('name')}
            className="w-full border rounded px-3 py-2"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1">หมวดหมู่สินค้า</label>
          <select
            {...register('categoryId')}
            className="w-full border rounded px-3 py-2"
            disabled={isSubmitting}
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {mode === 'edit' ? 'อัปเดตประเภทสินค้า' : 'เพิ่มประเภทสินค้า'}
        </button>
      </form>
    </>
  );
};

export default ProductTypeForm;
