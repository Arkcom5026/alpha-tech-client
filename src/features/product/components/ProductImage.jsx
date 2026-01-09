

// ✅ src/features/product/components/ProductImage.jsx

import React, { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import useProductStore from '../store/productStore';

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

  // ✅ ต้องเรียกผ่าน Store (ห้ามเรียก API ตรง)
  const uploadImagesFull = useProductStore((s) => s.uploadImagesFull);
  const setCoverImageAction = useProductStore((s) => s.setCoverImageAction);

  useEffect(() => {
    oldImagesRef.current = oldImages;
  }, [oldImages]);

  useEffect(() => {
    // ✅ ตั้ง coverIndex จากรูปเก่าที่ isCover=true (ตอนโหลดเข้าหน้าใหม่)
    // - coverIndex ใน UI อ้างอิง allImages (old+new)
    // - ตอนเริ่มต้น preview ยังไม่มี ดังนั้น index ของ sortedOld == index ของ allImages
    if (!Array.isArray(oldImages) || oldImages.length === 0) return;
    if (Number.isInteger(coverIndex)) return; // ถ้ามีค่าอยู่แล้ว อย่าทับ

    const sortedOldLocal = [...oldImages].sort((a, b) => (b?.isCover ? 1 : 0) - (a?.isCover ? 1 : 0));
    const coverIdx = sortedOldLocal.findIndex((x) => !!x?.isCover);

    if (coverIdx >= 0) setCoverIndex(coverIdx);
    else setCoverIndex(0);
  }, [oldImages, coverIndex, setCoverIndex]);

  const handleSetCover = async (img, index) => {
    // ✅ อัปเดต UI ทันที
    setCoverIndex(index);

    // ✅ ถ้าเป็นรูปเก่า (มี id จาก DB) ต้อง persist ทันที ไม่รอปุ่มบันทึกสินค้า
    if (img?.isOld && (img?.id != null || img?.imageId != null)) {
      try {
        const imageId = img?.id ?? img?.imageId;
        const result = await setCoverImageAction({ productId, imageId });

        // ✅ ถ้า parent ใช้ oldImages จาก local state ให้ sync ให้ทันที
        if (result?.images && typeof setOldImages === 'function') {
          setOldImages(result.images);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ [ProductImage] set cover failed:', error);
      }
    }

    // ✅ ถ้าเป็นรูปใหม่ (preview) จะ persist ตอน upload() ผ่าน coverIndex ของไฟล์ใหม่
  };

  const handleDelete = (img, index) => {
    const isOld = !!img?.isOld;
    const oldCount = Array.isArray(oldImagesRef.current) ? oldImagesRef.current.length : 0;

    if (isOld) {
      // ✅ สำคัญ: UI แสดง oldImages แบบ sortedOld (cover มาก่อน) ดังนั้นห้ามอิง index กับ oldImages ตรง ๆ
      // ✅ ใช้ id เป็นตัวอ้างอิงหลัก (unique) กันเคส public_id ซ้ำ/ผิดพลาดในข้อมูล
      // ✅ ระวัง: บางที img.publicId อาจเป็น "id ใน DB" (ตัวเลข) ไม่ใช่ Cloudinary public_id
      const cloudPublicId = typeof img?.public_id === 'string'
        ? img.public_id
        : (typeof img?.publicId === 'string' ? img.publicId : null);

      const imageId = img?.id ?? img?.imageId;

      // ✅ เก็บตัวที่ใช้ลบให้ชัวร์: ใช้ imageId (DB id) เป็นหลัก
      if (imageId != null) imagesToDeleteRef.current.push(imageId);
      else if (cloudPublicId) imagesToDeleteRef.current.push(cloudPublicId);

      setOldImages((prev) => {
        if (!Array.isArray(prev)) return [];

        // ถ้ามี id ให้ลบด้วย id (ปลอดภัยสุด)
        if (imageId != null) {
          return prev.filter((x) => (x?.id ?? x?.imageId) !== imageId);
        }

        // fallback: ลบด้วย public_id
        return prev.filter((x) => {
          const xCloudPublicId = typeof x?.public_id === 'string'
            ? x.public_id
            : (typeof x?.publicId === 'string' ? x.publicId : null);
          return xCloudPublicId !== cloudPublicId;
        });
      });

      // ✅ coverIndex อ้างอิง allImages index
      if (coverIndex === index) setCoverIndex(null);
      else if (Number.isInteger(coverIndex) && index < coverIndex) setCoverIndex((i) => i - 1);

      return;
    }

    // ✅ preview images อิง fileIndex ที่เราติดไว้ตอน map
    const previewIndex = Number(img?.fileIndex);
    if (Number.isInteger(previewIndex)) {
      setPreviewUrls((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== previewIndex) : []));
      setFiles((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== previewIndex) : []));
      setCaptions((prev) => {
        const updated = Array.isArray(prev) ? [...prev] : [];
        updated.splice(previewIndex, 1);
        return updated;
      });

      // ✅ ปรับ coverIndex เมื่อมีการลบรูปใหม่
      if (coverIndex === index) {
        setCoverIndex(null);
      } else if (Number.isInteger(coverIndex)) {
        const coverIsNew = coverIndex >= oldCount;
        const deletedIsNew = index >= oldCount;
        if (coverIsNew && deletedIsNew) {
          const coverNewIdx = coverIndex - oldCount;
          if (previewIndex < coverNewIdx) setCoverIndex((i) => i - 1);
        } else if (deletedIsNew && index < coverIndex) {
          // กรณี cover อยู่หลัง index (ใน allImages) ก็เลื่อนเหมือนเดิม
          setCoverIndex((i) => i - 1);
        }
      }
    }
  };

  const handleCaptionChange = (fileIndex, text) => {
    setCaptions((prev) => {
      const updated = Array.isArray(prev) ? [...prev] : [];
      updated[fileIndex] = text;
      return updated;
    });
  };

  useImperativeHandle(ref, () => ({
    upload: async () => {
      if (isUploadingRef.current) return [[], []];
      isUploadingRef.current = true;

      try {
        // ✅ captions ต้อง align กับ files เท่านั้น (รูปใหม่)
        const safeCaptions = Array.isArray(files)
          ? files.map((_, i) => (Array.isArray(captions) ? (captions[i] ?? '') : ''))
          : [];

        // ✅ coverIndex ใน UI อ้างอิง allImages (old+new) แต่ BE ต้องการ index ของ files (รูปใหม่) เท่านั้น
        const oldCount = Array.isArray(oldImagesRef.current) ? oldImagesRef.current.length : 0;
        const safeCoverIndex = Number.isInteger(coverIndex) && coverIndex >= oldCount
          ? Math.max(0, coverIndex - oldCount)
          : 0;

        const uploadedImages = await uploadImagesFull(productId, files, safeCaptions, safeCoverIndex);


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

  const sortedOld = Array.isArray(oldImages)
    ? [...oldImages].sort((a, b) => (b?.isCover ? 1 : 0) - (a?.isCover ? 1 : 0))
    : [];

  const allImages = [
    ...sortedOld.map((img) => ({ ...img, isOld: true })),
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
   

          const urls = fileList.map((file) => URL.createObjectURL(file));
          setPreviewUrls((prev) => [...prev, ...urls]);
          setFiles((prev) => [...prev, ...fileList]);
          setCaptions((prev) => [...prev, ...fileList.map(() => '')]);
          e.target.value = null;
        }}
      />

      {allImages.map((img, index) => (
        <div key={(img?.public_id ?? img?.publicId) || `${img?.url}-${img?.fileIndex ?? index}`} className="relative border rounded p-2 bg-white dark:bg-zinc-900 border-gray-300 dark:border-gray-600">
          <img
            src={(img?.secure_url || img?.secureUrl || img?.url || '')}
            alt={img?.caption || `img-${index}`}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; }}
            className="w-full h-auto rounded bg-white dark:bg-zinc-800"
          />

          <button
            type="button"
            onClick={() => handleDelete(img, index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            title="ลบภาพนี้"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleSetCover(img, index)}
            className={`absolute bottom-1 left-1 rounded-full p-1 ${index === coverIndex ? 'bg-yellow-400 text-black' : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
            title="ตั้งเป็นภาพหน้าปก"
          >
            <Star size={16} />
          </button>

          <input
            type="text"
            placeholder="คำอธิบายภาพ"
            value={img?.isOld ? (img?.caption ?? '') : (captions[Number(img?.fileIndex)] ?? '')}
            readOnly={!!img?.isOld}
            onChange={(e) => {
              const fi = Number(img?.fileIndex);
              if (!img?.isOld && Number.isInteger(fi)) handleCaptionChange(fi, e.target.value);
            }}
            className="mt-2 w-full border rounded px-2 py-1 text-xs bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
      ))}
    </div>
  );
});

export default ProductImage;




