// src/features/product/components/ProductForm.jsx

import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import FormFields from './FormFields';
import apiClient from '@/utils/apiClient';
import { createProduct, updateProduct } from '../api/productApi';
import { useNavigate } from 'react-router-dom';
import useEmployeeStore from '@/store/employeeStore';

export default function ProductForm({ mode = 'create', defaultValues = {} }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    setValue,
  } = useForm({
    defaultValues,
  });

  const navigate = useNavigate();
  const branch = useEmployeeStore((state) => state.branch);

  const [dropdowns, setDropdowns] = useState({
    templates: [],
    units: [],
    categories: [],
    productTypes: [],
    productProfiles: [],
  });

  const [loading, setLoading] = useState(true);
  const [dropdownsReady, setDropdownsReady] = useState(false);

  const categoryId = useWatch({ control, name: 'categoryId' });
  const productTypeId = useWatch({ control, name: 'productTypeId' });
  const productProfileId = useWatch({ control, name: 'productProfileId' });
  const templateId = useWatch({ control, name: 'templateId' });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await apiClient.get('/products/dropdowns');
        setDropdowns({
          templates: res.data.templates || [],
          units: res.data.units || [],
          categories: res.data.categories || [],
          productTypes: res.data.productTypes || [],
          productProfiles: res.data.productProfiles || [],
        });
        setDropdownsReady(true);
        console.log('📦 dropdowns loaded:', res.data);
      } catch (err) {
        console.error('❌ Failed to load dropdowns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && defaultValues && dropdownsReady) {
      console.log('🔍 defaultValues (raw):', defaultValues);
      const extracted = {
        ...defaultValues,
        priceLevel1: defaultValues.prices?.find(p => p.level === 1)?.price || '',
        priceLevel2: defaultValues.prices?.find(p => p.level === 2)?.price || '',
        templateId: defaultValues.template?.id,
        productProfileId: defaultValues.template?.productProfile?.id,
        productTypeId: defaultValues.template?.productProfile?.productType?.id,
        categoryId: defaultValues.template?.productProfile?.productType?.categoryId,
      };

      const typeMatch = dropdowns.productTypes.some(
        (p) => p.id === extracted.productTypeId && p.categoryId === extracted.categoryId
      );

      if (!typeMatch) {
        extracted.productTypeId = '';
        extracted.productProfileId = '';
        extracted.templateId = '';
      }

      reset(extracted);
    }
  }, [mode, defaultValues, reset, dropdownsReady, dropdowns]);

  useEffect(() => {
    if (!categoryId || dropdowns.productTypes.length === 0) return;
    const validProductTypes = dropdowns.productTypes.filter(p => p.categoryId === Number(categoryId));
    const validProductTypeIds = validProductTypes.map(p => p.id);
    if (!validProductTypeIds.includes(Number(productTypeId))) {
      setValue('productTypeId', '');
      setValue('productProfileId', '');
      setValue('templateId', '');
    }
  }, [categoryId, dropdowns.productTypes, productTypeId, setValue]);

  useEffect(() => {
    if (!productTypeId || dropdowns.productProfiles.length === 0) return;
    const validProfiles = dropdowns.productProfiles.filter(p => p.productTypeId === Number(productTypeId));
    const validProfileIds = validProfiles.map(p => p.id);
    if (!validProfileIds.includes(Number(productProfileId))) {
      setValue('productProfileId', '');
      setValue('templateId', '');
    }
  }, [productTypeId, dropdowns.productProfiles, productProfileId, setValue]);

  const onSubmit = async (data) => {
    try {

      if (mode === 'edit') {
        data.updatedByBranchId = branch.id;
        const res = await updateProduct(defaultValues.id, data);
        console.log('✅ Product updated:', res);
      } else {
        data.branchId = branch.id;
        const res = await createProduct(data);
        console.log('✅ Product created:', res);
      }
      navigate('/pos/stock/products');
    } catch (err) {
      console.error('❌ submit error:', err);
    }
  };

  const filteredProductTypes = dropdowns.productTypes.filter(
    (type) => type.categoryId === Number(categoryId)
  );

  const filteredProductProfiles = dropdowns.productProfiles.filter(
    (profile) => profile.productTypeId === Number(productTypeId)
  );

  const filteredTemplates = dropdowns.templates.filter(
    (template) => template.productProfileId === Number(productProfileId)
  );

  useEffect(() => {
    if (filteredProductProfiles.length === 0) return;
    const validIds = filteredProductProfiles.map(p => String(p.id));
    if (!validIds.includes(String(productProfileId))) {
      setValue('productProfileId', '');
      setValue('templateId', '');
    }
  }, [filteredProductProfiles, productProfileId, setValue]);

  useEffect(() => {
    if (filteredTemplates.length === 0) return;
    const validIds = filteredTemplates.map(t => String(t.id));
    if (!validIds.includes(String(templateId))) {
      setValue('templateId', '');
    }
  }, [filteredTemplates, templateId, setValue]);

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormFields
        register={register}
        errors={errors}
        control={control}
        setValue={setValue}
        isEditMode={mode === 'edit'}
        dropdowns={{
          ...dropdowns,
          filteredProductTypes,
          filteredProductProfiles,
          filteredTemplates,
        }}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
      </button>
    </form>
  );
}
