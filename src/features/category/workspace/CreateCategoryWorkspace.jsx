import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useRef, useState } from 'react';

import { feedback } from '@/design-system';
import CategoryForm from '../components/CategoryForm';
import { categorySchema } from '../schema/createCategorySchema';
import { useCategoryStore } from '../Store/CategoryStore';

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { createAction, submitting, error } = useCategoryStore();
  const [info, setInfo] = useState('');
  const submittingRef = useRef(false);
  const listPath = `/${shopSlug || 'advancetech'}/pos/stock/categories`;

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data) => {
    if (submitting || submittingRef.current) return;

    const payload = { ...data, name: String(data?.name || '').trim() };
    const listPathSnapshot = listPath;
    if (!payload.name) return;

    submittingRef.current = true;
    try {
      const res = await createAction(payload);
      if (res?.ok) {
        feedback.actionSuccess('เพิ่มหมวดหมู่เรียบร้อยแล้ว', `category:create:${payload.name}:success`);
        navigate(listPathSnapshot);
      } else {
        const message = res?.message || 'เพิ่มหมวดหมู่ไม่สำเร็จ';
        setInfo(message);
        feedback.error(message, { eventKey: `category:create:${payload.name}:error` });
      }
    } catch (err) {
      feedback.actionError(err, 'เพิ่มหมวดหมู่ไม่สำเร็จ', `category:create:${payload.name}:error`);
    } finally {
      submittingRef.current = false;
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
        onSubmit={onSubmit}
        onCancel={() => !submitting && !submittingRef.current && navigate(listPath)}
        submitting={submitting}
      />
    </div>
  );
};

export default CreateCategoryPage;
