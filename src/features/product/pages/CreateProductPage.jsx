// ✅ src/features/product/pages/CreateProductPage.jsx

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

      const templateIdParsed = parseInt(formData.templateId);

      if (isNaN(templateIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
        setIsProcessing(false);
        return;
      }

      const safeCaptions = Array.isArray(captions)
        ? captions
        : selectedFiles.map(() => '');
      const safeCoverIndex = Number.isInteger(coverIndex) ? coverIndex : 0;

      // ✅ เรียกอัปโหลดภาพผ่าน Store
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
        codeType: formData.codeType || 'D',
        noSN: formData.noSN ?? false,
        active: formData.active ?? true,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        images: uploadedImages,
        branchPrice: {
          costPrice: formData.branchPrice?.costPrice ?? 0,
          priceWholesale: formData.branchPrice?.priceWholesale ?? 0,
          priceTechnician: formData.branchPrice?.priceTechnician ?? 0,
          priceRetail: formData.branchPrice?.priceRetail ?? 0,
          priceOnline: formData.branchPrice?.priceOnline ?? 0,
        },
      });

      setIsProcessing(false);
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsProcessing(false);
    }
  };

  if (!branchId) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
        <p className="text-red-500 font-medium">กำลังโหลดข้อมูลสาขา...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">เพิ่มสินค้า</h2>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}

      <div className="mb-6">
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

      <ProductForm
        onSubmit={handleCreate}
        mode="create"
        branchId={branchId}
        defaultValues={{
          name: '',
          description: '',
          spec: '',
          warranty: '',
          templateId: '',
          productProfileId: '',
          productTypeId: '',
          categoryId: '',
          codeType: 'D',
          noSN: false,
          active: true,
          cost: '',
        }}
      />

      {isProcessing && <ProcessingDialog title="กำลังบันทึกสินค้า..." />}
    </div>
  );
};

export default CreateProductPage;
