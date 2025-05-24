
//  src/features/product/pages/ListProductPage.jsx
import { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct } from '../api/productApi';
import { useNavigate } from 'react-router-dom';

const ListProductPage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('❌ fetchProducts error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบสินค้านี้หรือไม่?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('❌ deleteProduct error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">รายการสินค้า</h1>
        <button
          onClick={() => navigate('/pos/stock/create')}
          className="btn btn-primary"
        >
          + เพิ่มสินค้าใหม่
        </button>
      </div>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ชื่อสินค้า</th>
            <th className="border px-4 py-2">บาร์โค้ด</th>
            <th className="border px-4 py-2">ราคา</th>
            <th className="border px-4 py-2">หน่วย</th>
            <th className="border px-4 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="text-center">
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.barcode}</td>
              <td className="border px-4 py-2">{p.price.toFixed(2)}</td>
              <td className="border px-4 py-2">{p.unit?.name}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => navigate(`/pos/product/edit/${p.id}`)}
                  className="btn btn-sm btn-secondary"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="btn btn-sm btn-danger"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListProductPage;
