// ✅ src/features/product/components/ProductImage.jsx

import React, { useImperativeHandle, forwardRef, useState, useRef, useEffect } from 'react';
import { X, Star, Trash2 } from 'lucide-react';
import { uploadImagesProductFull } from '../api/productImagesApi';

const ProductImage = forwardRef(({
  oldImages = [],
  setOldImages,
  previewUrls = [],
  setPreviewUrls,
  coverIndex,
  setCoverIndex,
  captions = [],
  setCaptions,
  files = [],
  setFiles,
  onUploadComplete,
  productId,
}, ref) => {
  const imagesToDeleteRef = useRef([]);
  const isUploadingRef = useRef(false);
  const oldImagesRef = useRef([]);

  useEffect(() => {
    oldImagesRef.current = oldImages;
  }, [oldImages]);

  const handleDelete = (index) => {
    console.log('🗑️ [Frontend] ผู้ใช้กดลบภาพ index:', index);
    const isOld = index < oldImages.length;

    if (isOld) {
      const imageToRemove = oldImages[index];
      imagesToDeleteRef.current.push(imageToRemove.public_id);
      setOldImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const previewIndex = index - oldImages.length;
      setPreviewUrls((prev) => prev.filter((_, i) => i !== previewIndex));
      setFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }

    setCaptions((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (coverIndex === index) setCoverIndex(null);
    else if (index < coverIndex) setCoverIndex((i) => i - 1);
  };

  const handleCaptionChange = (index, text) => {
    setCaptions((prev) => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  };

  useImperativeHandle(ref, () => ({
    upload: async () => {
      if (isUploadingRef.current) return [[], []];
      isUploadingRef.current = true;

      try {
        const safeCaptions = Array.isArray(captions) ? captions : files.map(() => '');
        const safeCoverIndex = Number.isInteger(coverIndex) ? coverIndex : 0;

        const uploadedImages = await uploadImagesProductFull(files, safeCaptions, safeCoverIndex);
        console.log('📤 uploadImagesProductFull result:', uploadedImages);

        if (typeof onUploadComplete === 'function') {
          onUploadComplete(uploadedImages);
        }

        return [uploadedImages, imagesToDeleteRef.current];
      } catch (error) {
        console.error('❌ [ProductImage] upload() error:', error);
        return [[], imagesToDeleteRef.current];
      } finally {
        isUploadingRef.current = false;
      }
    },
  }));

  const allImages = [
    ...(Array.isArray(oldImages) ? oldImages.map((img) => ({ ...img, isOld: true })) : []),
    ...(Array.isArray(previewUrls) ? previewUrls.map((url, i) => ({ url, isOld: false, fileIndex: i })) : [])
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <input
        type="file"
        multiple
        className="col-span-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-black dark:text-white rounded px-3 py-2"
        onChange={(e) => {
          const fileList = Array.from(e.target.files);
          console.log('📥 เลือกรูปภาพใหม่:', fileList);

          const urls = fileList.map((file) => URL.createObjectURL(file));
          setPreviewUrls((prev) => [...prev, ...urls]);
          setFiles((prev) => [...prev, ...fileList]);
          setCaptions((prev) => [...prev, ...fileList.map(() => '')]);
          e.target.value = null;
        }}
      />

      {allImages.map((img, index) => (
        <div key={index} className="relative border rounded p-2 bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-600">
          <img
            src={img.url}
            alt={`img-${index}`}
            className="w-full h-auto rounded bg-white dark:bg-zinc-800"
          />

          <button
            type="button"
            onClick={() => handleDelete(index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            title="ลบภาพนี้"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => setCoverIndex(index)}
            className={`absolute bottom-1 left-1 rounded-full p-1 ${index === coverIndex ? 'bg-yellow-400 text-black' : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
            title="ตั้งเป็นภาพหน้าปก"
          >
            <Star size={16} />
          </button>

          <input
            type="text"
            placeholder="คำอธิบายภาพ"
            value={captions[index] || ''}
            onChange={(e) => handleCaptionChange(index, e.target.value)}
            className="mt-2 w-full border rounded px-2 py-1 text-xs bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
      ))}
    </div>
  );
});

export default ProductImage;
