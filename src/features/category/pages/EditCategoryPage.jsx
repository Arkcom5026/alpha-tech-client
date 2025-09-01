// ✅ src/features/category/pages/EditCategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { categorySchema } from '../schema/createCategorySchema';
import CategoryForm from '../components/CategoryForm';
import { useCategoryStore } from '../Store/CategoryStore';


const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getCategoryAction, updateAction, submitting, error } = useCategoryStore();

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState('');
  const [initial, setInitial] = useState(null);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await getCategoryAction(id);
        if (!category) throw new Error('ไม่พบหมวดหมู่');
        setInitial(category);
        form.reset({ name: category.name });
        if (category.isSystem) {
          setInfo('หมวดระบบ (ล็อก) ไม่อนุญาตให้แก้ไข');
        }
      } catch {
        navigate('/pos/stock/categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, getCategoryAction, form, navigate]);

  const onSubmit = async (data) => {
    if (initial?.isSystem) {
      setInfo('หมวดระบบ (ล็อก) ไม่อนุญาตให้แก้ไข');
      return;
    }
    const res = await updateAction(id, data);
    if (res?.ok) {
      navigate('/pos/stock/categories');
    } else if (res?.message) {
      setInfo(res.message);
      setTimeout(() => setInfo(''), 3500);
    }
  };

  if (loading) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-4 p-4">
      <h2 className="text-xl font-bold">แก้ไขหมวดหมู่สินค้า</h2>

      {(error || info) && (
        <div className={`p-3 rounded border text-sm ${error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          {error || info}
        </div>
      )}

      <CategoryForm
        form={form}
        mode="edit"
        onSubmit={onSubmit}
        onCancel={() => navigate('/pos/stock/categories')}
        submitting={submitting || !!initial?.isSystem}
      />
    </div>
  );
};

export default EditCategoryPage;
