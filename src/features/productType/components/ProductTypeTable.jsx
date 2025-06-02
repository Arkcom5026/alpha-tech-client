// ✅ src/features/productType/components/ProductTypeTable.jsx
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { deleteProductType } from '../api/productTypeApi';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import useProductTypeStore from '../Store/ProductTypeStore';

const ProductTypeTable = ({ data, onEdit }) => {
  const { fetchProductTypes } = useProductTypeStore();
  const [selectedType, setSelectedType] = useState(null);

  const handleDelete = async () => {
    if (!selectedType) return;
    try {
      await deleteProductType(selectedType.id);
      await fetchProductTypes();
      setSelectedType(null);
    } catch (err) {
      console.error('❌ ลบประเภทสินค้าไม่สำเร็จ:', err);
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[900px] border rounded-md overflow-hidden">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 border text-center align-middle">ชื่อประเภทสินค้า</th>
              <th className="px-4 py-2 border text-center align-middle">หมวดหมู่สินค้า</th>
              <th className="px-4 py-2 border text-center align-middle">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((type) => (
              <tr key={type.id} className="border-t text-center align-middle">
                <td className="px-4 py-2 border text-center align-middle">{type.name}</td>
                <td className="px-4 py-2 border text-center align-middle">{type.category?.name || '-'}</td>
                <td className="px-4 py-2 border text-center align-middle">
                  <div className="flex justify-center items-center gap-2">
                    <StandardActionButtons
                      onEdit={() => onEdit(type)}
                      onDelete={() => setSelectedType(type)}
                    />
                  </div>
                  <AlertDialog open={selectedType?.id === type.id} onOpenChange={(open) => !open && setSelectedType(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบประเภทสินค้า</AlertDialogTitle>
                      </AlertDialogHeader>
                      <p>คุณแน่ใจว่าต้องการลบประเภทสินค้า "{selectedType?.name}" หรือไม่?</p>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedType(null)}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>ยืนยันลบ</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTypeTable;
