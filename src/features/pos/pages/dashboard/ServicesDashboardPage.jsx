// src/features/pos/pages/dashboard/ServicesDashboardPage.jsx
import React from 'react';
import HeaderPos from '../../components/header/HeaderPos';
import SidebarLoader from '../../components/sidebar/SidebarLoader';
import SalesBarChart from '../../components/dashboard/SalesBarChart';

const ServicesDashboardPage = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-50">
      
      {/* 🏢 1. แถบเมนูด้านบนสีน้ำเงิน (Dynamic Header แยกชื่อพาร์ตเนอร์) */}
      <HeaderPos />

      <div className="flex flex-1 overflow-hidden">
        
        {/* 🧭 2. แถบเมนูด้านซ้ายสีฟ้า (Dynamic Sidebar Loader ตามสิทธิ์พนักงาน) */}
        <SidebarLoader />

        {/* 📊 3. พื้นที่แสดงผลแดชบอร์ดหลักและกราฟแท่งประมวลผลยอดขาย */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ส่วนหัวแสดงผลภายในแผงควบคุม */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">ภาพรวมระบบร้านค้าพาร์ตเนอร์</h2>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Saduaksabuy SaaS POS Engine v2</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200/50">
              🟢 ระบบเชื่อมต่อคลังสินค้าหน้าร้าน Real-time
            </div>
          </div>

          {/* 💰 กล่องสถิติการเงิน (จำลองตัวเลข 4 ช่องตามภาพดีไซน์) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดขายวันนี้</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">฿12,340</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">จำนวนบิลขาย</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">87</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">จำนวนลูกค้าใหม่</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">64</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">สต๊อกสินค้าคงเหลือ</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">542</div>
            </div>
          </div>

          {/* 📈 4. ตัวเรนเดอร์กราฟแท่ง Recharts ประมวลผลยอดขายรายสัปดาห์ */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <SalesBarChart />
          </div>

        </main>
      </div>

    </div>
  );
};

export default ServicesDashboardPage;