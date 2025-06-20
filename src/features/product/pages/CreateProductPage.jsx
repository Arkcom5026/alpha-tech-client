// ✅ src/features/product/pages/CreateProductPage.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '../store/productStore';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const { saveProduct, uploadImages } = useProductStore();
  const [error, setError] = useState('');

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

      delete formData.unit;
      delete formData.productImages;

      const templateIdParsed = parseInt(formData.templateId);
      const unitIdParsed = formData.unitId ? parseInt(formData.unitId) : null;

      if (isNaN(templateIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
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

      const newProduct = await saveProduct({
        name: formData.name,
        description: formData.description || '',
        spec: formData.spec || '',
        warranty: formData.warranty ? parseInt(formData.warranty) : null,
        templateId: templateIdParsed,
        unitId: unitIdParsed,
        codeType: formData.codeType || 'D',
        noSN: formData.noSN ?? false,
        active: formData.active ?? true,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        images: uploadedImages,
      });

      navigate('/pos/stock/products');
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
          unitId: '',
          productProfileId: '',
          productTypeId: '',
          categoryId: '',
          codeType: 'D',
          noSN: false,
          active: true,
          cost: '',
        }}
      />
    </div>
  );
};

export default CreateProductPage;
