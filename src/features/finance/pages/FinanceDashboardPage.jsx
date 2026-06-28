// src/features/finance/pages/FinanceDashboardPage.jsx
// 🏛️ Advanced Finance Dashboard Hub (Minimal Platinum Light Mode Edition)

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, FileText, UserCheck, ArrowRight, Landmark, BadgeAlert } from 'lucide-react';

// 🟢 PLATINUM SUMMARY CARD: รีสกินเป็นสีขาวนวลลอยเด่น คมชัด อ่านง่าย ตัวหนังสือไม่ล้าสายตา
const SummaryCard = ({ label, value, hint, icon: Icon, tone = 'red' }) => {
  const toneMap = {
    red: 'border-rose-500/20 bg-white text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.01)]',
    orange: 'border-orange-500/20 bg-white text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.01)]',
    purple: 'border-purple-500/20 bg-white text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.01)]',
  };

  const iconMap = {
    red: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    orange: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${toneMap[tone]}`}>
      <div className="space-y-2">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider select-none">{label}</div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {hint && <div className="text-[11px] font-bold text-slate-400 select-none">{hint}</div>}
      </div>
      <div className={`p-3.5 rounded-xl shrink-0 ${iconMap[tone]} select-none`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

// 🟢 PLATINUM ACTION BUTTON: ปรับปุ่มลัดทางการเงินให้เด่น สะอาดตา ทันสมัย
const ActionButton = ({ title, desc, icon: Icon, color = 'blue', onClick }) => {
  const colorMap = {
    blue: 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-orange-500/40 hover:shadow-md',
    purple: 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-orange-500/40 hover:shadow-md',
  };

  const iconTone = {
    blue: 'bg-orange-500/10 border border-orange-500/20 text-orange-600',
    purple: 'bg-orange-500/10 border border-orange-500/20 text-orange-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-5 w-full md:w-auto md:min-w-[320px] rounded-2xl text-left border transition-all duration-200 shadow-sm ${colorMap[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${iconTone[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-black tracking-tight text-slate-900">{title}</div>
          <div className="text-[11px] text-slate-400 font-bold mt-0.5">{desc}</div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
    </button>
  );
};

const FinanceDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🟢 แกะรหัสพาร์ตเนอร์เพื่อสืบทอดเส้นทาง Multi-Tenant สากล[cite: 22]

  return (
    // 🟢 PLATINUM LIGHT MODE OVERHAUL: ล้างความมืดทึมออก เปลี่ยนพื้นหลังเป็นเฉดสว่างเงิน Slate-50 คมชัด สบายตา
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* ================= HEADER LAYOUT CLEAN ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ระบบการเงิน (Finance Command Center)</h1>[cite: 22]
          <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">ภาพรวมลูกหนี้ • เครดิตลูกค้า • การเคลื่อนไหวทางการเงินระดับสาขาพาร์ตเนอร์</p>[cite: 22]
        </div>
        <div className="bg-slate-100 text-purple-700 font-black text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0 self-start sm:self-center select-none">
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
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="select-none">
          <h2 className="text-base font-black text-slate-900">เมนูการจัดการบัญชี</h2>[cite: 22]
          <p className="text-xs text-slate-400 font-bold mt-0.5">เข้าถึงฟีเจอร์การเคลียร์สมุดบัญชีและหนี้สินคงค้างรายสาขา</p>[cite: 22]
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
          {/* 🟢 [DYNAMIC NAVIGATE] สับรางปุ่มกดให้ตรงล็อกโครงสร้างแบนราบลื่นไหล ไม่เด้งกลับหน้าแรก[cite: 22] */}
          <ActionButton
            title="จัดการลูกหนี้ (Accounts Receivable)"
            desc="ตรวจสอบบิลค้างจ่ายและบันทึกตัดชำระหนี้"
            icon={Landmark}
            color="blue"
            onClick={() => navigate(`/${shopSlug}/pos/finance/ar`)} //[cite: 22]
          />

          <ActionButton
            title="ตรวจสอบเครดิตลูกค้า"
            desc="คุมวงเงินและเช็คประวัติการติดหนี้รายบุคคล"
            icon={BadgeAlert}
            color="purple"
            onClick={() => navigate(`/${shopSlug}/pos/finance/customer-credit`)} //[cite: 22]
          />
        </div>
      </div>

    </div>
  );
};

export default FinanceDashboardPage;