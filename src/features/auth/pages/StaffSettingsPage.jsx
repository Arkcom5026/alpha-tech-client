// src/features/auth/pages/StaffSettingsPage.jsx
// 🏛️ Staff Settings Page (Sub-Employee Command Center)

import React from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import SubEmployeeManager from '../components/SubEmployeeManager';
import { FaUsers, FaUserShield, FaIdCardAlt } from 'react-icons/fa';

const StaffSettingsPage = () => {
  // 🟢 ดึงข้อมูลผู้ใช้งานและตรวจสอบสิทธิ์จาก Zustand Store
  const employee = useAuthStore((state) => state.employee || null);
  const isAdminOrAbove = useAuthStore((state) => state.isAdminOrAboveSelector?.() || false);

  // 🔒 ดักตรวจสอบสิทธิ์หน้าบ้าน: ถ้าไม่ใช่ Owner หรือผู้จัดการระดับ Admin จะไม่แสดงฟอร์มเพิ่มพนักงาน
  if (!isAdminOrAbove) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-slate-950 text-white rounded-3xl border border-slate-900 shadow-xl">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
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
    <div className="w-full min-h-screen bg-slate-800 text-white p-6 space-y-6 animate-fadeIn">
      
      {/* 🏛️ TOP BARS / INFO CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(249,115,22,0.03),transparent_30%)] pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center text-xl shadow-inner">
            <FaUsers />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">ตั้งค่าระบบพนักงาน</h1>
            <p className="text-[11px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">
              ควบคุมกำลังพล สิทธิ์การใช้งาน และจัดสรรบัญชีผู้รับผิดชอบเครื่อง POS
            </p>
          </div>
        </div>

        {/* กล่องบอกสาขาปัจจุบันของผู้ควบคุมระบบ */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl self-start sm:self-center">
          <FaIdCardAlt className="text-slate-600 text-xs" />
          <div className="text-left">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">สาขาปฏิบัติการ</p>
            <p className="text-xs font-black text-slate-300 mt-1 leading-none">
              {employee?.branchSlug ? `@${employee.branchSlug}` : 'สาขาหลัก'}
            </p>
          </div>
        </div>
      </div>

      {/* 👥 2. เรียกใช้งานฟอร์มเพิ่มพนักงานย่อย */}
      <div className="w-full">
        <SubEmployeeManager />
      </div>

    </div>
  );
};

export default StaffSettingsPage;