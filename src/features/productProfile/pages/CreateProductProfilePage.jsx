// ✅ src/features/productProfile/pages/CreateProductProfilePage.jsx
import { useNavigate } from 'react-router-dom';
import ProductProfileForm from '../components/ProductProfileForm';
import useProductProfileStore from '../store/productProfileStore';

const CreateProductProfilePage = () => {
  const navigate = useNavigate();
  const { addProfile } = useProductProfileStore();

  const handleCreate = async (data) => {
    try {
      await addProfile(data);
      navigate('/pos/stock/profiles');
    } catch (err) {
      console.error('ไม่สามารถเพิ่มข้อมูลได้:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-zinc-900 shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">เพิ่มลักษณะสินค้า</h1>
      <ProductProfileForm mode="create" onSubmit={handleCreate} />
    </div>
  );
};

export default CreateProductProfilePage;

