// src/features/product/components/ProductForm.jsx

import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';
import FormFields from './FormFields';
import apiClient from '@/utils/apiClient';
import ImageManagerEnhanced from '@/components/shared/media/ImageManagerEnhanced';
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
    setValue
  } = useForm({
    defaultValues: defaultValues,
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
  const imageRef = useRef();

  const [oldImages, setOldImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);

  const categoryId = useWatch({ control, name: 'categoryId' });
  const productTypeId = useWatch({ control, name: 'productTypeId' });
  const productProfileId = useWatch({ control, name: 'productProfileId' });

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
    console.log('🟡 categoryId:', categoryId);
    console.log('🟡 productTypeId:', productTypeId);
    console.log('🟡 productProfileId:', productProfileId);
  }, [categoryId, productTypeId, productProfileId]);

  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      reset(defaultValues);
      if (defaultValues.images) {
        setOldImages(defaultValues.images);
      }
    }
  }, [mode, defaultValues, reset]);

  const onSubmit = async (data) => {
    try {
      const [uploadedImages, deleted] = await imageRef.current.upload();
      data.images = uploadedImages;
      data.imagesToDelete = deleted;

      if (mode === 'edit') {
        data.updatedByBranchId = branch.id;
        const res = await updateProduct(defaultValues.id, data);
        console.log('✅ Product updated:', res);
      } else {
        data.createdByBranchId = branch.id;
        const res = await createProduct(data);
        console.log('✅ Product created:', res);
      }

      navigate('/pos/products');
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

  console.log('✅ filteredProductTypes:', filteredProductTypes);
  console.log('✅ filteredProductProfiles:', filteredProductProfiles);
  console.log('✅ filteredTemplates:', filteredTemplates);

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

      <div className="mt-6">
        <ImageManagerEnhanced
          ref={imageRef}
          oldImages={oldImages}
          setOldImages={setOldImages}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          captions={captions}
          setCaptions={setCaptions}
          coverIndex={coverIndex}
          setCoverIndex={setCoverIndex}
          files={files}
          setFiles={setFiles}
          onUploadComplete={(all, toDelete) => {
            if (mode === 'edit') {
              setOldImages(all);
            }
          }}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
      </button>
    </form>
  );
}