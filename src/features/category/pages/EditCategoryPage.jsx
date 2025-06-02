// ✅ src/features/category/pages/EditCategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { categorySchema } from '../schema/createCategorySchema';
import { getCategoryById } from '../api/categoryApi';
import CategoryForm from '../components/CategoryForm';
import { useCategoryStore } from '../Store/CategoryStore';


const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editCategory } = useCategoryStore();
  const [loading, setLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await getCategoryById(id);
        if (!category) throw new Error('ไม่พบหมวดหมู่');
        form.reset({ name: category.name });
      } catch (err) {
        console.error('❌ โหลดข้อมูลหมวดหมู่ล้มเหลว:', err);
        navigate('/pos/stock/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, form, navigate]);

  const onSubmit = async (data) => {
    console.log('📤 onSubmit แก้ไขหมวดหมู่:', data);
    try {
      await editCategory(id, data);
      navigate('/pos/stock/categories');
    } catch (err) {
      console.error('❌ อัปเดตหมวดหมู่ไม่สำเร็จ:', err);
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">แก้ไขหมวดหมู่สินค้า</h2>
      <CategoryForm
        form={form}
        mode="edit"
        onSubmit={(data) => {
          console.log('📥 [CategoryForm] เรียก onSubmit พร้อมข้อมูล:', data);
          onSubmit(data);
        }}
        onCancel={() => navigate('/pos/stock/categories')}
      />
    </div>
  );
};

export default EditCategoryPage;
