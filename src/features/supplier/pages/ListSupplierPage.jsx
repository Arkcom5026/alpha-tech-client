// ✅ src/features/supplier/pages/ListSupplierPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getAllSuppliers } from '../api/supplierApi';
import useEmployeeStore from '@/store/employeeStore';
import SupplierTable from '../components/SupplierTable';

const ListSupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useEmployeeStore((state) => state.token);
  const branch = useEmployeeStore((state) => state.branch);
  const branchId = branch?.id;

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers(token, branchId);
        setSuppliers(data);
      } catch (error) {
        console.error('❌ โหลดรายชื่อผู้ขายล้มเหลว:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && branchId) fetchSuppliers();
  }, [token, branchId]);

  if (!branchId) {
    return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">รายชื่อผู้ขาย</h1>
        <Button onClick={() => navigate('/pos/suppliers/create')} className="gap-2">
          <Plus className="w-4 h-4" /> เพิ่มผู้ขาย
        </Button>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : suppliers.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีผู้ขายในระบบ</p>
      ) : (
        <SupplierTable suppliers={suppliers} />
      )}
    </div>
  );
};

export default ListSupplierPage;
