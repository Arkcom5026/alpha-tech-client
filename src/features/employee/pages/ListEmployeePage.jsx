// ✅ @filename: ListEmployeePage.jsx
// ✅ @folder: src/features/employee/pages/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import useEmployeeStore from '@/features/employee/store/employeeStore';
import EmployeeTable from '../components/EmployeeTable';
import { getAllEmployees } from '../api/employeeApi';

const ListEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useEmployeeStore((s) => s.token);
  const branchId = useEmployeeStore((s) => s.branch?.id);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployees(token, branchId);
        setEmployees(res);
      } catch (err) {
        console.error('โหลดพนักงานล้มเหลว:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token && branchId) fetchEmployees();
  }, [token, branchId]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">รายชื่อพนักงาน</h1>
        <Button onClick={() => navigate('/pos/employees/create')} className="gap-2">
          <Plus className="w-4 h-4" /> เพิ่มพนักงาน
        </Button>
      </div>
      {loading ? <p>กำลังโหลด...</p> : <EmployeeTable employees={employees} />}
    </div>
  );
};

export default ListEmployeePage;



