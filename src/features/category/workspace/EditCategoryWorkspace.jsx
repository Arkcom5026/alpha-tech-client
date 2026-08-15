import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { feedback } from '@/design-system';
import { categorySchema } from '../schema/createCategorySchema';
import CategoryForm from '../components/CategoryForm';
import { useCategoryStore } from '../Store/CategoryStore';

const EditCategoryPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const listPath = `/${shopSlug || 'advancetech'}/pos/stock/categories`;

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
      } catch (loadError) {
        feedback.actionError(loadError, 'โหลดข้อมูลหมวดหมู่ไม่สำเร็จ', 'category:edit:load:error');
        navigate(listPath);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, getCategoryAction, form, navigate, listPath]);

  const onSubmit = async (data) => {
    if (initial?.isSystem) {
      const message = 'หมวดระบบ (ล็อก) ไม่อนุญาตให้แก้ไข';
      setInfo(message);
      feedback.warning(message, { eventKey: 'category:update:locked' });
      return;
    }
    if (submitting) return;

    try {
      const res = await updateAction(id, data);
      if (res?.ok) {
        feedback.actionSuccess('บันทึกการแก้ไขหมวดหมู่เรียบร้อยแล้ว', 'category:update:success');
        navigate(listPath);
      } else {
        const message = res?.message || 'บันทึกการแก้ไขหมวดหมู่ไม่สำเร็จ';
        setInfo(message);
        feedback.error(message, { eventKey: 'category:update:error' });
      }
    } catch (updateError) {
      feedback.actionError(updateError, 'บันทึกการแก้ไขหมวดหมู่ไม่สำเร็จ', 'category:update:error');
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
        onCancel={() => !submitting && navigate(listPath)}
        submitting={submitting || !!initial?.isSystem}
      />
    </div>
  );
};

export default EditCategoryPage;
