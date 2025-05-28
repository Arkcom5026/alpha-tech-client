// ✅ src/components/shared/media/ImageManagerEnhanced.jsx

import React, { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { X, Star, Trash2 } from 'lucide-react';
import { uploadAllImages } from './utils/uploadAllImages';

const ImageManagerEnhanced = forwardRef(({
  oldImages,
  setOldImages,
  previewUrls,
  setPreviewUrls,
  coverIndex,
  setCoverIndex,
  captions,
  setCaptions,
  files,  
  setFiles,
  onUploadComplete,
  uploadEndpoint = '/product-images',
}, ref) => {
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const isUploadingRef = useRef(false); // ✅ กันการอัปโหลดซ้ำ

  const handleDelete = (index) => {
    console.log('🧹 ลบภาพ index:', index);

    const isOld = index < oldImages.length;

    if (isOld) {
      const imageToRemove = oldImages[index];
      console.log('🗑️ ลบภาพเก่า:', imageToRemove);
      setImagesToDelete((prev) => [...prev, imageToRemove.public_id]);
      setOldImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const previewIndex = index - oldImages.length;
      const previewImage = previewUrls[previewIndex];
      console.log('🗑️ ลบภาพ preview:', previewImage);
      setPreviewUrls((prev) => prev.filter((_, i) => i !== previewIndex));
      setFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }

    setCaptions((prev) => {
      const updated = [...prev];
      if (index >= 0 && index < updated.length) {
        updated.splice(index, 1);
      }
      return updated;
    });

    if (coverIndex === index) {
      setCoverIndex(null);
    } else if (typeof coverIndex === 'number' && index < coverIndex) {
      setCoverIndex((i) => i - 1);
    }
  };

  const handleCaptionChange = (index, text) => {
    setCaptions((prev) => {
      const newCaptions = [...prev];
      newCaptions[index] = text;
      return newCaptions;
    });
  };

  const upload = async () => {
    console.trace('📍 upload() ถูกเรียกจาก ImageManagerEnhanced'); // ✅ ติดตาม stack trace

    if (isUploadingRef.current) {
      console.warn('⚠️ กำลังอัปโหลดอยู่ ไม่ทำซ้ำ');
      return;
    }
    isUploadingRef.current = true;

    try {
      if (files.length === 0) {
        console.log('📭 ไม่มีภาพใหม่ที่ต้องอัปโหลด');
        onUploadComplete && onUploadComplete(oldImages, imagesToDelete);
        return [oldImages, imagesToDelete];
      }

      const rawUploaded = await uploadAllImages(files, uploadEndpoint);
      console.log('📤 rawUploaded (แบบละเอียด):', JSON.stringify(rawUploaded, null, 2)); // ✅ log ตรวจสอบ secure_url
      const uploadedImages = rawUploaded.map(img => ({
        url: img.url,
        public_id: img.public_id,
        secure_url: img.secure_url || img.url, // ✅ fallback ให้ไม่ขาด secure_url
      }));
      const all = uploadedImages;
      console.log('🖼️ อัปโหลดภาพทั้งหมดสำเร็จ:', all);

      // ✅ เคลียร์ preview หลังอัปโหลดสำเร็จ
      setFiles([]);
      setPreviewUrls([]);
      setCaptions((prev) => prev.slice(0, all.length));

      onUploadComplete && onUploadComplete(all, imagesToDelete);
      return [all, imagesToDelete];
    } catch (err) {
      console.error('❌ อัปโหลดภาพล้มเหลว:', err);
      return [[], []];
    } finally {
      isUploadingRef.current = false;
    }
  };

  useImperativeHandle(ref, () => ({
    upload,
  }));

  const previewObjs = previewUrls.map((url) => ({ url }));
  const combined = [...oldImages, ...previewObjs];
  const allImages = combined.filter(
    (img, index, self) =>
      (img?.url || img) &&
      self.findIndex(o =>
        (o.public_id && img.public_id && o.public_id === img.public_id) ||
        (!o.public_id && !img.public_id && o.url === img.url)
      ) === index
  );

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
        <div key={img.public_id || img.url || index} className="relative border rounded p-2 bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-600">
          <img src={img.url || img} alt={`img-${index}`} className="w-full h-auto rounded bg-white dark:bg-zinc-800" />

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

export default ImageManagerEnhanced;
