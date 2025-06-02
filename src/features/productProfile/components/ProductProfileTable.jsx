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
      <div className="w-[1000px] border rounded-md overflow-hidden">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 border text-center align-middle">ชื่อ</th>
              <th className="px-4 py-2 border text-center align-middle">คำอธิบาย</th>
              <th className="px-4 py-2 border text-center align-middle">ประเภทสินค้า</th>
              <th className="px-4 py-2 border text-center align-middle">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-t text-center align-middle">
                <td className="px-4 py-2 border align-middle">{profile.name}</td>
                <td className="px-4 py-2 border align-middle">{profile.description || '-'}</td>
                <td className="px-4 py-2 border align-middle">{profile.productType?.name || '-'}</td>
                <td className="px-4 py-2 border align-middle">
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
