// ✅ src/features/productProfile/pages/EditProductProfilePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const EditProductProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedProfile,
    fetchProfileById,
    updateProfile,
    isLoading,
  } = useProductProfileStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchProfileById(id);
  }, [id, fetchProfileById]);

  const handleUpdate = async (data) => {
    try {
      setIsUpdating(true);
      await updateProfile(id, data);
      setIsUpdating(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/pos/stock/profiles');
      }, 2000);
    } catch (err) {
      console.error('ไม่สามารถอัปเดตข้อมูลได้:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsUpdating(false);
    }
  };

  if (isLoading || !selectedProfile) return <div className="p-4">กำลังโหลด...</div>;
  if (error) return <p className="text-red-500 font-medium">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-zinc-900 shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">แก้ไขลักษณะสินค้า</h1>
      <ProductProfileForm
        mode="edit"
        defaultValues={{
          ...selectedProfile,
          productTypeId: String(selectedProfile.productTypeId),
        }}
        onSubmit={handleUpdate}
      />

      <ProcessingDialog
        open={isUpdating || showSuccess}
        isLoading={isUpdating}
        message={isUpdating ? 'ระบบกำลังอัปเดตข้อมูล กรุณารอสักครู่...' : '✅ บันทึกข้อมูลเรียบร้อยแล้ว'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default EditProductProfilePage;