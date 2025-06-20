// ✅ src/features/supplier/pages/UpdateSupplierPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from '../components/SupplierForm';
import { getSupplierById, updateSupplier } from '../api/supplierApi';
import { useBranchStore } from '@/stores/branchStore';

const UpdateSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const branch = useBranchStore((state) => state.currentBranch);

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);

        // ✅ แปลง bankId เป็น string ถ้าไม่ใช่ null
        if (data.bankId !== null && typeof data.bankId !== 'string') {
          data.bankId = data.bankId.toString();
        }

        setSupplier(data);
      } catch (error) {
        console.error('❌ โหลดข้อมูลผู้ขายล้มเหลว:', error);
      }
    };
    if (id) fetchSupplier();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      if (!branch?.id) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);

      const cleanedForm = { ...formData };
      delete cleanedForm.branchId;
      delete cleanedForm.createdAt;
      delete cleanedForm.updatedAt;

      await updateSupplier(id, cleanedForm);
      navigate('/pos/purchases/suppliers');
    } catch (error) {
      console.error('❌ อัปเดตผู้ขายล้มเหลว:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!branch?.id) {
    return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;
  }

  if (!supplier) return <p className="text-center py-10">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">แก้ไขข้อมูลผู้ขาย</h1>
      <SupplierForm
        onSubmit={handleUpdate}
        defaultValues={supplier}
        isEdit={true}
        loading={loading}
      />
    </div>
  );
};

export default UpdateSupplierPage;
