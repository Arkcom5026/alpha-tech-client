import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productProfileSchema } from '../schema/productProfileSchema';
import { createProductProfile } from '../api/productProfileApi';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FormFields from './FormFields';

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
      if (mode === 'create') {
        await createProductProfile(data);
        navigate('/pos/stock/profiles');
      } else {
        await onSubmitProp(data);
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึก:', err);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormFields />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {mode === 'create' ? 'บันทึก' : 'อัปเดต'}
        </button>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← กลับไปหน้ารายการรูปแบบสินค้า
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductProfileForm;
