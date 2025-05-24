// ✅ src/features/productProfile/pages/ListProductProfilePage.jsx
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { deleteProductProfile, getAllProductProfiles } from '../api/productProfileApi';

const ListProductProfilePage = () => {
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await getAllProductProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันการลบลักษณะสินค้านี้?')) return;
    try {
      await deleteProductProfile(id);
      loadProfiles();
    } catch (err) {
      console.error('ไม่สามารถลบได้:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">รายการลักษณะสินค้า</h1>
        <button
          onClick={() => navigate('/pos/stock/profiles/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + เพิ่มลักษณะสินค้า
        </button>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ชื่อ</th>
            <th className="p-2 border">คำอธิบาย</th>
            <th className="p-2 border">ประเภทสินค้า</th>
            <th className="p-2 border">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id} className="border-t">
              <td className="p-2 border">{profile.name}</td>
              <td className="p-2 border">{profile.description || '-'}</td>
              <td className="p-2 border">{profile.productType?.name || '-'}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => navigate(`/pos/stock/profiles/edit/${profile.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="text-red-600 hover:underline"
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

export default ListProductProfilePage;
