// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import ProductPriceFields from './ProductPriceFields';

import { getProductDropdowns, getProductPrices, getProductById, getProductDropdownsByBranch } from '../api/productApi';
import useProductStore from '../store/productStore';
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

  const [localPrices, setLocalPrices] = useState([]);
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
    getValues,
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
    const loadPrices = async () => {
      try {
        if (mode === 'edit' && internalDefaults?.id) {

          const prices = await getProductPrices(internalDefaults.id);

          setLocalPrices(prices);
        }
      } catch (err) {
        console.error('❌ [Form] โหลดราคาสินค้าไม่สำเร็จ:', err);
      }
    };

    if (mode === 'edit' && internalDefaults?.id) {
      loadPrices();
    }
  }, [mode, internalDefaults?.id]);

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
    data.prices = localPrices;

    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CascadingDropdowns
            register={register}
            errors={errors}
            watch={watch}
            dropdowns={dropdowns}
            defaultValues={prepareDefaults(internalDefaults || {})}
          />
        </div>

        <div>
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
        
        <div>
          <ProductPriceFields
            localPrices={localPrices}
            setLocalPrices={setLocalPrices}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;



