
// ✅ src/features/supplier/pages/UpdateSupplierPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from '../components/SupplierForm';
import { getSupplierById, updateSupplier } from '../api/supplierApi';
import { useEmployeeStore } from '@/store/employeeStore';

const UpdateSupplierPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useEmployeeStore((state) => state.token);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(token, id);
        setSupplier(data);
      } catch (error) {
        console.error('❌ โหลดข้อมูลผู้ขายล้มเหลว:', error);
      }
    };
    fetchSupplier();
  }, [id, token]);

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      await updateSupplier(token, id, formData);
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
