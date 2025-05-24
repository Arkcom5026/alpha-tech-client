// 1. src/features/product/pages/EditProductPage.jsx
import { useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';

const EditProductPage = () => {
  const { id } = useParams();

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">แก้ไขสินค้า</h1>
      <ProductForm mode="edit" productId={id} />
    </div>
  );
};

export default EditProductPage;

