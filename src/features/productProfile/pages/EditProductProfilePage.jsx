// ✅ src/features/productProfile/pages/EditProductProfilePage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductProfileForm from '../components/ProductProfileForm';
import { getProductProfileById, updateProductProfile } from '../api/productProfileApi';

const EditProductProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProductProfileById(id);
        setProfile(data);
      } catch (err) {
        console.error('ไม่สามารถโหลดข้อมูลได้:', err);
      }
    };
    fetchProfile();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await updateProductProfile(id, data);
      navigate('/pos/stock/profiles');
    } catch (err) {
      console.error('ไม่สามารถอัปเดตข้อมูลได้:', err);
    }
  };

  if (!profile) return <div className="p-4">กำลังโหลด...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-zinc-900 shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">แก้ไขรูปแบบสินค้า</h1>
      <ProductProfileForm
        mode="edit"
        defaultValues={{
          ...profile,
          productTypeId: String(profile.productTypeId), // ✅ แปลงเป็น string เพื่อให้ select ทำงาน
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditProductProfilePage;
