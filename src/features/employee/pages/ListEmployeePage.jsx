// ✅ @filename: ListEmployeePage.jsx
// ✅ @folder: src/features/employee/pages/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import EmployeeTable from '../components/EmployeeTable';
import { getAllEmployees } from '../api/employeeApi';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const ListEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token); // ใช้ token จาก authStore (เผื่อ interceptor ต้องใช้)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployees(); // apiClient แนบ token ให้เองแล้ว
        setEmployees(res);
      } catch (err) {
        console.error('❌ โหลดพนักงานล้มเหลว:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [token]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">รายชื่อพนักงาน</h1>
        <StandardActionButtons onAdd={() => navigate('/pos/settings/employee/approve')} />
      </div>
      {loading ? <p>กำลังโหลด...</p> : <EmployeeTable employees={employees} onRefresh={async () => {
        setLoading(true);
        try { setEmployees(await getAllEmployees()); } finally { setLoading(false); }
      }} />}
    </div>
  );
};

export default ListEmployeePage;
