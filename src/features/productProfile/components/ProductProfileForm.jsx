// ✅ src/features/productProfile/components/ProductProfileForm.jsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productProfileSchema } from '../schema/productProfileSchema';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FormFields from './FormFields';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import useProductStore from '@/features/product/store/productStore';

const ProductProfileForm = ({ mode = 'create', defaultValues = {}, onSubmit: onSubmitProp }) => {
  const navigate = useNavigate();
  const { dropdowns = {}, dropdownsLoaded } = useProductStore();
  const [categoryId, setCategoryId] = useState('');

  const methods = useForm({
    resolver: zodResolver(productProfileSchema),
    defaultValues: {
      name: '',
      description: '',
      productTypeId: '',
      ...defaultValues,
    },
  });

  const { handleSubmit, reset, watch, setValue } = methods;

  useEffect(() => {
    if (!dropdownsLoaded) {
      console.log('[FETCH] ดึง dropdowns เพราะ dropdownsLoaded = false');
      useProductStore.getState().fetchDropdownsAction?.();
    } else {
      console.log('[SKIP] dropdownsLoaded = true (มี productTypes แล้ว)', dropdowns.productTypes);
    }
  }, []);

  useEffect(() => {
    console.log('[CHECK defaultValues]', defaultValues);
    console.log('[CHECK dropdowns]', dropdowns);

    if (
      mode === 'edit' &&
      defaultValues?.name &&
      dropdowns.productTypes?.length > 0 &&
      dropdowns.categories?.length > 0
    ) {
      const resolvedCategoryId = defaultValues.productType?.categoryId;
      console.log('[SET categoryId resolved]', resolvedCategoryId);
      setCategoryId(String(resolvedCategoryId || ''));
      reset({
        ...defaultValues,
        productTypeId: String(defaultValues.productTypeId || ''),
      });
    }
  }, [defaultValues, dropdowns, mode, reset]);

  const filteredProductTypes = (dropdowns?.productTypes || []).filter(
    (pt) => String(pt.categoryId) === String(categoryId)
  );

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
        {/* ✅ หมวดหมู่สินค้า */}
        <div>
          <label className="block mb-1 font-medium">หมวดหมู่สินค้า</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setValue('productTypeId', '');
              console.log('[SELECT categoryId]', e.target.value);
            }}
          >
            <option value="">-- เลือกหมวดหมู่สินค้า --</option>
            {dropdowns.categories?.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* ✅ ประเภทสินค้า */}
        <div>
          <label className="block mb-1 font-medium">ประเภทสินค้า</label>
          <select
            {...methods.register('productTypeId')}
            className="w-full border rounded px-3 py-2"
            disabled={!categoryId}
          >
            <option value="">-- เลือกประเภทสินค้า --</option>
            {filteredProductTypes.map((pt) => (
              <option key={pt.id} value={String(pt.id)}>{pt.name}</option>
            ))}
          </select>
        </div>

        <FormFields />

        <div className="flex justify-end gap-2 pt-4 mt-6">
          <StandardActionButtons
            onCancel={() => navigate(-1)}
            submitLabel={mode === 'create' ? 'บันทึก' : 'อัปเดต'}
          />
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
