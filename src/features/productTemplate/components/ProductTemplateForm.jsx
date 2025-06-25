// ✅ src/features/productTemplate/components/ProductTemplateForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import useProductProfileStore from '@/features/productProfile/store/productProfileStore';
import useUnitStore from '@/features/unit/store/unitStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';

const ProductTemplateForm = ({ defaultValues = {}, onSubmit, mode }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCascadeReadyTriggered, setIsCascadeReadyTriggered] = useState(false);

  const { profiles, fetchProfiles } = useProductProfileStore();
  const { units, fetchUnits } = useUnitStore();
  const { dropdowns, fetchDropdownsAction } = useProductStore();

  const formMethods = useForm({
    defaultValues: {
      name: '',
      productProfileId: '',
      categoryId: '',
      productTypeId: '',
      noSN: false,
      codeType: 'D',
      unitId: '',
      ...defaultValues,
    },
  });

  const { setValue, watch, formState: { errors }, register } = formMethods;

  useEffect(() => {
    fetchProfiles();
    fetchUnits();
    fetchDropdownsAction();
  }, []);

  useEffect(() => {
    if (
      units.length > 0 &&
      profiles.length > 0 &&
      defaultValues &&
      defaultValues.name
    ) {
      formMethods.reset({
        name: '',
        productProfileId: '',
        categoryId: '',
        productTypeId: '',
        noSN: false,
        codeType: 'D',
        unitId: '',
        ...defaultValues,
      });
    }
  }, [units, profiles, defaultValues]);

  useEffect(() => {
    const ready =
      dropdowns?.categories?.length &&
      dropdowns?.productTypes?.length &&
      dropdowns?.productProfiles?.length &&
      defaultValues?.categoryId &&
      defaultValues?.productTypeId &&
      defaultValues?.productProfileId;

    console.log('🔍 ตรวจสอบ ready:', {
      categories: dropdowns?.categories?.length,
      productTypes: dropdowns?.productTypes?.length,
      productProfiles: dropdowns?.productProfiles?.length,
      defaultCategory: defaultValues?.categoryId,
      defaultType: defaultValues?.productTypeId,
      defaultProfile: defaultValues?.productProfileId,
      isCascadeReadyTriggered,
      ready,
    });

    if (ready && !isCascadeReadyTriggered) {
      console.log('✅ เรียก handleCascadeReady แล้ว');
      handleCascadeReady({
        categoryId: defaultValues.categoryId,
        productTypeId: defaultValues.productTypeId,
        productProfileId: defaultValues.productProfileId,
      });
      setIsCascadeReadyTriggered(true);
    } else {
      console.log('🚫 cascade ยังไม่พร้อม หรือเรียกไปแล้ว');
    }
  }, [dropdowns, defaultValues, isCascadeReadyTriggered]);

  const handleCascadeReady = (cascade) => {
    console.log('📥 handleCascadeReady เรียกใช้ด้วย:', cascade);
    setValue('categoryId', cascade.categoryId || '');
    setValue('productTypeId', cascade.productTypeId || '');
    setValue('productProfileId', cascade.productProfileId || '');
  };

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

  if (
    units.length === 0 ||
    profiles.length === 0 ||
    !dropdowns ||
    !dropdowns.categories ||
    !dropdowns.productTypes ||
    !dropdowns.productProfiles
  ) {
    return <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>;
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* ⬆️ Dropdown อยู่ด้านบน */}
        <div className="grid grid-cols-1 gap-6 ">
          <CascadingDropdowns
            dropdowns={dropdowns}
            errors={errors}
            defaultValues={defaultValues}
            onCascadeReady={handleCascadeReady}
            hideTemplateDropdown={true}
          />
        </div>

        {/* ⬇️ Form ด้านล่างแบ่ง 2 คอลัมน์ */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="font-medium block mb-1">ชื่อรูปแบบสินค้า</label>
            <input
              {...register('name')}
              className="input w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
              placeholder="เช่น Asus Vivobook"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">หน่วย</label>
            <select
              {...register('unitId')}
              className="form-select w-full border px-3 py-2 rounded mb-4"
            >
              <option value="">-- เลือกหน่วยนับ --</option>
              {units.map((u) => (
                <option key={u.id} value={String(u.id)}>{u.name}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              {mode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกรูปแบบสินค้า'}
            </button>
          </div>
        </div>

        <input type="hidden" {...formMethods.register('categoryId')} />
        <input type="hidden" {...formMethods.register('productTypeId')} />
        <input type="hidden" {...formMethods.register('productProfileId')} />
      </form>
    </FormProvider>
  );
};

export default ProductTemplateForm;



