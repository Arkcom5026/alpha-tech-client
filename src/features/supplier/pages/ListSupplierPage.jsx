// ✅ src/features/supplier/pages/ListSupplierPage.jsx
import { useEffect, useState } from 'react';
import { getAllSuppliers } from '../api/supplierApi';
import useEmployeeStore from '@/store/employeeStore';
import SupplierTable from '../components/SupplierTable';


const ListSupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);  
  const token = useEmployeeStore((state) => state.token);

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers(token);
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
    if (token) fetchSuppliers();
  }, [token]);

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


