// ✅ src/features/productType/pages/ListProductTypePage.jsx

import React from 'react';
import ProductTypeTable from '../components/ProductTypeTable';
import { useNavigate } from 'react-router-dom';
import useProductTypeStore from '@/features/productType/Store/productTypeStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListProductTypePage = () => {
  const navigate = useNavigate();
  const { productTypes, fetchProductTypes } = useProductTypeStore();

  React.useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  const handleEdit = (productType) => {
    navigate(`/pos/stock/types/edit/${productType.id}`);
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">จัดการประเภทสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/types/create')} />
        </div>
        <ProductTypeTable data={productTypes} onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default ListProductTypePage;
