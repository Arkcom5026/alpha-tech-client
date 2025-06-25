// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import _ from 'lodash';
import useProductStore from '../store/productStore';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';
import FormFields from './FormFields';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const ProductForm = ({ onSubmit, defaultValues, mode, cascadeReady, setCascadeReady }) => {
  const { dropdowns } = useProductStore();

  const [internalDefaults, setInternalDefaults] = React.useState(defaultValues || null);
  const hasReset = useRef(false);
  const prevDefaults = useRef(null);
  const [showDialog, setShowDialog] = React.useState(false);

  const prepareDefaults = (data) => {
    const branchPrice = data?.branchPrice?.[0] || data?.branchPrice || {};
    return {
      ...data,
      name: data?.name || '',
      model: data?.model || '',
      categoryId: data?.categoryId ? String(data.categoryId) : '',
      productTypeId: data?.productTypeId ? String(data.productTypeId) : '',
      productProfileId: data?.productProfileId ? String(data.productProfileId) : '',
      templateId: data?.templateId ? String(data.templateId) : '',
      branchPrice: {
        costPrice: branchPrice.costPrice ?? '',
        priceWholesale: branchPrice.priceWholesale ?? '',
        priceTechnician: branchPrice.priceTechnician ?? '',
        priceRetail: branchPrice.priceRetail ?? '',
        priceOnline: branchPrice.priceOnline ?? '',
      },
    };
  };

  const methods = useForm({ mode: 'onChange', defaultValues: {} });
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
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🟡 [${timestamp}] Check Reset Conditions →`, {
      mode,
      hasReset: hasReset.current,
      cascadeReady,
      internalDefaults,
    });

    if (
      mode === 'edit' &&
      internalDefaults?.branchPrice &&
      cascadeReady &&
      !hasReset.current
    ) {
      const prepared = prepareDefaults(internalDefaults);
      const logHeader = `📌 [${timestamp}] ProductForm reset triggered`;

      if (!_.isEqual(prepared, prevDefaults.current)) {
        reset(prepared);
        prevDefaults.current = prepared;
        hasReset.current = true;

        console.groupCollapsed(logHeader);
        console.log('✅ Reset with prepared:', prepared);
        console.log('🧩 cascadeReady:', cascadeReady);
        console.log('🧾 prevDefaults:', prevDefaults.current);
        console.log('📦 currentPrepared:', prepared);
        console.groupEnd();
      } else {
        console.log(`⚠️ [${timestamp}] Skip reset: defaultValues are identical`);
      }
    }
  }, [internalDefaults, cascadeReady]);

  useEffect(() => {
    if (mode !== 'create') return;
    const timeout = setTimeout(() => {
      const cost = parseFloat(watch('branchPrice.costPrice'));
      if (!isNaN(cost)) {
        const technician = parseFloat((cost * 1.10).toFixed(2));
        setValue('branchPrice.priceWholesale', (cost * 1.05).toFixed(2));
        setValue('branchPrice.priceTechnician', technician);
        setValue('branchPrice.priceRetail', (cost * 1.15).toFixed(2));
        setValue('branchPrice.priceOnline', technician);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [watch('branchPrice.costPrice'), mode]);

  const handleFormSubmit = async (data) => {
    setShowDialog(true);
    await onSubmit(data);
    setShowDialog(false);
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
            onCascadeReady={setCascadeReady}
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

      {showDialog && <ProcessingDialog message="กำลังบันทึกข้อมูลสินค้า..." />}
    </FormProvider>
  );
};

export default ProductForm;
