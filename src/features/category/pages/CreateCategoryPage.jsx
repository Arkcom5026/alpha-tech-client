// ✅ src/features/category/pages/CreateCategoryPage.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import CategoryForm from '../components/CategoryForm';
import { categorySchema } from '../schema/createCategorySchema';
import { useCategoryStore } from '../Store/CategoryStore';


const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { createAction, submitting, error } = useCategoryStore();
  const [info, setInfo] = useState(''); // แสดงผลการทำงานแทน alert

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data) => {
    try {
      const res = await createAction(data); // ✅ เรียกผ่าน store ตามมาตรฐาน
      if (res?.ok) {
        setInfo('สร้างหมวดหมู่เรียบร้อย');
        navigate('/pos/stock/categories');
      } else if (res?.message) {
        setInfo(res.message);
        setTimeout(() => setInfo(''), 3500);
      }
    } catch (err) {
      console.error('❌ สร้างหมวดหมู่ไม่สำเร็จ:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 p-4">
      <h2 className="text-xl font-bold">เพิ่มหมวดหมู่สินค้า</h2>

      {(error || info) && (
        <div className={`p-3 rounded border text-sm ${error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {error || info}
        </div>
      )}

      <CategoryForm
        form={form}
        mode="create"
        onSubmit={(data) => {
          onSubmit(data);
        }}
        onCancel={() => navigate('/pos/stock/categories')}
        submitting={submitting}
      />
    </div>
  );
};

export default CreateCategoryPage;
