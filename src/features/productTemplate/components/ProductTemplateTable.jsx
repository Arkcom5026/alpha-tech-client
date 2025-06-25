// ✅ src/features/productTemplate/components/ProductTemplateTable.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import useEmployeeStore from '@/features/employee/store/employeeStore';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';
import AlertDialog from '@/components/shared/dialogs/AlertDialog';
import useProductTemplateStore from '../store/productTemplateStore';

const ProductTemplateTable = ({ templates }) => {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '' });
  const { deleteTemplate } = useProductTemplateStore();

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      window.location.reload();
    } catch (error) {
      if (error.response?.status === 403) {
        setAlert({ open: true, message: 'ไม่มีสิทธิ์ลบรายการนี้' });
      } else if (error.response?.status === 409) {
        setAlert({ open: true, message: 'ไม่สามารถลบได้ เพราะมีการใช้งานแล้ว' });
      } else {
        setAlert({ open: true, message: 'เกิดข้อผิดพลาดในการลบ' });
      }
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full border rounded-md overflow-hidden">
        <table className="min-w-full text-sm ">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 border  align-middle">รูปแบบสินค้า</th>
              <th className="px-4 py-2 border  align-middle">ลักษณะสินค้า</th>
              <th className="px-4 py-2 border  align-middle">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(templates) && templates.map((tpl) => (
              <tr key={tpl.id} className="border-t  align-middle">
                <td className="px-4 py-2 border  align-middle">{tpl.name}</td>
                <td className="px-4 py-2 border align-middle">{tpl.productProfileName || '-'}</td>
                <td className="px-4 py-2 border align-top min-w-[230px] ">
                  <div className="flex justify-center items-center gap-1">
                    <StandardActionButtons
                      onEdit={() => navigate(`/pos/stock/templates/edit/${tpl.id}`)}
                      onDelete={() => setConfirmId(tpl.id)}
                    />
                  </div>
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
        <AlertDialog
          open={alert.open}
          title="ไม่สามารถลบข้อมูลได้"
          description={alert.message}
          onClose={() => setAlert({ open: false, message: '' })}
        />
      </div>
    </div>
  );
};

export default ProductTemplateTable;
