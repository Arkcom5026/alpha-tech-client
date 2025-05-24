// ✅ src/features/productTemplate/components/ProductTemplateTable.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteProductTemplate } from '../api/productTemplateApi';
import useEmployeeStore from '@/store/employeeStore';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';

const ProductTemplateTable = ({ templates }) => {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = async (id) => {
    try {
      const branchId = useEmployeeStore.getState().branch?.id;
      await deleteProductTemplate(id, branchId);
      window.location.reload();
    } catch (error) {
      if (error.response?.status === 403) {
        alert('ไม่มีสิทธิ์ลบรายการนี้');
      } else if (error.response?.status === 409) {
        alert('ไม่สามารถลบได้ เพราะมีการใช้งานแล้ว');
      } else {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left font-medium">รูปแบบสินค้า</th>
            <th className="px-4 py-2 text-left font-medium">ลักษณะสินค้า</th>
            <th className="px-4 py-2 text-left font-medium">รายละเอียด</th>
            <th className="px-4 py-2 text-left font-medium">รับประกัน (วัน)</th>
            <th className="px-4 py-2 text-center font-medium">การจัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {templates.map((tpl) => (
            <tr key={tpl.id}>
              <td className="px-4 py-2 whitespace-nowrap">{tpl.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{tpl.productProfileName || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{tpl.description || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{tpl.warranty ?? '-'}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <button onClick={() => navigate(`/pos/stock/templates/edit/${tpl.id}`)} className="text-blue-600 hover:underline">ดู</button>
                <button onClick={() => navigate(`/pos/stock/templates/edit/${tpl.id}`)} className="text-green-600 hover:underline">แก้ไข</button>
                <button onClick={() => setConfirmId(tpl.id)} className="text-red-600 hover:underline">ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {confirmId && (
        <ConfirmDeleteDialog
          open={true}
          itemLabel="รูปแบบสินค้า"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default ProductTemplateTable;
