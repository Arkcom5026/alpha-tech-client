// ✅ src/features/productTemplate/components/ProductTemplateForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormFields from './FormFields';
import ImageManagerEnhanced from '@/components/shared/media/ImageManagerEnhanced';
import { getAllProductProfiles } from '@/features/productProfile/api/productProfileApi';

const ProductTemplateForm = ({ defaultValues = {}, onSubmit, mode, imageRef }) => {
  const [profiles, setProfiles] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ ป้องกัน submit ซ้ำ

  const formMethods = useForm({
    defaultValues: {
      name: '',
      description: '',
      unit: '',
      spec: '',
      productProfileId: '',
      warranty: '',
      noSN: false,
      codeType: 'D',
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && defaultValues?.images) {
      setOldImages(defaultValues.images);
    }
  }, [mode, defaultValues]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getAllProductProfiles();
        setProfiles(data);
      } catch (err) {
        console.error('โหลดลักษณะสินค้าล้มเหลว:', err);
      }
    };

    fetchProfiles();
  }, []);

  const handleFormSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.trace('📍 upload() ถูกเรียกจาก handleFormSubmit'); // ✅ Debug จุดเรียก upload()
      const oldIds = oldImages.map(img => img.public_id);
      const [uploadedImages, deleted] = await imageRef.current.upload();

      let newImagesOnly = [];
      if (Array.isArray(uploadedImages)) {
        newImagesOnly = uploadedImages.filter(img =>
          img?.public_id && img?.url && img?.secure_url && !oldIds.includes(img.public_id)
        );
      }

      formData.images = newImagesOnly;
      formData.imagesToDelete = deleted || [];

      console.log('📋 formData เตรียมส่ง:', formData);
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={formMethods.handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <FormFields
        register={formMethods.register}
        profiles={profiles}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <label className="font-medium md:col-span-1">รับประกัน (วัน)</label>
        <input {...formMethods.register('warranty')} className="input md:col-span-3 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white" placeholder="จำนวนวัน เช่น 365" />
      </div>

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
              setImagesToDelete(toDelete || []);
            }
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting} // ✅ ป้องกันการคลิกซ้ำ
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        {mode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกรูปแบบสินค้า'}
      </button>
    </form>
  );
};

export default ProductTemplateForm;
