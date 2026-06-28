// src/features/settings/pages/SettingsDashboardPage.jsx
// 🏛️ Advanced Multi-Tenant Settings Dashboard Hub
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — High Contrast Text)

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, UserPlus, ShieldAlert, Building2, Landmark, ArrowRight, KeyRound } from 'lucide-react';

// ============================================================
// 🧱 Small UI Components (Tailwind CSS + Lucide Icons)
// ============================================================
const SettingTile = ({ title, desc, icon: Icon, onClick, isHighlight = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      // 🟢 PLATINUM TILE REFIT: เปลี่ยนผิวกระเบื้องปุ่มกดเป็นเฉดสว่าง คมชัดสูง อ่านง่ายสบายตา
      className={`group w-full border rounded-2xl p-5 text-left flex items-start justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        isHighlight 
          ? 'bg-gradient-to-br from-slate-900 to-zinc-900 border-orange-500/30 shadow-orange-500/5 hover:border-orange-500/60' 
          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-orange-500/40'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-3 rounded-xl shrink-0 transition-colors ${
          isHighlight
            ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20'
            : 'bg-slate-100 text-slate-500 group-hover:bg-orange-500/10 group-hover:text-orange-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className={`font-black text-sm tracking-tight truncate flex items-center gap-2 ${
            isHighlight ? 'text-white' : 'text-slate-900'
          }`}>
            {title}
            {isHighlight && (
              <span className="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider select-none">
                Active Engine
              </span>
            )}
          </div>
          {desc && <div className={`text-xs mt-0.5 font-bold leading-snug ${
            isHighlight ? 'text-zinc-400' : 'text-slate-400'
          }`}>{desc}</div>}
        </div>
      </div>
      <ArrowRight className={`w-4 h-4 mt-1 shrink-0 transition-colors ${
        isHighlight 
          ? 'text-orange-400/50 group-hover:text-orange-400' 
          : 'text-slate-300 group-hover:text-slate-600'
      }`} />
    </button>
  );
};

// ============================================================
// 🚀 Main Component (Clean Layer เพียวๆ ไม่ซ้อนเมนูแม่)
// ============================================================
const SettingsDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🟢 แกะรหัสพาร์ตเนอร์เพื่อสืบทอดเลน URL มิติคู่ขนาน

  return (
    // 🟢 PLATINUM MAIN CONTAINER: แปลงเป็นโครงสร้างสีสว่างสลักเฉดสีเงิน Slate-50 สวยงามนุ่มนวลต่อสายตา
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* ================= HEADER LAYOUT CLEAN ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ศูนย์การตั้งค่าระบบร้านค้า</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">จัดการบุคลากร ตรวจสอบข้อมูลสาขาออนไลน์ และช่องทางธุรกรรมสำหรับพาร์ตเนอร์ร้านค้า</p>
        </div>
        <div className="bg-slate-100 text-orange-700 font-black text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0 self-start sm:self-center select-none">
          ⚙️ ตั้งค่าระบบ
        </div>
      </div>

      {/* ================= SETTINGS GRID TILES ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="select-none">
          <h2 className="text-base font-black text-slate-900">เมนูจัดการระบบ</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">เลือกหัวข้อหลักที่ต้องการแก้ไขสิทธิ์และตรวจสอบข้อมูลเชิงโครงสร้าง</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          
          {/* 👥 🟢 [ADDED HIGH-ACCURACY LINK] ปุ่มไทล์เปิดหน้าจัดการสิทธิ์พนักงานย่อยแชร์สาขา */}
          <SettingTile 
            title="จัดการสิทธิ์พนักงานย่อย" 
            desc="เปิดสิทธิ์ สร้างบัญชีทีมงาน และแชร์รหัสสาขาประจำเครื่อง POS" 
            icon={KeyRound}
            isHighlight={true}
            onClick={() => navigate(`/${shopSlug}/pos/settings/staff`)}
          />

          <SettingTile 
            title="รายชื่อพนักงาน" 
            desc="จัดการสิทธิ์ ปรับปรุงโปรไฟล์ และสถานะพนักงานภายในสาขา" 
            icon={Users}
            onClick={() => navigate(`/${shopSlug}/pos/settings/employee`)}
          />
          
          <SettingTile 
            title="อนุมัติพนักงานใหม่" 
            desc="ตรวจสอบสถานะและอนุมัติสิทธิ์การเข้าระบบของพนักงานยื่นสมัคร" 
            icon={UserPlus}
            onClick={() => navigate(`/${shopSlug}/pos/settings/approve`)}
          />
          
          <SettingTile 
            title="จัดการตำแหน่งงาน" 
            desc="กำหนดขอบเขตและเงื่อนไขการเข้าถึงฟังก์ชันตามตำแหน่ง" 
            icon={ShieldAlert}
            onClick={() => navigate(`/${shopSlug}/pos/settings/positions`)}
          />
          
          {/* 🏢 [ONLINE SPECIFICATION UPDATE] ปรับแต่งข้อมูลคำอธิบายการ์ดสาขาให้สอดคล้องกับระบบสมัครออนไลน์ภายนอก */}
          <SettingTile 
            title="จัดการสาขา" 
            desc="ตรวจสอบรายชื่อพิกัด สถานะ และข้อมูลของสาขาที่ลงทะเบียนออนไลน์" 
            icon={Building2}
            onClick={() => navigate(`/${shopSlug}/pos/settings/branches`)}
          />
          
          <SettingTile 
            title="จัดการธนาคาร" 
            desc="ผูกบัญชีข้อมูลธนาคารสำหรับทำธุรกรรม รับ/จ่าย เงิน หน้าน้าน" 
            icon={Landmark}
            onClick={() => navigate(`/${shopSlug}/pos/settings/bank`)}
          />
        </div>
      </div>

    </div>
  );
};

export default SettingsDashboardPage;