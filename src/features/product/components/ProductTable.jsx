// ✅ src/features/product/components/ProductTable.jsx
import { Link, useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ProductTable = ({ products, onDelete, deleting }) => {
  const navigate = useNavigate();

  const getPrice = (p) => p.prices?.find((pr) => pr.level === 1)?.price || 0;

  return (
    <table className="w-full border text-sm">
      <thead>
        <tr className="bg-gray-100 dark:bg-zinc-800">
          <th className="p-2 border">#</th>
          <th className="p-2 border">รูป</th>
          <th className="p-2 border">ชื่อสินค้า</th>
          <th className="p-2 border">รายละเอียด</th>
          <th className="p-2 border">ราคาขาย</th>
          <th className="p-2 border">คงเหลือ</th>
          <th className="p-2 border">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {products.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-4 text-center text-gray-500">
              ไม่มีรายการสินค้า
            </td>
          </tr>
        ) : (
          products.map((prod, index) => (
            <tr key={prod.id || index} className="border-t">
              <td className="p-2 border text-center align-middle">{index + 1}</td>
              <td className="p-2 border text-center align-middle">
                {prod.images?.length > 0 ? (
                  <img
                    src={prod.images[0].url}
                    alt="thumbnail"
                    className="w-12 h-12 object-cover rounded mx-auto"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded mx-auto" />
                )}
              </td>

              <td className="p-2 border align-middle">{prod.title}</td>
              <td className="p-2 border align-middle">{prod.description}</td>

              <td className="p-2 border text-right align-middle">
                ฿{getPrice(prod).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>

              <td className="p-2 border text-right align-middle">
                {prod.quantity ?? '-'}
              </td>

              <td className="p-2 border text-center align-middle">
                <div className="flex justify-center items-center gap-2">
                  <StandardActionButtons
                    onEdit={() => navigate(`/pos/stock/products/edit/${prod.id}`)}
                    onDelete={() => onDelete(prod.id)}
                    disabled={deleting}
                  />
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ProductTable;
