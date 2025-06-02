// ✅ src/features/productProfile/components/ProductProfileForm.jsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productProfileSchema } from '../schema/productProfileSchema';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FormFields from './FormFields';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ProductProfileForm = ({ mode = 'create', defaultValues = {}, onSubmit: onSubmitProp }) => {
  const navigate = useNavigate();

  const methods = useForm({
    resolver: zodResolver(productProfileSchema),
    defaultValues: {
      name: '',
      description: '',
      productTypeId: '',
      ...defaultValues,
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (mode === 'edit' && defaultValues?.name) {
      reset({
        ...defaultValues,
        productTypeId: String(defaultValues.productTypeId || ''),
      });
    }
  }, [defaultValues, reset, mode]);

  const onSubmit = async (data) => {
    try {
      await onSubmitProp(data);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึก:', err);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl mx-auto">
        <FormFields />

        <div className="flex justify-end gap-2 pt-4 mt-6">
          <StandardActionButtons
            onCancel={() => navigate(-1)}
            submitLabel={mode === 'create' ? 'บันทึก' : 'อัปเดต'}
          />

          {/* 🔒 ปุ่ม submit สำรอง กรณี StandardActionButtons ไม่มีปุ่ม submit ภายใน */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            {mode === 'create' ? 'บันทึก' : 'อัปเดต'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductProfileForm;
