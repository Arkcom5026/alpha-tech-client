

// ✅ src/features/product/pages/CreateProductPage.jsx (full width)

import React, { useState, useRef, useEffect } from 'react';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '../store/productStore';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const CreateProductPage = () => {
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const { saveProduct, uploadImages, ensureDropdownsAction, dropdownsLoaded } = useProductStore();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const imageRef = useRef();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  // ✅ โหลด dropdowns จาก Store ครั้งเดียว (idempotent)
  useEffect(() => {
    ensureDropdownsAction?.();
  }, [ensureDropdownsAction]);
  // ✅ Normalize files ให้เป็น Array<File> เสมอ (กัน "e.forEach is not a function")
  // รองรับ: Array, FileList, single File/object, null/undefined
  const normalizeFiles = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    // FileList จาก input[type=file]
    if (typeof FileList !== 'undefined' && input instanceof FileList) return Array.from(input);
    return [input];
  };

  const handleCreate = async (formData) => {
    try {
      setIsProcessing(true);
      setError('');

      const payload = { ...formData, branchId };
      const created = await saveProduct(payload);

      // ✅ กัน selectedFiles เป็น FileList/object เดี่ยว แล้วทำให้ forEach พังใน flow อัปโหลด
      const filesToUpload = normalizeFiles(selectedFiles);

      if (filesToUpload.length && typeof uploadImages === 'function' && created?.id) {
        await uploadImages(created.id, { files: filesToUpload, captions, coverIndex });
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!branchId) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
        <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
        <p className="text-red-500 font-medium">กำลังโหลดข้อมูลสาขา...</p>
      </div>
    );
  }

  if (!dropdownsLoaded) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
        <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
        <p className="text-gray-600">กำลังโหลดรายการตัวเลือก (หมวด / ประเภท / ลักษณะ / รูปแบบ)...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
      <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-2">
          {error}
        </div>
      )}

      {/* ✅ Full-width layout: รูปภาพเต็มกว้างด้านบน / ฟอร์มเต็มกว้างด้านล่าง */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <ProductImage
            ref={imageRef}
            files={selectedFiles}
            setFiles={(updaterOrValue) => {
              // ✅ รองรับทั้ง setState(value) และ setState((prev) => next)
              // เพราะ ProductImage เรียก setFiles((prev)=>...) และเราต้องไม่ไป normalize ฟังก์ชันเป็นไฟล์
              if (typeof updaterOrValue === 'function') {
                setSelectedFiles((prev) => {
                  const prevArr = normalizeFiles(prev);
                  const next = updaterOrValue(prevArr);
                  return normalizeFiles(next);
                });
                return;
              }
              setSelectedFiles(normalizeFiles(updaterOrValue));
            }}
            previewUrls={previewUrls}
            setPreviewUrls={setPreviewUrls}
            captions={captions}
            setCaptions={setCaptions}
            coverIndex={coverIndex}
            setCoverIndex={setCoverIndex}
            oldImages={[]}
            setOldImages={() => {}}
          />
        </div>

        <div>
          <ProductForm
            onSubmit={handleCreate}
            mode="create"
            defaultValues={{
              name: '',
              description: '',
              spec: '',
              productTemplateId: '',
              productProfileId: '',
              productTypeId: '',
              categoryId: '',
              noSN: false,
              initialQty: '',
              active: true,
              cost: '',
            }}
          />
        </div>
      </div>

      <ProcessingDialog
        open={isProcessing || showSuccess}
        isLoading={isProcessing}
        message={isProcessing ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default CreateProductPage;




