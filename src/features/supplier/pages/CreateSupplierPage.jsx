// src/features/supplier/pages/CreateSupplierPage.jsx
// 🏛️ Enterprise Supplier Creation Hub: (Separation of Concerns Aligned Edition)

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SupplierForm from '../components/SupplierForm';
import useSupplierStore from '../store/supplierStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { ArrowLeft, Building2 } from 'lucide-react';

const CreateSupplierPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { createSupplierAction } = useSupplierStore();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);

  const targetSlug = shopSlug || 'advancetech';

  const handleCreateSupplier = async (formData) => {
    try {
      if (!selectedBranchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);
      
      const formatted = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit || 0),
        creditBalance: parseFloat(formData.creditBalance || 0),
        paymentTerms: parseInt(formData.paymentTerms || 0),
        notes: formData.notes || null,
      };

      await createSupplierAction(formatted);
      navigate(`/${targetSlug}/pos/purchases/suppliers`);
    } catch (error) {
      console.error('❌ Create supplier failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBranchId) {
    return (
      <div className="text-center py-12 text-slate-400 font-bold select-none border border-dashed rounded-xl bg-slate-50 animate-fadeIn text-xs md:text-sm">
        📭 กรุณาเลือกสาขาผู้ดำเนินงานในระบบก่อนเพิ่มข้อมูลครับ
      </div>
    );
  }

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
    bankId: '',
    accountNumber: '',
    accountType: '',
    creditLimit: 0,
    creditBalance: 0,
    paymentTerms: 0,
    notes: '',
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      {/* คอนโซลบาร์ส่วนหัวควบคุมกะทัดรัด (Compact Control Header) */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900/5 rounded-lg text-slate-800">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black text-slate-900">ลงทะเบียนคู่ค้า / เพิ่มผู้ขายใหม่</h1>
            <p className="text-[11px] text-slate-400 font-medium">บันทึกพิกัด ข้อมูลบัญชีธนาคาร และวงเงินอนุมัติทางการค้าเพื่อลดภาระความกังวล</p>
          </div>
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

      {/* 🟢 [COMPONENT FIXED]: สับเลนนำตาราง SupplierTable ออกไป และเปิดพื้นที่ให้ฟอร์มลงทะเบียนตัวจริง SupplierForm ทำงานแบบไร้รอยต่อ */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm 
          onSubmit={handleCreateSupplier} 
          defaultValues={defaultValues} 
          loading={loading} 
          isEdit={false}
          showCreditFields={true}
        />
      </div>
    </div>
  );
};

export default CreateSupplierPage;