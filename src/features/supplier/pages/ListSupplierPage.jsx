// ✅ src/features/supplier/pages/ListSupplierPage.jsx
import { useEffect, useState } from 'react';
import SupplierTable from '../components/SupplierTable';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useSupplierStore from '../store/supplierStore';

const ListSupplierPage = () => {
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const { suppliers, fetchSuppliersAction, deleteSupplierAction } = useSupplierStore();

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteSupplierAction(id);
      await fetchSuppliersAction();
    } catch (err) {
      console.error('❌ error ลบผู้ขาย:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      
      try {
        if (!selectedBranchId || !token) return;
        await fetchSuppliersAction();
      } catch (err) {
        console.error('❌ โหลดผู้ขายล้มเหลว:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token, selectedBranchId]);



  if (!selectedBranchId) {
    return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;
  }

  return (
    <div className="p-4">
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : suppliers.length === 0 ? (
        <div className="text-center text-gray-500 space-y-4">
          <p>ยังไม่มีผู้ขายในระบบ</p>
          <a href="/pos/purchases/suppliers/create" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ➕ เพิ่มผู้ขาย
          </a>
        </div>
      ) : (
        <SupplierTable suppliers={suppliers} onDelete={handleDeleteSupplier} />
      )}
    </div>
  );
};

export default ListSupplierPage;



