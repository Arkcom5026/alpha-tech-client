// ✅ @filename: ViewEmployeePage.jsx

// ✅ @filename: EmployeeTable.jsx
// ✅ @folder: src/features/employee/components/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmployeeStore from '@/store/employeeStore';

const EmployeeTable = ({ employees, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const navigate = useNavigate();
  const token = useEmployeeStore((s) => s.token);

  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('ไม่สามารถลบพนักงานได้');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ ลบพนักงานล้มเหลว:', err);
      alert('เกิดข้อผิดพลาดในการลบพนักงาน');
    }
  };

  const filtered = employees.filter((e) => {
    const matchName = e.name.toLowerCase().includes(searchTerm.toLowerCase());
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
              <td className="p-2 border space-x-1">
  <button
    onClick={() => navigate(`/pos/employees/view/${e.id}`)}
    className="text-blue-600 hover:underline text-xs"
  >
    👁️ ดู
  </button>
  <button
    onClick={() => navigate(`/pos/employees/edit/${e.id}`)}
    className="text-yellow-600 hover:underline text-xs"
  >
    ✏️ แก้ไข
  </button>
  <button
    onClick={() => handleDelete(e.id)}
    className="text-red-600 hover:underline text-xs"
  >
    🗑️ ลบ
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;

