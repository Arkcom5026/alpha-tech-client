// src/features/product/pages/CreateProductPage.jsx
import ProductForm from '../components/ProductForm';

const CreateProductPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">เพิ่มสินค้าใหม่</h1>
      <ProductForm mode="create" />
    </div>
  );
};

export default CreateProductPage;

