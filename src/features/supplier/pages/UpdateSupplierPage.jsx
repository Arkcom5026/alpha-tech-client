// ✅ src/features/supplier/pages/UpdateSupplierPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from '../components/SupplierForm';
import { getSupplierById, updateSupplier } from '../api/supplierApi';

const UpdateSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);
        setSupplier(data);
      } catch (error) {
        console.error('❌ โหลดข้อมูลผู้ขายล้มเหลว:', error);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      const cleanedForm = { ...formData };
      delete cleanedForm.branchId; // ✅ ลบ branchId ก่อนส่งตามกฎระบบ
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

  if (!supplier) return <p>กำลังโหลดข้อมูล...</p>;

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
