// ✅ src/features/productProfile/pages/EditProductProfilePage.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';

const EditProductProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedProfile,
    fetchProfileById,
    updateProfile,
    isLoading,
  } = useProductProfileStore();

  useEffect(() => {
    if (id) fetchProfileById(id);
  }, [id, fetchProfileById]);

  const handleUpdate = async (data) => {
    try {
      await updateProfile(id, data);
      navigate('/pos/stock/profiles');
    } catch (err) {
      console.error('ไม่สามารถอัปเดตข้อมูลได้:', err);
    }
  };

  if (isLoading || !selectedProfile) return <div className="p-4">กำลังโหลด...</div>;

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
    </div>
  );
};

export default EditProductProfilePage;
