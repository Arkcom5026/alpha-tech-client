// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { getProductDropdowns } from '../api/productApi';
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

  const [internalDefaults, setInternalDefaults] = useState(defaultValues || null);
  const hasReset = useRef(false);
  const hasLoadedDropdowns = useRef(false);
  const prevDefaults = useRef(null);
  const hasTriggeredLoad = useRef(false);

  const prepareDefaults = (data) => {
    const branchPrice = data?.branchPrice?.[0] || data?.branchPrice || {};
    return {
      ...data,
      categoryId: data?.categoryId ? String(data.categoryId) : '',
      productTypeId: data?.productTypeId ? String(data.productTypeId) : '',
      productProfileId: data?.productProfileId ? String(data.productProfileId) : '',
      templateId: data?.templateId ? String(data.templateId) : '',
      unitId: data?.unitId !== undefined ? String(data.unitId) : '',
      branchPrice: {
        costPrice: branchPrice.costPrice ?? '',
        priceWholesale: branchPrice.priceWholesale ?? '',
        priceTechnician: branchPrice.priceTechnician ?? '',
        priceRetail: branchPrice.priceRetail ?? '',
        priceOnline: branchPrice.priceOnline ?? '',
      },
    };
  };

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
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

  useEffect(() => {
    if (hasTriggeredLoad.current) return;
    hasTriggeredLoad.current = true;

    const loadDropdowns = async () => {
      try {
        console.log('🔄 Loading dropdowns for mode:', mode);
        let data;
        if (mode === 'edit' && internalDefaults?.id) {
          const productId = String(internalDefaults.id);
          data = await getProductDropdowns(productId);
        } else {
          data = await getProductDropdowns();
        }

        setDropdowns({
          categories: data.categories || [],
          productTypes: data.productTypes || [],
          productProfiles: data.productProfiles || [],
          templates: data.templates || [],
          units: data.units || [],
        });

        hasLoadedDropdowns.current = true;

        if (
          mode === 'edit' &&
          data.defaultValues &&
          JSON.stringify(data.defaultValues) !== JSON.stringify(internalDefaults)
        ) {
          const merged = {
            ...data.defaultValues,
            branchPrice: data.defaultValues.branchPrice || internalDefaults.branchPrice,
          };

          if (JSON.stringify(merged) !== JSON.stringify(internalDefaults)) {
            setInternalDefaults(merged);
            hasReset.current = false;
          }
        }
      } catch (err) {
        console.error('❌ [Form] โหลดข้อมูล dropdowns ไม่สำเร็จ:', err);
      }
    };

    loadDropdowns();
  }, [branchId, mode, internalDefaults?.id]);

  useEffect(() => {
    if (mode === 'edit' && internalDefaults?.branchPrice && !hasReset.current) {
      const prepared = prepareDefaults(internalDefaults);
      const stringifyCurrent = JSON.stringify(prepared);
      const stringifyPrev = JSON.stringify(prevDefaults.current);

      if (stringifyCurrent !== stringifyPrev) {
        reset(prepared);
        prevDefaults.current = prepared;
        hasReset.current = true;
        console.log('✅ Reset with prepared:', prepared);
      }
    }
  }, [internalDefaults]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            defaultValues={prepareDefaults(internalDefaults || {})}
          />
        </div>

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
