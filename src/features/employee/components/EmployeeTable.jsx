

// ✅ @filename: EmployeeTable.jsx
// ✅ @folder: src/features/employee/components/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { deleteEmployee as apiDeleteEmployee } from '../api/employeeApi';

const EmployeeTable = ({ employees, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?')) return;
    try {
      await apiDeleteEmployee(id); // ใช้ apiClient แนบ token ใน interceptor
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ ลบพนักงานล้มเหลว:', err);
      alert('เกิดข้อผิดพลาดในการลบพนักงาน');
    }
  };

  const filtered = employees.filter((e) => {
    const matchName = (e.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchPosition = positionFilter ? e.position?.id === Number(positionFilter) : true;
    return matchName && matchPosition;
  });

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="ค้นหาชื่อพนักงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1 rounded w-64 text-sm"
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="">ตำแหน่งทั้งหมด</option>
          <option value="1">ผู้ดูแลระบบ</option>
          <option value="2">ผู้จัดการสาขา</option>
          <option value="3">พนักงานขาย</option>
          <option value="4">ช่างเทคนิค</option>
          <option value="5">บัญชี</option>
          <option value="6">แคชเชียร์</option>
          <option value="7">พนักงานทั่วไป</option>
        </select>
      </div>

      <StandardActionButtons
        onAdd={() => navigate('/pos/settings/employee/approve')}
        className="mb-4"
      />

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ชื่อ</th>
            <th className="p-2 border">เบอร์โทร</th>
            <th className="p-2 border">อีเมล</th>
            <th className="p-2 border">ตำแหน่ง</th>
            <th className="p-2 border">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="p-2 border">{e.name}</td>
              <td className="p-2 border">{e.phone || '-'}</td>
              <td className="p-2 border">{e.user?.email || '-'}</td>
              <td className="p-2 border">{e.position?.name || '-'}</td>
              <td className="p-2 border">
                <StandardActionButtons
                  onViewLink={`/pos/settings/employee/view/${e.id}`}
                  onEditLink={`/pos/settings/employee/edit/${e.id}`}
                  onDelete={() => handleDelete(e.id)}
                  size="xs"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
