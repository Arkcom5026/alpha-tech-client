// ✅ src/features/supplier/pages/SupplierFormPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SupplierForm from '../components/SupplierForm';
import { createSupplier } from '../api/supplierApi';
import { useBranchStore } from '@/features/branch/store/branchStore';

const CreateSupplierPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const handleCreateSupplier = async (formData) => {
    try {
      if (!selectedBranchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);
      await createSupplier(formData); // ✅ ไม่ส่ง branchId จากหน้า – ให้ backend ดึงจาก token
      navigate('/pos/purchases/suppliers');
    } catch (error) {
      console.error('❌ Create supplier failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBranchId) {
    return <p className="text-center text-gray-500">ยังไม่ได้เลือกสาขา</p>;
  }

  // ✅ เตรียมค่า default สำหรับ create และกำหนด bankId เป็น string
  const defaultValues = {
    name: '',
    phone: '',
    email: '',
    taxId: '',
    address: '',
    province: '',
    postalCode: '',
    country: 'Thailand',
    contactPerson: '',
    bankId: '', // ✅ string ว่างสำหรับ dropdown
    accountNumber: '',
    accountType: '',
    creditLimit: 0,
    creditBalance: 0,
    paymentTerms: 0,
    notes: '',
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">เพิ่มผู้ขายใหม่</h1>
      <SupplierForm 
        onSubmit={handleCreateSupplier} 
        defaultValues={defaultValues} 
        loading={loading} 
        isEdit={false}
        showCreditFields={false} 
      />
    </div>
  );
};

export default CreateSupplierPage;
