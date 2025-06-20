// ✅ src/features/productProfile/pages/ListProductProfilePage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductProfileTable from '../components/ProductProfileTable';
import useProductProfileStore from '../store/productProfileStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListProductProfilePage = () => {
  const navigate = useNavigate();
  const { profiles, fetchProfiles } = useProductProfileStore();

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการลักษณะสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/profiles/create')} />
        </div>

        <ProductProfileTable profiles={profiles} onReload={fetchProfiles} />
      </div>
    </div>
  );
};

export default ListProductProfilePage;
