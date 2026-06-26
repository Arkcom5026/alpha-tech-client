// src/features/supplier/pages/UpdateSupplierPage.jsx
// ✅ src/features/supplier/pages/UpdateSupplierPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from '../components/SupplierForm';
import { getSupplierById, updateSupplier } from '../api/supplierApi';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { ArrowLeft } from 'lucide-react';

const UpdateSupplierPage = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetSlug = shopSlug || 'advancetech';

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
    if (id && selectedBranchId) fetchSupplier();
  }, [id, selectedBranchId]);

  const handleUpdate = async (formData) => {
    try {
      if (!selectedBranchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);

      const cleanedForm = { ...formData };
      delete cleanedForm.branchId;
      delete cleanedForm.createdAt;
      delete cleanedForm.updatedAt;

      await updateSupplier(id, cleanedForm);
      navigate(`/${targetSlug}/pos/purchases/suppliers`);
    } catch (error) {
      console.error('❌ อัปเดตผู้ขายล้มเหลว:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBranchId) {
    return <p className="text-center text-slate-400 font-bold py-10">📭 กรุณาเลือกสาขาผู้ดำเนินงานในระบบก่อนครับ</p>;
  }

  if (!supplier) return <div className="text-center py-12 font-bold text-slate-400 italic">⏳ กำลังเรียกเปิดหน้าข้อมูลแก้ไข...</div>;

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm select-none">
        <div>
          <h1 className="text-sm font-black text-slate-900">แก้ไขข้อมูลผู้ขายประจำคลัง</h1>
          <p className="text-[11px] text-slate-400 font-medium">ปรับปรุงโครงสร้างบัญชี ข้อมูลการสื่อสาร และรายละเอียดเครดิตเทอม</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers`)}
          className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>กลับหน้าทะเบียน</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm
          onSubmit={handleUpdate}
          defaultValues={supplier}
          isEdit={true}
          showCreditFields={true}
        />
      </div>
    </div>
  );
};

export default UpdateSupplierPage;