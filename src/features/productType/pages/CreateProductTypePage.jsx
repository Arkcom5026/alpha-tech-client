// src/features/productType/pages/CreateProductTypePage.jsx
import PageHeader from '@/components/shared/layout/PageHeader';
import ProductTypeForm from '../components/ProductTypeForm';
import { useNavigate } from 'react-router-dom';
import { createProductType } from '../api/productTypeApi';
import { useState } from 'react';
import AlertDialog from '@/components/shared/dialogs/AlertDialog';

const CreateProductTypePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await createProductType(data);
      navigate('/pos/stock/types');
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
      setAlertOpen(true);
    }
  };

  return (
    <div className="p-4">
      <PageHeader title="เพิ่มประเภทสินค้า" />
      <ProductTypeForm onSubmit={handleSubmit} />
      <AlertDialog
        open={alertOpen}
        title="เกิดข้อผิดพลาด"
        message={error}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
};

export default CreateProductTypePage;
