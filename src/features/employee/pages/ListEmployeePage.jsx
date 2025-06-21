// ✅ @filename: ListEmployeePage.jsx
// ✅ @folder: src/features/employee/pages/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useEmployeeStore from '@/features/employee/store/employeeStore';

import EmployeeTable from '../components/EmployeeTable';
import { getAllEmployees } from '../api/employeeApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ListEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useEmployeeStore((s) => s.token);
  const branchId = useBranchStore((s) => s.currentBranch?.id);

  useEffect(() => {
    const fetchEmployees = async () => {
      console.log('🧪 token:', token);
      console.log('🧪 branchId:', branchId);

      try {
        const res = await getAllEmployees(token, branchId);
        console.log('✅ ดึงรายชื่อพนักงาน:', res);
        setEmployees(res);
      } catch (err) {
        console.error('❌ โหลดพนักงานล้มเหลว:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && branchId) {
      fetchEmployees();
    }
  }, [token, branchId]);

  if (!token || !branchId) {
    return <p>กำลังโหลดข้อมูลสาขาและสิทธิ์ผู้ใช้...</p>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">รายชื่อพนักงาน</h1>
        <StandardActionButtons onCreate={() => navigate('/pos/employees/create')} />
      </div>
      {loading ? <p>กำลังโหลด...</p> : <EmployeeTable employees={employees} />}
    </div>
  );
};

export default ListEmployeePage;
