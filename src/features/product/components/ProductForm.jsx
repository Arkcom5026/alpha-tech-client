// ✅ src/features/product/components/ProductForm.jsx
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormFields from './FormFields';
import { getAllProducts, getProductDropdowns } from '@/features/product/api/productApi';
import { fetchUnits } from '@/features/unit/api/unitApi';

const ProductForm = ({ defaultValues = {}, onSubmit, mode, branchId }) => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productProfiles, setProductProfiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formMethods = useForm({
    defaultValues: {
      title: '',
      description: '',
      unitId: '',
      spec: '',
      cost: '',
      sold: 0,
      quantity: '',
      warranty: '',
      codeType: 'D',
      active: true,
      templateId: '',
      noSN: false,
      ...defaultValues,
    },
  });

  const { register } = formMethods;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!branchId) return;

      try {
        const dataProducts = await getAllProducts(branchId);
        const dataUnits = await fetchUnits();
        const dropdownData = await getProductDropdowns(branchId);

        setTemplates(dropdownData.templates || []);
        setProductTypes(dropdownData.productTypes || []);
        setProductProfiles(dropdownData.productProfiles || []);
        setCategories(dropdownData.categories || []);
        setUnits(dropdownData.units || []);

        setProducts(dataProducts);
      } catch (err) {
        console.error('โหลดข้อมูลล้มเหลว:', err);
      }
    };

    fetchProducts();
  }, [branchId]);

  useEffect(() => {
    console.log('🔍 defaultValues (raw):', defaultValues);

    formMethods.reset({
      ...formMethods.getValues(),
      ...defaultValues,
    });

    if (
      defaultValues.categoryId &&
      defaultValues.productTypeId &&
      defaultValues.productProfileId &&
      defaultValues.templateId
    ) {
      console.log('🔁 extracted values for reset:', {
        categoryId: defaultValues.categoryId,
        productTypeId: defaultValues.productTypeId,
        productProfileId: defaultValues.productProfileId,
        templateId: defaultValues.templateId,
      });

      formMethods.setValue('categoryId', String(defaultValues.categoryId || ''));
      formMethods.setValue('productTypeId', String(defaultValues.productTypeId || ''));
      formMethods.setValue('productProfileId', String(defaultValues.productProfileId || ''));
      formMethods.setValue('templateId', String(defaultValues.templateId || ''));
    } else {
      console.warn('⚠️ productTypeId ไม่ตรง categoryId → reset cascade Error');
    }
  }, [defaultValues]);

  const handleFormSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.log('📋 formData เตรียมส่ง:', formData);
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!branchId) return <p>⛔ ไม่พบ branchId</p>;
  if (units.length === 0 || products.length === 0) {
    return <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>;
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormFields
          register={formMethods.register}
          errors={formMethods.formState.errors}
          control={formMethods.control}
          setValue={formMethods.setValue}
          products={products}
          dropdowns={{
            units: units || [],
            templates: templates || [],
            productTypes: productTypes || [],
            categories: categories || [],
            productProfiles: productProfiles || [],
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="font-medium md:col-span-1">รับประกัน (วัน)</label>
          <input {...register('warranty')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="จำนวนวัน เช่น 365" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {mode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกรูปแบบสินค้า'}
        </button>
      </form>
    </FormProvider>
  );
};

export default ProductForm;
