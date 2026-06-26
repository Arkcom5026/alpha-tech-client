// src/features/settings/pages/SettingsDashboardPage.jsx
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
      // 🟢 FIXED: เปลี่ยนโครงสีไทล์เมนูธรรมดาจาก bg-white เป็นสีมืดเข้มรับธีมพรีเมียม (bg-zinc-900/60)
      className={`group w-full border rounded-2xl p-5 text-left flex items-start justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        isHighlight 
          ? 'bg-gradient-to-br from-slate-900 to-zinc-900 border-orange-500/30 shadow-orange-500/5 hover:border-orange-500/60' 
          : 'bg-zinc-900/60 border-zinc-800/80 text-white hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-3 rounded-xl shrink-0 transition-colors ${
          isHighlight
            ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20'
            : 'bg-zinc-800 text-zinc-300 group-hover:bg-amber-500/10 group-hover:text-amber-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-white tracking-tight truncate flex items-center gap-2">
            {title}
            {isHighlight && (
              <span className="text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Active Engine
              </span>
            )}
          </div>
          {desc && <div className="text-xs text-zinc-400 mt-0.5 font-medium leading-snug">{desc}</div>}
        </div>
      </div>
      <ArrowRight className={`w-4 h-4 mt-1 shrink-0 transition-colors ${
        isHighlight 
          ? 'text-orange-400/50 group-hover:text-orange-400' 
          : 'text-zinc-600 group-hover:text-zinc-400'
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
    // 🟢 FIXED: เพิ่ม padding ภายในครอบตัวเพจ (p-6) และกำหนดพื้นหลังสีมืดสนิท (bg-slate-950) เต็มความสูงพื้นที่ทำงาน
    <div className="space-y-6 animate-fadeIn p-6 bg-slate-950 min-h-screen">
      
      {/* ================= HEADER LAYOUT CLEAN ================= */}
      {/* 🟢 FIXED: ล้าง bg-white ออก เปลี่ยนร่างเป็นการ์ดสีมืดระดับพรีเมียม (bg-zinc-900) ดุดันและคมคายขึ้นทันที */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-white">ศูนย์การตั้งค่าระบบร้านค้า</h1>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">จัดการบุคลากร ตรวจสอบข้อมูลสาขาออนไลน์ และช่องทางธุรกรรมสำหรับพาร์ตเนอร์ร้านค้า</p>
        </div>
        <div className="bg-zinc-800 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-zinc-700 shrink-0 self-start sm:self-center">
          ⚙️ ตั้งค่าระบบ
        </div>
      </div>

      {/* ================= SETTINGS GRID TILES ================= */}
      {/* 🟢 FIXED: ล้างสี bg-white ออก สวมรอยด้วยสกินสีมืดรับการขยายตัวชนขอบจออย่างสมบูรณ์ */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-black text-white">เมนูจัดการระบบ</h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">เลือกหัวข้อหลักที่ต้องการแก้ไขสิทธิ์และตรวจสอบข้อมูลเชิงโครงสร้าง</p>
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