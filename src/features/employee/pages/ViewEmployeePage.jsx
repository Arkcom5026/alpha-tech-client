// ✅ @filename: ViewEmployeePage.jsx
// ✅ @folder: src/features/employee/pages/

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../api/employeeApi';
import useEmployeeStore from '@/store/employeeStore';

const ViewEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useEmployeeStore((s) => s.token);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEmployeeById(token, id);
        setEmployee(data);
      } catch (err) {
        console.error('❌ โหลดข้อมูลพนักงานล้มเหลว:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token && id) fetchData();
  }, [token, id]);

  if (loading) return <p className="text-center">กำลังโหลดข้อมูล...</p>;
  if (!employee) return <p className="text-center text-red-500">ไม่พบข้อมูลพนักงาน</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md border dark:border-zinc-700">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xl">
          {employee.name?.charAt(0) || '?'}
        </div>
        <h1 className="text-2xl font-bold text-blue-800 dark:text-white">👤 รายละเอียดพนักงาน</h1>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-blue-800 dark:text-white">👤 รายละเอียดพนักงาน</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-800 dark:text-zinc-200">
        <div><span className="font-medium">ชื่อ:</span> {employee.name}</div>
        <div><span className="font-medium">อีเมล:</span> {employee.user?.email || '-'}</div>
        <div><span className="font-medium">เบอร์โทร:</span> {employee.phone || '-'}</div>
        <div><span className="font-medium">ตำแหน่ง:</span> {employee.position?.name || '-'}</div>
        <div><span className="font-medium">สาขา:</span> {employee.branch?.name || '-'}</div>
      </div>
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow"
        >
          ← กลับ
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/pos/employees/edit/${employee.id}`)}
            className="text-sm px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow"
          >
            ✏️ แก้ไขข้อมูล
          </button>
          <button
            onClick={async () => {
              if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?')) return;
              try {
                const res = await fetch(`/api/employees/${employee.id}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('ไม่สามารถลบพนักงานได้');
                navigate('/pos/employees');
              } catch (err) {
                console.error('❌ ลบพนักงานล้มเหลว:', err);
                alert('เกิดข้อผิดพลาดในการลบพนักงาน');
              }
            }}
            className="text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow"
          >
            🗑️ ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeePage;