// src/features/purchaseOrder/components/PurchaseOrderSupplierSelector.jsx

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import { useAuthStore } from '@/features/auth/store/authStore'; // 🟢 เรียกสเตตกลางร่วมสมทบความปลอดภัย

const PurchaseOrderSupplierSelector = ({ value, onChange, disabled = false, currentBranchId }) => {
  const { suppliers, isSupplierLoading, fetchSuppliersAction } = useSupplierStore();
  
  // 🎯 FALLBACK STRATEGY: ดึงสิทธิ์สาขาของพนักงานปัจจุบันมารองรับกรณีที่แกะ URL Slug ไม่ทัน
  const employeeBranchId = useAuthStore((s) => s.employee?.branchId);

  React.useEffect(() => {
    // ประเมินหาไอดีสาขาที่เร็วที่สุดจากทั้งสองช่องทาง
    const activeBranchId = currentBranchId || employeeBranchId;
    
    if (activeBranchId) {
      if (import.meta.env?.DEV) {
        console.log('🚀 [SupplierSelector] บังคับโหลดซัพพลายเออร์สำหรับสาขา:', activeBranchId);
      }
      fetchSuppliersAction(Number(activeBranchId));
    }
  }, [fetchSuppliersAction, currentBranchId, employeeBranchId]);

  // ดึงค่าไอดีที่เลือกปัจจุบันเป็น String เพื่อผูกกับ UI Component
  const currentSelectValue = value?.id ? String(value.id) : '';

  return (
    <div className="w-full">
      <Select
        value={currentSelectValue}
        onValueChange={(val) => {
          if (!val) return;
          const selected = (suppliers || []).find((s) => String(s.id) === val);
          if (selected) onChange(selected);
        }}
        disabled={disabled || isSupplierLoading}
      >
        <SelectTrigger className="w-full rounded-xl font-bold text-xs text-slate-800 border-slate-200 bg-white">
          <SelectValue placeholder={isSupplierLoading ? "กำลังประมวลผลดึงรายชื่อคู่ค้า..." : "เลือกซัพพลายเออร์ (Supplier)"} />
        </SelectTrigger>

        <SelectContent className="max-h-[280px] z-50">
          {suppliers && suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={String(supplier.id)} className="text-xs font-bold cursor-pointer">
                {supplier.name} {supplier.taxId ? `(Tax: ${supplier.taxId})` : ''}
              </SelectItem>
            ))
          ) : (
            <div className="p-3 text-center text-xs font-bold text-slate-400 italic">
              -- ไม่พบรายชื่อคู่ค้าในระบบของสาขานี้ --
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PurchaseOrderSupplierSelector;