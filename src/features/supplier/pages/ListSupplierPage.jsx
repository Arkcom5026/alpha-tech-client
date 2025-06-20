// ✅ src/features/supplier/pages/ListSupplierPage.jsx
import { useEffect, useState } from 'react';
import { getAllSuppliers } from '../api/supplierApi';

import SupplierTable from '../components/SupplierTable';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';


const ListSupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const branch = useBranchStore((state) => state.currentBranch);

  const fetchSuppliers = async () => {
    try {
      if (!branch?.id) throw new Error('ยังไม่ได้เลือกสาขา');
      const data = await getAllSuppliers(token); // ✅ ไม่ส่ง branchId ให้ backend จะใช้จาก token
      setSuppliers(data);
    } catch (error) {
      console.error('❌ โหลดรายชื่อผู้ขายล้มเหลว:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSuppliers();
      } else {
        console.error('❌ ลบผู้ขายไม่สำเร็จ');
      }
    } catch (err) {
      console.error('❌ error ลบผู้ขาย:', err);
    }
  };

  useEffect(() => {
    if (token && branch?.id) fetchSuppliers();
  }, [token, branch]);

  if (!branch?.id) {
    return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;
  }

  return (
    <div className="p-4">
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : suppliers.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีผู้ขายในระบบ</p>
      ) : (
        <SupplierTable suppliers={suppliers} onDelete={handleDeleteSupplier} />
      )}
    </div>
  );
};

export default ListSupplierPage;
