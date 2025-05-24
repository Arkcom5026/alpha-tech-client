// ✅ src/features/productType/components/ProductTypeTable.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import ProductTypeDeleteDialog from './ProductTypeDeleteDialog';
import { useProductTypeStore } from '../store/productTypeStore';
import { deleteProductType } from '../api/productTypeApi';

const ProductTypeTable = ({ data, onEdit }) => {
  const { fetchProductTypes } = useProductTypeStore();
  const [selectedProductType, setSelectedProductType] = useState(null);
  
   const handleDelete = async () => {
    if (!selectedProductType) return;
    try {
      await deleteProductType(selectedProductType.id);
      await fetchProductTypes();
      setSelectedProductType(null);
    } catch (err) {
      console.error('ลบประเภทสินค้าล้มเหลว', err);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-2 border">ชื่อประเภทสินค้า</th>
            <th className="px-4 py-2 border text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pt) => (
            <tr key={pt.id} className="border-t">
              <td className="px-4 py-2 border">{pt.name}</td>
              <td className="px-4 py-2 border text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(pt)}>แก้ไข</Button>
                <Button size="sm" variant="destructive" onClick={() => setSelectedProductType(pt)}>ลบ</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ProductTypeDeleteDialog
        open={!!selectedProductType}
        productType={selectedProductType}
        onCancel={() => setSelectedProductType(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProductTypeTable;