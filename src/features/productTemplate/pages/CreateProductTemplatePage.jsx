// ✅ src/features/productTemplate/pages/CreateProductTemplatePage.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProductTemplate } from '../api/productTemplateApi';
import { uploadImagesTemp } from '../api/productTemplateImagesApi';
import useEmployeeStore from '@/store/employeeStore';
import ProductTemplateForm from '../components/ProductTemplateForm';
import ProductTemplateImage from '../components/ProductTemplateImage';

const CreateProductTemplatePage = () => {
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
      delete formData.templateImages;
      console.log('📋 ตรวจสอบ formData ก่อนส่ง:', formData);

      const productProfileIdParsed = parseInt(formData.productProfileId);
      const branchIdParsed = parseInt(branchId);
      const unitIdParsed = formData.unitId ? parseInt(formData.unitId) : null;

      console.log('🧩 ตรวจสอบค่าที่แปลงแล้ว:', {
        productProfileIdParsed,
        branchIdParsed,
        unitIdParsed,
      });

      if (isNaN(productProfileIdParsed) || isNaN(branchIdParsed)) {
        setError('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
        return;
      }

      const safeCaptions = Array.isArray(captions)
        ? captions
        : selectedFiles.map(() => '');
      const safeCoverIndex = Number.isInteger(coverIndex) ? coverIndex : 0;

      // ✅ อัปโหลดภาพก่อน แล้วแนบใน formData
      const uploadedImages = await uploadImagesTemp(selectedFiles, safeCaptions, safeCoverIndex);
      console.log('📤 uploadedImages (temp):', uploadedImages);

      const newTemplate = await createProductTemplate({
        name: formData.name,
        description: formData.description,
        spec: formData.spec,
        warranty: parseInt(formData.warranty),
        productProfileId: productProfileIdParsed,
        unitId: unitIdParsed,
        codeType: formData.codeType,
        noSN: formData.noSN,
        branchId: branchIdParsed,
        images: uploadedImages, // ✅ แนบรูปเข้าไปตรงนี้
        imagesToDelete: [],
      });

      navigate('/pos/stock/templates');
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">เพิ่มรูปแบบสินค้า</h2>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}

      <div className="mb-6">
        <ProductTemplateImage
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

      <ProductTemplateForm onSubmit={handleCreate} mode="create" />
    </div>
  );
};

export default CreateProductTemplatePage;
