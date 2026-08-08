import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

import { useBranchStore } from '@/features/branch/store/branchStore';
import SupplierForm from '../components/SupplierForm';
import useSupplierStore from '../store/supplierStore';
import {
  SUPPLIER_CREATE_DEFAULT_VALUES,
  createSupplierPaths,
  normalizeSupplierMutationPayload,
} from './supplierWorkspacePolicy';

const SupplierCreateWorkspace = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { createSupplierAction } = useSupplierStore();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const paths = useMemo(() => createSupplierPaths(shopSlug), [shopSlug]);

  const handleCreateSupplier = async (formData) => {
    try {
      if (!selectedBranchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);
      await createSupplierAction(normalizeSupplierMutationPayload(formData));
      navigate(paths.list);
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

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
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
          onClick={() => navigate(paths.list)}
          className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>กลับหน้าทะเบียน</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm
          onSubmit={handleCreateSupplier}
          defaultValues={{ ...SUPPLIER_CREATE_DEFAULT_VALUES }}
          loading={loading}
          isEdit={false}
          showCreditFields={true}
        />
      </div>
    </div>
  );
};

export default SupplierCreateWorkspace;
