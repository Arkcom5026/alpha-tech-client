// ✅ src/features/productType/pages/CreateProductTypePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductTypeForm from '../components/ProductTypeForm';
import PageHeader from '@/components/shared/layout/PageHeader';
import AlertDialog from '@/components/shared/dialogs/AlertDialog';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';
import useProductTypeStore from '@/features/productType/Store/productTypeStore';

const CreateProductTypePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addProductType } = useProductTypeStore();
  const mode = 'create';

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await addProductType(formData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/pos/stock/types');
      }, 2000);
    } catch (err) {
      console.error('❌ สร้างประเภทสินค้าไม่สำเร็จ:', err);
      setError('ไม่สามารถบันทึกประเภทสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader title="เพิ่มประเภทสินค้าใหม่" />
      <ProductTypeForm mode={mode} onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      <ProcessingDialog
        open={isSubmitting || showSuccess}
        isLoading={isSubmitting}
        message={isSubmitting ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />

      <AlertDialog open={!!error} onClose={() => setError('')} message={error} />
    </div>
  );
};

export default CreateProductTypePage;
