import ProductForm from '../components/ProductForm';

export default function CreateProductPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">เพิ่มสินค้าใหม่</h1>
      <ProductForm mode="create" />
    </div>
  );
}