// ✅ src/features/product/pages/CreateProductPage.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProduct } from '../api/productApi';
import { uploadImagesProduct } from '../api/productImagesApi';
import useEmployeeStore from '@/store/employeeStore';
import ProductForm from '../components/ProductForm';
import ProductImage from '../components/ProductImage';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const branchId = useEmployeeStore((state) => state.branch?.id);
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
      console.log('📋 ตรวจสอบ formData ก่อนส่ง:', formData);

      const templateIdParsed = parseInt(formData.templateId);
      const branchIdParsed = parseInt(branchId);
      const unitIdParsed = formData.unitId ? parseInt(formData.unitId) : null;

      console.log('🧩 ตรวจสอบค่าที่แปลงแล้ว:', {
        templateIdParsed,
        branchIdParsed,
        unitIdParsed,
      });

      if (isNaN(templateIdParsed) || isNaN(branchIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
        return;
      }

      const safeCaptions = Array.isArray(captions)
        ? captions
        : selectedFiles.map(() => '');
      const safeCoverIndex = Number.isInteger(coverIndex) ? coverIndex : 0;

      // ✅ อัปโหลดภาพก่อน แล้วแนบใน formData
      const uploadedImages = await uploadImagesProduct(selectedFiles, safeCaptions, safeCoverIndex);
      console.log('📤 uploadedImages (temp):', uploadedImages);

      const newProduct = await createProduct({
        name: formData.name,
        title: formData.title,
        description: formData.description,
        spec: formData.spec,
        warranty: parseInt(formData.warranty),
        templateId: templateIdParsed,
        unitId: unitIdParsed,
        codeType: formData.codeType,
        noSN: formData.noSN,
        branchId: branchIdParsed,
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        priceLevel1: parseFloat(formData.priceLevel1),
        priceLevel2: parseFloat(formData.priceLevel2),
        images: uploadedImages,
        imagesToDelete: [],
      });

      navigate('/pos/stock/products');
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

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

      <ProductForm onSubmit={handleCreate} mode="create" />
    </div>
  );
};

export default CreateProductPage;
