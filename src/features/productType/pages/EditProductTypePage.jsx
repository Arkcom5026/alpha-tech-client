// ✅ src/features/productType/pages/EditProductTypePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductTypeForm from '../components/ProductTypeForm';
import PageHeader from '@/components/shared/layout/PageHeader';
import AlertDialog from '@/components/shared/dialogs/AlertDialog';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';
import useProductTypeStore from '@/features/productType/Store/productTypeStore';

const EditProductTypePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const mode = 'edit';

  const { updateProductType, getProductTypeById } = useProductTypeStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProductTypeById(id);
        setFormData(result);
      } catch (err) {
        console.error('❌ โหลดข้อมูลประเภทสินค้าไม่สำเร็จ:', err);
        setError('ไม่สามารถโหลดข้อมูลประเภทสินค้าได้');
      }
    };
    fetchData();
  }, [id, getProductTypeById]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateProductType(id, data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/pos/stock/types');
      }, 2000);
    } catch (err) {
      console.error('❌ อัปเดตประเภทสินค้าไม่สำเร็จ:', err);
      setError('ไม่สามารถอัปเดตประเภทสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <PageHeader title="แก้ไขประเภทสินค้า" />
      {formData && (
        <ProductTypeForm
          mode={mode}
          defaultValues={formData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <ProcessingDialog
        open={isSubmitting || showSuccess}
        isLoading={isSubmitting}
        message={isSubmitting ? 'ระบบกำลังอัปเดตข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />

      <AlertDialog open={!!error} onClose={() => setError('')} message={error} />
    </div>
  );
};

export default EditProductTypePage;
