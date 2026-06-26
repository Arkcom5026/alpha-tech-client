// src/features/supplier/pages/ListSupplierPage.jsx
// 🏛️ Premium Next-Gen Influx Registry Center: (Lean Pure Data Architecture)

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SupplierTable from '../components/SupplierTable';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useSupplierStore from '../store/supplierStore';
import { Plus, Building2 } from 'lucide-react';

const ListSupplierPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const token = useAuthStore((state) => state.token);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const { suppliers, fetchSuppliersAction, deleteSupplierAction } = useSupplierStore();

  const targetSlug = shopSlug || 'advancetech';

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
  }, [token, selectedBranchId, fetchSuppliersAction]);

  if (!selectedBranchId) {
    return (
      <div className="w-full text-center py-12 text-slate-400 font-bold select-none border border-dashed rounded-xl bg-slate-50 animate-fadeIn text-xs md:text-sm">
        📭 กรุณาทำการเลือกสาขาของระบบร้านค้าก่อนเรียกดูบัญชีรายชื่อผู้ขายครับ
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 max-w-[1600px] mx-auto text-slate-800 animate-fadeIn text-xs md:text-sm">
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold select-none italic tracking-wide">
          ⏳ กำลังเรียกตรวจบัญชีทะเบียนคู่ค้าส่วนกลาง...
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl shadow-sm text-center space-y-3 select-none flex flex-col items-center justify-center">
          <div className="p-3 bg-slate-100 rounded-full text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-900 font-black">ยังไม่มีข้อมูลบัญชีผู้ขายในสาขานี้</p>
            <p className="text-[11px] text-slate-400 font-medium">ลงทะเบียนรายชื่อบริษัทคู่ค้า ซัพพลายเออร์ เพื่อใช้ผูกข้อมูลในใบสั่งซื้อและใบรับสินค้า</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/${targetSlug}/pos/purchases/suppliers/create`)}
            className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ลงทะเบียนผู้ขายรายแรก</span>
          </button>
        </div>
      ) : (
        <SupplierTable suppliers={suppliers} onDelete={handleDeleteSupplier} />
      )}
    </div>
  );
};

export default ListSupplierPage;