// ✅ src/features/category/pages/CreateCategoryPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import CategoryForm from '../components/CategoryForm';
import { useCategoryStore } from '../Store/CategoryStore';
import { categorySchema } from '../schema/createCategorySchema';

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { addCategory } = useCategoryStore();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data) => {
    console.log('📌 onSubmit ที่ CreateCategoryPage ถูกเรียก:', data); // ✅ Debug
    try {
      await addCategory(data); // ✅ เรียกผ่าน store ตามมาตรฐานระบบ
      navigate('/pos/stock/categories');
    } catch (err) {
      console.error('❌ สร้างหมวดหมู่ไม่สำเร็จ:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">เพิ่มหมวดหมู่สินค้า</h2>
      <CategoryForm
        form={form}
        mode="create"
        onSubmit={(data) => {
          console.log('📥 [CategoryForm] เรียก onSubmit พร้อมข้อมูล:', data); // ✅ log เพิ่มเติม
          onSubmit(data);
        }}
        onCancel={() => navigate('/pos/stock/categories')}
      />
    </div>
  );
};

export default CreateCategoryPage;
