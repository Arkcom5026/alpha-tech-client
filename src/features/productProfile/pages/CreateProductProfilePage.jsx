// ✅ src/features/productProfile/pages/CreateProductProfilePage.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const CreateProductProfilePage = () => {
  const navigate = useNavigate();
  const { addProfile } = useProductProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (data) => {
    try {
      setIsSubmitting(true);
      await addProfile(data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/pos/stock/profiles');
      }, 2000);
    } catch (err) {
      console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-zinc-900 shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">เพิ่มลักษณะสินค้า</h1>
      {error && <p className="text-red-500 font-medium mb-2">{error}</p>}
      <ProductProfileForm mode="create" onSubmit={handleCreate} />

      <ProcessingDialog
        open={isSubmitting || showSuccess}
        isLoading={isSubmitting}
        message={isSubmitting ? 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default CreateProductProfilePage;
