// ✅ src/features/productProfile/components/ProductProfileTable.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import AlertDialog from '@/components/shared/dialogs/AlertDialog';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';
import { deleteProductProfile } from '../api/productProfileApi';

const ProductProfileTable = ({ profiles, onReload }) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '' });

  const handleDelete = async (id) => {
    try {
      await deleteProductProfile(id);
      setSelectedId(null);
      onReload?.();
    } catch (err) {
      setAlert({ open: true, message: 'ไม่สามารถลบได้ อาจมีการใช้งานอยู่' });
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[1200px] border rounded-md overflow-hidden">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 border">ชื่อ</th>
              <th className="px-4 py-2 border w-[40%]">คำอธิบาย</th>
              <th className="px-4 py-2 border">ประเภทสินค้า</th>
              <th className="px-4 py-2 border text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-t">
                <td className="px-4 py-2 border align-top whitespace-pre-wrap">{profile.name}</td>
                <td className="px-4 py-2 border align-top whitespace-pre-wrap">{profile.description || '-'}</td>
                <td className="px-4 py-2 border align-top">{profile.productType?.name || '-'}</td>
                <td className="px-4 py-2 border align-top">
                  <div className="flex justify-center items-center gap-2">
                    <StandardActionButtons
                      onEdit={() => navigate(`/pos/stock/profiles/edit/${profile.id}`)}
                      onDelete={() => setSelectedId(profile.id)}
                    />
                  </div>
                  <ConfirmDeleteDialog
                    open={selectedId === profile.id}
                    itemLabel="ลักษณะสินค้า"
                    onConfirm={() => handleDelete(profile.id)}
                    onCancel={() => setSelectedId(null)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default ProductProfileTable;
