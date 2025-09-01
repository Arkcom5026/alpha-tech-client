// ✅ src/features/product/pages/CreateProductPage.jsx (full width)

import React, { useState, useRef } from 'react';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '../store/productStore';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const CreateProductPage = () => {
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const { saveProduct, uploadImages } = useProductStore();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const imageRef = useRef();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);

  const handleCreate = async (formData) => {
    try {
      if (!branchId) {
        setError('ไม่พบ branchId โปรดลองล็อกอินใหม่');
        return;
      }

      setIsProcessing(true);

      delete formData.unit;
      delete formData.productImages;

      const templateIdParsed = parseInt(formData.productTemplateId);
      if (isNaN(templateIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
        setIsProcessing(false);
        return;
      }

      const safeCaptions = Array.isArray(captions) ? captions : selectedFiles.map(() => '');
      const safeCoverIndex = Number.isInteger(coverIndex) ? coverIndex : 0;

      const uploadedImages = await uploadImages(
        selectedFiles,
        safeCaptions,
        safeCoverIndex
      );

      await saveProduct({
        name: formData.name,
        model: formData.model || '',
        description: formData.description || '',
        spec: formData.spec || '',
        warranty: formData.warranty ? parseInt(formData.warranty) : null,
        templateId: templateIdParsed,
        noSN: formData.noSN ?? false,
        active: formData.active ?? true,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        images: uploadedImages,
        branchPrice: {
          costPrice: Number(formData.branchPrice?.costPrice ?? 0),
          priceWholesale: Number(formData.branchPrice?.priceWholesale ?? 0),
          priceTechnician: Number(formData.branchPrice?.priceTechnician ?? 0),
          priceRetail: Number(formData.branchPrice?.priceRetail ?? 0),
          priceOnline: Number(formData.branchPrice?.priceOnline ?? 0),
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsProcessing(false);
      }, 2000);
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsProcessing(false);
    }
  };

  if (!branchId) {
    return (
      <div className="w-full px-4 lg:px-6">
        <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
        <p className="text-red-500 font-medium">กำลังโหลดข้อมูลสาขา...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 lg:px-6">
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
            setFiles={setSelectedFiles}
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
