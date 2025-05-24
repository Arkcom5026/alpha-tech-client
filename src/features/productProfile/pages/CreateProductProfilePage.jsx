// ✅ src/features/productProfile/pages/CreateProductProfilePage.jsx
import ProductProfileForm from '../components/ProductProfileForm';

const CreateProductProfilePage = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-zinc-900 shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">เพิ่มรูปแบบสินค้า (Product Profile)</h1>
      <ProductProfileForm mode="create" />
    </div>
  );
};

export default CreateProductProfilePage;