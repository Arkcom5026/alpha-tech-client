// ✅ src/features/product/pages/EditProductPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import ProductForm from '../components/ProductForm';
import useEmployeeStore from '@/store/employeeStore';


export default function EditProductPage() {
  const { id } = useParams();
  const branch = useEmployeeStore((state) => state.branch);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!branch?.id || !id) return;
      try {
        const data = await getProductById(id, branch.id);
        setProduct(data);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลสินค้า');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, branch?.id]);

  if (loading) return <p>กำลังโหลดข้อมูลสินค้า...</p>;
  
  if (!product) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">แก้ไขสินค้า</h1>
      <ProductForm mode="edit" defaultValues={product} />
    </div>
  );
}
