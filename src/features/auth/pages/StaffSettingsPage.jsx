// src/features/auth/pages/StaffSettingsPage.jsx
// Staff Settings Page (Sub-Employee Command Center)

import React from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import SubEmployeeManager from '../components/SubEmployeeManager';
import { FaUsers, FaUserShield, FaIdCardAlt } from 'react-icons/fa';

const StaffSettingsPage = () => {
  const employee = useAuthStore((state) => state.employee || null);
  const isAdminOrAbove = useAuthStore((state) => state.isAdminOrAboveSelector?.() || false);

  if (!isAdminOrAbove) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-2xl flex items-center justify-center text-2xl mb-4">
          <FaUserShield />
        </div>
        <h2 className="text-base font-black tracking-tight">ปฏิเสธการเข้าถึง</h2>
        <p className="text-xs text-slate-500 font-medium mt-1 text-center max-w-sm">
          เฉพาะบัญชีเจ้าของร้าน (Owner) หรือผู้จัดการสาขาที่มีสิทธิ์ดูแลพนักงานเท่านั้นที่สามารถเข้าถึงหน้านี้ได้
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/40 text-slate-900 p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(249,115,22,0.08),transparent_32%)] pointer-events-none" />

        <div className="flex items-center gap-4 relative">
          <div className="w-12 h-12 bg-orange-50 border border-orange-200 text-orange-500 rounded-2xl flex items-center justify-center text-xl shadow-sm">
            <FaUsers />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-slate-950">ตั้งค่าระบบพนักงาน</h1>
            <p className="text-[11px] text-slate-500 font-bold mt-1.5 tracking-wide">
              ควบคุมกำลังพล สิทธิ์การใช้งาน และจัดสรรบัญชีผู้รับผิดชอบเครื่อง POS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl self-start sm:self-center relative">
          <FaIdCardAlt className="text-slate-400 text-xs" />
          <div className="text-left">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">สาขาปฏิบัติการ</p>
            <p className="text-xs font-black text-slate-700 mt-1 leading-none">
              {employee?.branchSlug ? `@${employee.branchSlug}` : 'สาขาหลัก'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <SubEmployeeManager />
      </div>
    </div>
  );
};

export default StaffSettingsPage;
