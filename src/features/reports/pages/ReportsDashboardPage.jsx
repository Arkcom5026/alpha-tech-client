// src/features/pos/pages/dashboard/ReportsDashboardPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, ShoppingBag, Receipt, AlertCircle } from 'lucide-react';

// 🟢 [FIXED ALIAS PATH] ชี้เป้าผ่านระบบ Alias ถาวรเพื่อดึงกราฟแท่ง Recharts ตัวจริงมาแสดงผลอย่างถูกต้อง ไม่หลุดโฟลเดอร์
import SalesBarChart from '@/features/pos/components/dashboard/SalesBarChart';

// --- Mock Data สถิติตามโครงสร้างเดิมของกัปตัน ---
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
    blue: 'bg-blue-50/60 border-blue-200 text-blue-900 dark:bg-zinc-900',
    green: 'bg-emerald-50/60 border-emerald-200 text-emerald-900 dark:bg-zinc-900',
    amber: 'bg-amber-50/60 border-amber-200 text-amber-900 dark:bg-zinc-900',
  };

  const iconMap = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  };

  return (
    <div className={`flex items-center p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm ${toneMap[tone]}`}>
      <div className={`p-3 rounded-xl mr-4 shrink-0 ${iconMap[tone]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">{title}</div>
        <div className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-none">
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
  const { shopSlug } = useParams(); // แกะรหัสพาร์ตเนอร์เพื่อสืบทอดเลน URL มิติคู่ขนาน

  const summary = mockSummary;

  // ฟังก์ชันสำหรับจัดรูปแบบตัวเลขการเงินสไตล์สะดวกสะบาย
  const formatCurrency = (num) => {
    if (typeof num !== 'number') return '0.00';
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 🟦 ส่วนหัวแผงควบคุม Dashboard รายงาน */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Dashboard ภาพรวมรายงาน</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Procurement & Sales Executive Summary Report</p>
        </div>

        {/* ปุ่มนำทางความเร็วสูง สลับไปหน้ารายงานย่อย */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`/${shopSlug}/pos/reports/daily`)}
            className="bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold shadow-sm transition"
          >
            รายงานรายวัน
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${shopSlug}/pos/reports/monthly`)}
            className="bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold shadow-sm transition"
          >
            รายงานรายเดือน
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
          tone="green"
        />
        <SummaryCard
          title="รายการที่ยังไม่ได้รับ"
          value={`${summary.pendingOrders.toLocaleString('th-TH')} รายการ`}
          icon={AlertCircle}
          tone="amber"
        />
      </div>

      {/* 📈 กล่องแสดงผลกราฟแท่งประมวลผล Recharts ตัวจริงเสียงจริง */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div className="mb-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white">วิเคราะห์ดัชนียอดซื้อและยอดขายสะสม</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">กางแผง Recharts สถิติวิเคราะห์เชิงธุรกิจแบบ Real-time</p>
        </div>
        

      </div>

    </div>
  );
};

export default ReportsDashboardPage;