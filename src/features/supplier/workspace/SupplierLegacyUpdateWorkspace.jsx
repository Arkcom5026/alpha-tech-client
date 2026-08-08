import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { getSupplierById, updateSupplier } from '../api/supplierApi';
import SupplierForm from '../components/SupplierForm';
import {
  createSupplierPaths,
  normalizeSupplierForForm,
  sanitizeLegacySupplierUpdatePayload,
} from './supplierWorkspacePolicy';
import useSupplierFormRuntime from './useSupplierFormRuntime';

const SupplierLegacyUpdateWorkspace = () => {
  const { id, shopSlug } = useParams();
  const navigate = useNavigate();
  const { banks, branchId, formSyncReady } = useSupplierFormRuntime();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const paths = useMemo(() => createSupplierPaths(shopSlug), [shopSlug]);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplierById(id);
        setSupplier(normalizeSupplierForForm(data));
      } catch (error) {
        console.error('❌ โหลดข้อมูลผู้ขายล้มเหลว:', error);
      }
    };
    if (id && branchId) fetchSupplier();
  }, [id, branchId]);

  const handleUpdate = async (formData) => {
    try {
      if (!branchId) throw new Error('ยังไม่ได้เลือกสาขา');
      setLoading(true);
      await updateSupplier(id, sanitizeLegacySupplierUpdatePayload(formData));
      navigate(paths.list);
    } catch (error) {
      console.error('❌ อัปเดตผู้ขายล้มเหลว:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!branchId) {
    return <p className="text-center text-slate-400 font-bold py-10">📭 กรุณาเลือกสาขาผู้ดำเนินงานในระบบก่อนครับ</p>;
  }
  if (!supplier) {
    return <div className="text-center py-12 font-bold text-slate-400 italic">⏳ กำลังเรียกเปิดหน้าข้อมูลแก้ไข...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3 animate-fadeIn text-xs md:text-sm">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm select-none">
        <div><h1 className="text-sm font-black text-slate-900">แก้ไขข้อมูลผู้ขายประจำคลัง</h1><p className="text-[11px] text-slate-400 font-medium">ปรับปรุงโครงสร้างบัญชี ข้อมูลการสื่อสาร และรายละเอียดเครดิตเทอม</p></div>
        <button type="button" onClick={() => navigate(paths.list)} className="flex items-center gap-1 h-7 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-black transition-all shadow-sm"><ArrowLeft className="w-3 h-3" /><span>กลับหน้าทะเบียน</span></button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <SupplierForm
          onSubmit={handleUpdate}
          defaultValues={supplier}
          loading={loading}
          isEdit={true}
          showCreditFields={true}
          banks={banks}
          branchId={branchId}
          formSyncReady={formSyncReady}
        />
      </div>
    </div>
  );
};

export default SupplierLegacyUpdateWorkspace;
