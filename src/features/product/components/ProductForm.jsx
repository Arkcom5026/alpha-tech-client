// ✅ ProductForm.jsx
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useProductStore } from '../store/productStore';
import useEmployeeStore from '@/store/employeeStore';
import ImageManagerEnhanced from '@/components/shared/media/ImageManagerEnhanced';

import { useEffect, useState } from 'react';
import { createProduct, updateProduct, getProductDropdowns } from '../api/productApi';
import { createProductSchema, editProductSchema } from '../schema/createSchema';
import FormFields from './FormFields';

export default function ProductForm({ productId, defaultValues = {}, mode = 'create' }) {
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const { templates, profiles, units, categories, productTypes } = useProductStore();

  useEffect(() => {
    const fetchDropdowns = async () => {
      console.log('📦 ข้อมูล dropdown ------------------------------------------------> : fetchDropdowns');
      try {
        const res = await getProductDropdowns();
        console.log('📦 ข้อมูล dropdown ------------------------------------------------> :', res);

        const { categories, templates, profiles, units, productTypes } = res;
        useProductStore.setState({ categories, templates, profiles, units, productTypes });
        setDropdownLoading(false);
      } catch (err) {
        console.error('❌ โหลดข้อมูล dropdown ล้มเหลว:', err);
        setDropdownLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  const { branch } = useEmployeeStore();
  console.log('📌 Branch Info:', branch);

  const [oldImages, setOldImages] = useState(defaultValues.images || []);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState(defaultValues.images?.map(img => img.caption || '') || []);
  const [coverIndex, setCoverIndex] = useState(() => {
    const found = defaultValues.images?.findIndex(img => img.isCover);
    return found >= 0 ? found : null;
  });
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mode === 'edit' ? editProductSchema : createProductSchema),
    defaultValues: {
      name: defaultValues.name || '',
      code: defaultValues.code || '',
      barcode: defaultValues.barcode || '',
      price: defaultValues.price || 0,
      stock: defaultValues.stock || 0,
      productTemplateId: defaultValues.templateId || '',
      productProfileId: defaultValues.profileId || '',
      unitId: defaultValues.unitId || '',
      categoryId: defaultValues.categoryId || '',
      productTypeId: defaultValues.productTypeId || '',
      isActive: defaultValues.isActive ?? true,
    },
  });

  console.log('📌 Register Function:', register);
  console.log('📌 Control:', control);

  // ✅ useWatch เพื่อกรอง dropdown แบบสัมพันธ์กัน
  const watchCategoryId = useWatch({ control, name: 'categoryId' });
  const watchProductTypeId = useWatch({ control, name: 'productTypeId' });

  console.log('📌 watchCategoryId:', watchCategoryId);
  console.log('📌 watchProductTypeId:', watchProductTypeId);

  const filteredTypes = (useProductStore.getState().productTypes || []).filter(
    type => type.categoryId === watchCategoryId
  );
  const filteredTemplates = (templates || []).filter(
    t => t.categoryId === watchCategoryId && t.productTypeId === watchProductTypeId
  );

  const onSubmit = async (data) => {
    console.log('📤 ส่งข้อมูล:', data);
    if (!branch?.id) {
      console.error('branchId is undefined');
      return;
    }

    const allImages = [
      ...oldImages.map((img) => ({
        url: img.url,
        caption: img.caption || '',
      })),
      ...previewUrls.map((url, index) => ({
        url,
        caption: captions[oldImages.length + index] || '',
      })),
    ];

    const payload = {
      ...data,
      branchId: branch.id,
      images: allImages,
      coverIndex,
    };

    console.log('📦 Payload เต็ม:', payload);

    try {
      const result = mode === 'edit'
        ? await updateProduct(productId, payload)
        : await createProduct(payload);
      console.log('✅ บันทึกสินค้าเรียบร้อย:', result);
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึกสินค้า:', error);
    }
  };

  if (dropdownLoading) {
    return <p className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormFields
        register={register}
        errors={errors}
        categories={categories}
        productTypes={filteredTypes}
        templates={filteredTemplates}
        profiles={profiles}
        units={units}
        control={control}
      />

      <div className="bg-gray-50 dark:bg-zinc-800 rounded-md p-4 shadow-sm">
        <ImageManagerEnhanced
          title="รูปภาพสินค้า"
          oldImages={oldImages}
          setOldImages={setOldImages}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          captions={captions}
          setCaptions={setCaptions}
          coverIndex={coverIndex}
          setCoverIndex={setCoverIndex}
          setFiles={setFiles}
        />
      </div>

      <div className="text-right">
        <button type="submit" className="btn btn-primary px-6 py-2 text-base">
          {mode === 'edit' ? '💾 แก้ไขสินค้า' : '➕ เพิ่มสินค้า'}
        </button>
      </div>
    </form>
  );
}
