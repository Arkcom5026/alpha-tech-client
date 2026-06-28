// src/features/pos/pages/dashboard/ReportsDashboardPage.jsx
// 🏛️ Advanced Reports & Executive Summary Hub
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — High Contrast Text)
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, ShoppingBag, Receipt, AlertCircle } from 'lucide-react';

// 🟢 [FIXED ALIAS PATH] ชี้เป้าผ่านระบบ Alias ถาวรเพื่อดึงกราฟแท่ง Recharts ตัวจริงมาแสดงผล


// --- Mock Data สถิติตามโครงสร้างเดิม ---
const mockSummary = {
  totalPurchaseMonth: 150500.75,
  orderCountMonth: 45,
  pendingOrders: 8,
};

// ============================================================
// 🧱 Small UI Components (Tailwind CSS + Lucide Icons)
// ============================================================
const SummaryCard = ({ title, value, icon: Icon, tone = 'blue' }) => {
  const toneMap = {
    blue: 'border-slate-200 bg-white text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.01)]',
    green: 'border-slate-200 bg-white text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.01)]',
    amber: 'border-slate-200 bg-white text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.01)]',
  };

  const iconMap = {
    blue: 'bg-blue-50 border border-blue-100 text-blue-600',
    green: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
    amber: 'bg-orange-50 border border-orange-100 text-orange-600',
  };

  return (
    <div className={`flex items-center p-5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${toneMap[tone]}`}>
      <div className={`p-3 rounded-xl mr-4 shrink-0 ${iconMap[tone]} select-none`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider select-none">{title}</div>
        <div className="text-xl font-black text-slate-900 mt-1 leading-none tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 🚀 Main Dashboard Component (Clean Layer เพียวๆ ไม่ซ้อนเมนูแม่)
// ============================================================
export const ReportsDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  const summary = mockSummary;

  // ฟังก์ชันสำหรับจัดรูปแบบตัวเลขการเงินสไตล์สะดวกสะบาย
  const formatCurrency = (num) => {
    if (typeof num !== 'number') return '0.00';
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    // 🟢 PLATINUM LIGHT MODE OVERHAUL: ย้อมสีกราวด์นอกเป็นสีเงินอ่อน ละมุนตา ตัวหนังสือสีกราไฟต์เข้มอ่านง่ายสุด ๆ
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* 🟦 ส่วนหัวแผงควบคุม Dashboard รายงาน สไตล์ Glassmorphism */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Dashboard ภาพรวมรายงาน</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">Procurement & Sales Executive Summary Report</p>
        </div>

        {/* 🟢 FIXED ROUTING BUTTONS: ปรับปุ่มนำทางด้านขวาบนให้ยิงลิงก์ตรงเข้าเป้าหมายที่มีอยู่จริงในระบบ */}
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            type="button"
            onClick={() => navigate(`/${shopSlug}/pos/reports/sales/list`)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black shadow-sm transition active:scale-95 transform"
          >
            รายการขายสินค้า
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${shopSlug}/pos/reports/sales`)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black shadow-sm transition active:scale-95 transform"
          >
            Dashboard การขาย
          </button>
        </div>
      </div>

      {/* 📊 การ์ดสรุปข้อมูลสถิติสามทหารเสือประจำโมดูลรายงาน */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="ยอดซื้อรวม (เดือนนี้)"
          value={`฿${formatCurrency(summary.totalPurchaseMonth)}`}
          icon={Receipt}
          tone="blue"
        />
        <SummaryCard
          title="จำนวนใบสั่งซื้อ (เดือนนี้)"
          value={`${summary.orderCountMonth.toLocaleString('th-TH')} รายการ`}
          icon={ShoppingBag}
          tone="good"
        />
        <SummaryCard
          title="รายการที่ยังไม่ได้รับ"
          value={`${summary.pendingOrders.toLocaleString('th-TH')} รายการ`}
          icon={AlertCircle}
          tone="amber"
        />
      </div>

      {/* 📈 กล่องแสดงผลกราฟแท่งประมวลผล Recharts ตัวจริงเสียงจริง */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="mb-2 select-none">
          <h2 className="text-base font-black text-slate-900">วิเคราะห์ดัชนียอดซื้อและยอดขายสะสม</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">กางแผง Recharts สถิติวิเคราะห์เชิงธุรกิจแบบ Real-time</p>
        </div>
        
        
      </div>

    </div>
  );
};