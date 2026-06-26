// src/features/unit/pages/ListUnitPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 🟢 [DYNAMIC PARAM FIX] นำเข้า useParams มาร่วมทีม
import useUnitStore from '../store/unitStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';

const ListUnitPage = () => {
  const { shopSlug } = useParams(); // 🟢 [LINK BINDING] แกะรหัสชื่อร้านค้าจาก URL สแตนด์บายเพื่อคุมทางวิ่งปุ่มกด
  const navigate = useNavigate();
  const { units, fetchUnits, deleteUnit, isLoading } = useUnitStore();
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleDelete = async (id) => {
    await deleteUnit(id);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">รายการหน่วยนับ</h1>
        {/* 🟢 [CLEAN ENGINE LINK] สับรางปุ่มกดสร้างข้อมูล ล้างสแลชท้ายคำออกให้ราบเรียบตรงล็อกเราเตอร์ */}
        <StandardActionButtons onAdd={() => navigate(`/${shopSlug}/pos/stock/units/create`)} />
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">ชื่อหน่วยนับ</th>
                <th className="p-2 border">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => (
                <tr key={unit.id} className="border-t">
                  <td className="p-2 align-middle text-center">{index + 1}</td>
                  <td className="p-2 align-middle text-center">{unit.name}</td>
                  <td className="p-2 align-middle">
                    <div className="flex justify-center items-center gap-2">
                      <StandardActionButtons
                        onEdit={() => navigate(`/${shopSlug}/pos/stock/units/edit/${unit.id}`)}
                        onDelete={() => setConfirmId(unit.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!confirmId}
        itemLabel="หน่วยนับ"
        onConfirm={() => {
          handleDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default ListUnitPage;