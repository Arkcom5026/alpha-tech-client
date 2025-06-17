// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { getProductDropdowns, getProductDropdownsByBranch } from '../api/productApi';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';
import FormFields from './FormFields';

const ProductForm = ({ onSubmit, defaultValues, mode, branchId }) => {
  const [dropdowns, setDropdowns] = useState({
    categories: [],
    productTypes: [],
    productProfiles: [],
    templates: [],
    units: [],
  });


  const [loadedOnce, setLoadedOnce] = useState(false);
  const [formSynced, setFormSynced] = useState(false);
  const [internalDefaults, setInternalDefaults] = useState(defaultValues || null);

  const methods = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    control,
    setValue,
    watch,
    reset,
  } = methods;

  const prepareDefaults = (data) => ({
    ...data,
    categoryId: data?.categoryId ? String(data.categoryId) : '',
    productTypeId: data?.productTypeId ? String(data.productTypeId) : '',
    productProfileId: data?.productProfileId ? String(data.productProfileId) : '',
    templateId: data?.templateId ? String(data.templateId) : '',
  });

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        let data;
        if (mode === 'edit' && internalDefaults?.id) {
          const productId = String(internalDefaults.id);
          data = await getProductDropdowns(productId);
        } else if (branchId) {
          data = await getProductDropdownsByBranch(branchId);
        }

        setDropdowns({
          categories: data.categories || [],
          productTypes: data.productTypes || [],
          productProfiles: data.productProfiles || [],
          templates: data.templates || [],
          units: data.units || [],
        });
        setInternalDefaults(data.defaultValues || null);
      } catch (err) {
        console.error('❌ [Form] โหลดข้อมูล dropdowns ไม่สำเร็จ:', err);
      }
    };

    if (!loadedOnce && branchId && (mode !== 'edit' || internalDefaults?.id)) {
      loadDropdowns();
      setLoadedOnce(true);
    }
  }, [branchId, mode, internalDefaults?.id, loadedOnce]);

  
  useEffect(() => {
    const readyToSync =
      dropdowns.categories.length > 0 &&
      dropdowns.productTypes.length > 0 &&
      dropdowns.productProfiles.length > 0 &&
      dropdowns.templates.length > 0 &&
      dropdowns.units.length > 0;

    if (mode === 'edit' && internalDefaults && readyToSync && !formSynced) {
      reset(prepareDefaults(internalDefaults));
      setFormSynced(true);
    }
  }, [mode, internalDefaults, dropdowns, formSynced, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 🔹 Form กลุ่มข้อมูลหลัก */}
        <div className="grid grid-cols-2 gap-6">
          <CascadingDropdowns
            register={register}
            errors={errors}
            watch={watch}
            dropdowns={dropdowns}
            defaultValues={prepareDefaults(internalDefaults || {})}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FormFields
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            dropdowns={dropdowns}
            isEditMode={mode === 'edit'}
            defaultValues={internalDefaults}
          />
        </div>

        {/* 🔹 ปุ่มบันทึก */}
        <div className="flex justify-end border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;