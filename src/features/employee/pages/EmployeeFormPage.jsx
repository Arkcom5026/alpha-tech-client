// ✅ @filename: EmployeeFormPage.jsx
// ✅ @folder: src/features/employee/pages/

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import { createEmployee } from '../api/employeeApi';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const EmployeeFormPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = useEmployeeStore((s) => s.token);
  const branchId = useEmployeeStore((s) => s.branch?.id);

  const handleCreate = async (formData) => {
    try {
      if (!branchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);
      const dataWithBranch = { ...formData, branchId };
      await createEmployee(token, dataWithBranch);
      navigate('/pos/employees');
    } catch (err) {
      console.error('❌ สร้างพนักงานล้มเหลว:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">สร้างโปรไฟล์พนักงานจากผู้ใช้ที่มีอยู่</h1>
      <EmployeeForm onSubmit={handleCreate} loading={loading} />
    </div>
  );
};

export default EmployeeFormPage;
