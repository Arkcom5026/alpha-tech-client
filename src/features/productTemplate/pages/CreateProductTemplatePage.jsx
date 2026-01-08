// ✅ src/features/productTemplate/pages/CreateProductTemplatePage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProductTemplateForm from '../components/ProductTemplateForm';
import useProductTemplateStore from '../store/productTemplateStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const CreateProductTemplatePage = () => {
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      setIsSubmitting(true);

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
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/pos/stock/templates');
        }, 2000);
      } else {
        setError('ไม่สามารถเพิ่มสเปกสินค้า (SKU) ได้');
      }
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold">เพิ่มสเปกสินค้า (SKU)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          สเปกสินค้า (SKU) = ตัวเลือกย่อยของรุ่นที่แยกราคา/สต๊อก เช่น 4GB/64GB, 4GB/128GB
        </p>
      </div>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}
      <ProductTemplateForm onSubmit={handleCreate} mode="create" />

      <ProcessingDialog
        open={isSubmitting || showSuccess}
        isLoading={isSubmitting}
        message={isSubmitting ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...' : '✅ บันทึกสเปกสินค้า (SKU) เรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default CreateProductTemplatePage;


