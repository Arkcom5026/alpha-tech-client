// ✅ src/features/productTemplate/pages/CreateProductTemplatePage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const CreateProductTemplatePage = () => {
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [error, setError] = useState('');

  const { addTemplate } = useProductTemplateStore();

  const handleCreate = async (formData) => {
    try {
      if (!selectedBranchId) {
        setError('ไม่พบสาขา กรุณาเลือกสาขาหรือเข้าสู่ระบบใหม่');
        return;
      }

      delete formData.unit;
      delete formData.templateImages;
      console.log('📋 ตรวจสอบ formData ก่อนส่ง:', formData);

      const productProfileIdParsed = parseInt(formData.productProfileId);
      const branchIdParsed = parseInt(selectedBranchId);
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

      const newTemplate = await addTemplate({
        name: formData.name,
        description: formData.description,
        spec: formData.spec,
        warranty: parseInt(formData.warranty),
        productProfileId: productProfileIdParsed,
        unitId: unitIdParsed,
        codeType: formData.codeType,
        noSN: formData.noSN,
        branchId: branchIdParsed,
      });

      if (newTemplate) {
        navigate('/pos/stock/templates');
      } else {
        setError('ไม่สามารถเพิ่มรูปแบบสินค้าได้');
      }
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">เพิ่มรูปแบบสินค้า</h2>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}
      <ProductTemplateForm onSubmit={handleCreate} mode="create" />
    </div>
  );
};

export default CreateProductTemplatePage;
