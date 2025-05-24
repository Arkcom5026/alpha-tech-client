// ✅ src/features/supplier/pages/SupplierFormPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SupplierForm from '../components/SupplierForm';
import { createSupplier } from '../api/supplierApi';
import useEmployeeStore from '@/store/employeeStore';

const SupplierFormPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = useEmployeeStore((state) => state.token);
  const branch = useEmployeeStore((state) => state.branch);
  const branchId = branch?.id;

  const handleCreateSupplier = async (formData) => {
    try {
      if (!branchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);
      const dataWithBranch = { ...formData, branchId };
      await createSupplier(token, dataWithBranch);
      navigate('/pos/suppliers');
    } catch (error) {
      console.error('❌ Create supplier failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!branchId) {
    return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">เพิ่มผู้ขายใหม่</h1>
      <SupplierForm onSubmit={handleCreateSupplier} loading={loading} />
    </div>
  );
};

export default SupplierFormPage;