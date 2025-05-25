// src/features/product/components/ProductTable.jsx
import { Link } from 'react-router-dom';

const ProductTable = ({ products, onDelete }) => {
  const getPrice = (p) => p.prices?.find((pr) => pr.level === 1)?.price || 0;

  return (
    <table className="w-full border text-sm">
      <thead>
        <tr className="bg-gray-100 dark:bg-zinc-800">
          <th className="p-2 border">#</th>
          <th className="p-2 border">รูป</th>
          <th className="p-2 border">ชื่อสินค้า</th>
          <th className="p-2 border">ราคาขาย</th>
          <th className="p-2 border">สต๊อก</th>
          <th className="p-2 border">สถานะ</th>
          <th className="p-2 border">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {products.map((prod, index) => (
          <tr key={prod.id} className="border-t">
            <td className="p-2 border text-center">{index + 1}</td>
            <td className="p-2 border text-center">
              {prod.images?.length > 0 ? (
                <img
                  src={prod.images[0].url}
                  alt="thumbnail"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded" />
              )}
            </td>
            <td className="p-2 border">{prod.title}</td>
            <td className="p-2 border text-right">
              ฿{getPrice(prod).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td className="p-2 border text-center">{prod.quantity ?? '-'}</td>
            <td className="p-2 border text-center">
              {prod.active ? '✅ เปิดใช้งาน' : '❌ ปิดใช้งาน'}
            </td>
            <td className="p-2 border text-center space-x-2">
              <Link
                to={`/pos/products/${prod.id}/edit`}
                className="text-blue-600 hover:underline"
              >
                ✏️ แก้ไข
              </Link>
              <button
                onClick={() => onDelete(prod.id)}
                className="text-red-600 hover:underline"
              >
                🗑️ ลบ
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
