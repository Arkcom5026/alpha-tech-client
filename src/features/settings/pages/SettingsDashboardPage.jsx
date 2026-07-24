// src/features/settings/pages/SettingsDashboardPage.jsx
// 🏛️ Advanced Multi-Tenant Settings Dashboard Hub
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — High Contrast Text)

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ShieldAlert, Building2, Landmark, ArrowRight, KeyRound } from 'lucide-react';

const SettingTile = ({ title, desc, icon: Icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full border border-slate-200/80 rounded-2xl bg-white p-5 text-left text-slate-700 flex items-start justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-slate-50 hover:border-orange-500/40"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-3 rounded-xl shrink-0 bg-slate-100 text-slate-500 transition-colors group-hover:bg-orange-500/10 group-hover:text-orange-600">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-black text-sm tracking-tight truncate text-slate-900">
            {title}
          </div>
          {desc && (
            <div className="text-xs mt-0.5 font-bold leading-snug text-slate-400">
              {desc}
            </div>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-slate-600" />
    </button>
  );
};

const SettingsDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ศูนย์การตั้งค่าระบบร้านค้า</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">จัดการพนักงาน ตำแหน่ง สาขา และช่องทางธุรกรรมของร้านจากจุดเดียว</p>
        </div>
        <div className="bg-slate-100 text-orange-700 font-black text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0 self-start sm:self-center select-none">
          ⚙️ ตั้งค่าระบบ
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="select-none">
          <h2 className="text-base font-black text-slate-900">เมนูจัดการระบบ</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">เพิ่มพนักงานใหม่ได้ทันที และจัดการข้อมูลภายหลังได้จากหน้ารวมพนักงาน</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <SettingTile
            title="เพิ่มพนักงานใหม่"
            desc="สร้างบัญชี กำหนดบทบาท และส่งข้อมูลเข้าสู่ระบบให้พร้อมใช้งานในครั้งเดียว"
            icon={KeyRound}
            onClick={() => navigate(`/${shopSlug}/pos/settings/staff`)}
          />

          <SettingTile
            title="จัดการพนักงาน"
            desc="ดูรายชื่อ แก้ไขข้อมูล เปลี่ยนสถานะ และจัดการพนักงานภายในสาขา"
            icon={Users}
            onClick={() => navigate(`/${shopSlug}/pos/settings/employee`)}
          />

          <SettingTile
            title="ตำแหน่งงาน"
            desc="กำหนดและจัดระเบียบตำแหน่งงานภายในร้าน"
            icon={ShieldAlert}
            onClick={() => navigate(`/${shopSlug}/pos/settings/positions`)}
          />

          <SettingTile
            title="จัดการสาขา"
            desc="ตรวจสอบรายชื่อพิกัด สถานะ และข้อมูลของสาขาที่ลงทะเบียนออนไลน์"
            icon={Building2}
            onClick={() => navigate(`/${shopSlug}/pos/settings/branches`)}
          />

          <SettingTile
            title="จัดการธนาคาร"
            desc="ผูกบัญชีธนาคารสำหรับธุรกรรมรับและจ่ายเงินของร้าน"
            icon={Landmark}
            onClick={() => navigate(`/${shopSlug}/pos/settings/bank`)}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboardPage;