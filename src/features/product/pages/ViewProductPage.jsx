// ✅ src/features/product/pages/ViewProductPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { Alert } from '@/components/ui/alert';
import useProductStore from '../store/productStore';

export default function ViewProductPage() {
  const { id } = useParams();
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const { fetchProductById } = useProductStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || isNaN(id)) {
        console.error('❌ Product ID ไม่ถูกต้อง:', id);
        return;
      }

      if (!branchId) return;

      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลสินค้า');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, branchId, fetchProductById]);

  if (loading) return <p>กำลังโหลดข้อมูลสินค้า...</p>;
  if (error) return <Alert variant="destructive">{error}</Alert>;
  if (!product) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">รายละเอียดสินค้า</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-medium">ชื่อสินค้า:</p>
          <p className="mb-4">{product.name}</p>

          <p className="font-medium">รายละเอียด:</p>
          <p className="mb-4">{product.description || '-'}</p>

          <p className="font-medium">ราคา:</p>
          <ul className="mb-4 list-disc list-inside">
            {product.prices?.map((price) => (
              <li key={price.level}>
                ระดับ {price.level}: ฿{price.price.toFixed(2)}
              </li>
            ))}
          </ul>

          <p className="font-medium">จำนวนคงเหลือ:</p>
          <p className="mb-4">{product.quantity ?? '-'}</p>

          <p className="font-medium">หน่วย:</p>
          <p className="mb-4">{product.unit || '-'}</p>

          <p className="font-medium">สถานะ:</p>
          <p>{product.active ? '✅ เปิดใช้งาน' : '❌ ปิดใช้งาน'}</p>
        </div>

        <div>
          <p className="font-medium mb-2">รูปภาพ:</p>
          <div className="grid grid-cols-2 gap-3">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img.secure_url || img.url}
                alt={`img-${index}`}
                className="w-full rounded border"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/pos/stock/products/edit/${product.id}`}
          className="text-blue-600 hover:underline"
        >
          แก้ไขสินค้า
        </Link>
      </div>
    </div>
  );
}
