// ✅ src/features/productTemplate/pages/CreateProductTemplatePage.jsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTemplateForm from '../components/ProductTemplateForm';
import { createProductTemplate } from '../api/productTemplateApi';
import useEmployeeStore from '@/store/employeeStore';

const CreateProductTemplatePage = () => {
  const navigate = useNavigate();
  const branchId = useEmployeeStore((state) => state.branch?.id);
  const [error, setError] = useState(''); // 🔧 ลบถ้าไม่ได้ใช้
  const imageRef = useRef();

  const handleCreate = async (formData) => {
    try {
      formData.createdByBranchId = branchId;
      if (error) return <p className="text-red-500 font-medium">{error}</p>;
      if (!branchId) {
        return <p className="text-red-500">ไม่พบ branchId โปรดลองล็อกอินใหม่</p>;
      }
      if (!imageRef.current) {
        console.warn('⚠️ imageRef ยังไม่พร้อม');
        return;
      }
      await createProductTemplate(formData, branchId);
      navigate('/pos/stock/templates');
    } catch (err) {
      console.error('❌ บันทึกไม่สำเร็จ:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };



  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">เพิ่มรูปแบบสินค้า</h2>
      <ProductTemplateForm
        onSubmit={handleCreate}
        imageRef={imageRef}
      />
    </div>
  );
};

export default CreateProductTemplatePage;
