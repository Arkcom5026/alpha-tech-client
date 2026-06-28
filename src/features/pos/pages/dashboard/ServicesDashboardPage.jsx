// src/features/pos/pages/dashboard/ServicesDashboardPage.jsx
// 🏛️ Services Desk Dashboard Hub (Minimal Platinum Light Mode Edition)
// 🎨 การันตีแมปคู่สิทธิ์ Named Import ร่วมกับไฟล์เส้นทางเดินรถหลัก

import React from 'react';
import { useParams } from 'react-router-dom';
import { Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ServicesDashboardPage = () => {
  const { shopSlug } = useParams();

  return (
    // 🟢 PLATINUM CLEAN REFIT: สลัดแผงเมนูส่วนเกินที่ซ้อนเบิ้ลออก ปล่อยให้ Layout สากลควบคุมเลเยอร์สว่างนวลตา
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* ================= 🟦 1. ส่วนหัวบอร์ดสไตล์ Glassmorphism คลีนแพลทินัม ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all select-none">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ศูนย์ควบคุมงานบริการ (Service Desk)</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">Saduaksabuy SaaS POS Service Desk & Maintenance Operations</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-200/50 shadow-sm shrink-0 self-start sm:self-center flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ระบบเชื่อมต่อไอทีซัพพอร์ต Real-time
        </div>
      </div>

      {/* ================= 📊 2. กล่องสถิติสี่ทหารเสือประจำโมดูลงานบริการ (คมชัดสูง อ่านง่ายมาก) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:shadow-md">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">งานซ่อมส่งเคลมวันนี้</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums">0 รายการ</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1.5">บิลส่งเคลมไอทีซัพพลายเออร์</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:shadow-md">
          <div className="text-[11px] font-black text-orange-600 uppercase tracking-wider">อยู่ระหว่างซ่อมแซม</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums">0 รายการ</div>
          <div className="text-[10px] text-orange-600 font-black mt-1.5 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> รออะไหล่/Pending Parts
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:shadow-md">
          <div className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">ซ่อมเสร็จพร้อมส่งมอบ</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums">0 รายการ</div>
          <div className="text-[10px] text-emerald-600 font-black mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> แจ้งลูกค้าเข้ารับได้ทันที
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:shadow-md">
          <div className="text-[11px] font-black text-blue-600 tracking-wider">ประวัติปิดงานสะสม</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums">0 งาน</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1.5">สรุปงวดงานช่างรายเดือน</div>
        </div>

      </div>

      {/* ================= 📈 3. กล่องแสตนด์บายตารางข้อมูลสไตล์ประเงินพรีเมียม ================= */}
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 shadow-[0_4px_25px_rgba(0,0,0,0.01)] text-center select-none">
        <div className="text-orange-600 text-3xl mb-2">🛠️</div>
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">模組系統 🟢 โมดูลระบบบันทึกจ๊อบงานซ่อมและเคลมสินค้าไอที</h4>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">โครงสร้างฝั่งหน้าบ้านสแตนด์บายเรียบร้อย — รอผูกชุดฐานข้อมูลจัดหมวดหมู่ตั๋วซ่อมในสเต็ปถัดไป</p>
      </div>

    </div>
  );
};

// 🟢 ทำการส่งออกทั้งแบบ Default รองรับท่อนำเข้าทุกรูปแบบเพื่อความเสถียรสูงสุด
export default ServicesDashboardPage;