// src/features/finance/pages/FinanceDashboardPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, FileText, UserCheck, ArrowRight, Landmark, BadgeAlert } from 'lucide-react';

// 🟢 NEW STYLE SUMMARY CARD: แปลงโฉมตัวการ์ดจากสีขาวสว่างให้หล่อเข้มแบบดาร์กโหมดพรีเมียม
const SummaryCard = ({ label, value, hint, icon: Icon, tone = 'red' }) => {
  const toneMap = {
    red: 'border-rose-500/20 bg-zinc-900/60 text-white',
    orange: 'border-amber-500/20 bg-zinc-900/60 text-white',
    purple: 'border-purple-500/20 bg-zinc-900/60 text-white',
  };

  const iconMap = {
    red: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    orange: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${toneMap[tone]}`}>
      <div className="space-y-2">
        <div className="text-xs font-black text-zinc-400 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        {hint && <div className="text-[11px] font-bold text-zinc-500">{hint}</div>}
      </div>
      <div className={`p-3.5 rounded-xl shrink-0 ${iconMap[tone]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

// 🟢 NEW STYLE ACTION BUTTON: ปรับปุ่มลัดทางการเงินให้ออกโทนทองส้มหรูหราดุดัน
const ActionButton = ({ title, desc, icon: Icon, color = 'blue', onClick }) => {
  const colorMap = {
    blue: 'bg-zinc-800 text-zinc-100 border-zinc-700/80 hover:bg-zinc-700 hover:text-white hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    purple: 'bg-zinc-800 text-zinc-100 border-zinc-700/80 hover:bg-zinc-700 hover:text-white hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
  };

  const iconTone = {
    blue: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
    purple: 'bg-orange-500/10 border border-orange-500/20 text-orange-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-5 w-full md:w-auto md:min-w-[320px] rounded-2xl text-left border transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${colorMap[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${iconTone[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-black tracking-tight text-white">{title}</div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">{desc}</div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
    </button>
  );
};

const FinanceDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🟢 แกะรหัสพาร์ตเนอร์เพื่อสืบทอดเส้นทาง Multi-Tenant สากล

  return (
    // 🟢 FIXED: สับสายสีกราวด์รากฐานนอกสุดเป็น bg-slate-900 และคุมความหนา p-6 เพื่อดันมิติการ์ดลอยขึ้นมาให้เข้าชุดเป๊ะ ๆ
    <div className="space-y-6 animate-fadeIn p-6 bg-slate-900 min-h-screen text-white">
      
      {/* ================= HEADER LAYOUT CLEAN ================= */}
      {/* 🟢 FIXED: สลักการ์ด Header บอร์ดการเงินจากสีขาวเป็นการ์ดสีมืดระดับพรีเมียม bg-zinc-900 ตัดกรอบบางประณีต */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-white">ระบบการเงิน (Finance Command Center)</h1>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">ภาพรวมลูกหนี้ • เครดิตลูกค้า • การเคลื่อนไหวทางการเงินระดับสาขาพาร์ตเนอร์</p>
        </div>
        <div className="bg-zinc-800 text-purple-400 font-black text-xs px-3 py-1.5 rounded-xl border border-zinc-700 shrink-0 self-start sm:self-center">
          💰 บัญชีและการเงิน
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="ยอดค้างรวม"
          value="฿0.00"
          hint="รวมยอดที่ยังไม่ได้ชำระทั้งหมด"
          icon={Wallet}
          tone="red"
        />
        <SummaryCard
          label="จำนวนบิลค้าง"
          value="0 บิล"
          hint="ใบเสร็จที่สถานะยังไม่ครบถ้วน"
          icon={FileText}
          tone="orange"
        />
        <SummaryCard
          label="เครดิตลูกค้าที่ใช้งาน"
          value="0 ราย"
          hint="ลูกค้าที่มีวงเงินหรือยอดค้าง"
          icon={UserCheck}
          tone="purple"
        />
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      {/* 🟢 FIXED: ล้างสีพื้นหลัง bg-white ออก สวมรอยด้วยสกินสีมืด bg-zinc-900 รองรับโครงสร้างสมมาตรภาพรวมทั้งหมด */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-black text-white">เมนูการจัดการบัญชี</h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">เข้าถึงฟีเจอร์การเคลียร์สมุดบัญชีและหนี้สินคงค้างรายสาขา</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
          {/* 🟢 [DYNAMIC NAVIGATE] สับรางปุ่มกดให้ตรงล็อกโครงสร้างแบนราบลื่นไหล ไม่เเด้งกลับหน้าแรก */}
          <ActionButton
            title="จัดการลูกหนี้ (Accounts Receivable)"
            desc="ตรวจสอบบิลค้างจ่ายและบันทึกตัดชำระหนี้"
            icon={Landmark}
            color="blue"
            onClick={() => navigate(`/${shopSlug}/pos/finance/ar`)}
          />

          <ActionButton
            title="ตรวจสอบเครดิตลูกค้า"
            desc="คุมวงเงินและเช็คประวัติการติดหนี้รายบุคคล"
            icon={BadgeAlert}
            color="purple"
            onClick={() => navigate(`/${shopSlug}/pos/finance/customer-credit`)}
          />
        </div>
      </div>

    </div>
  );
};

export default FinanceDashboardPage;