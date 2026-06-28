// src/features/pos/pages/DashboardPage.jsx
// 🏛️ Next-Gen SaaS Edition: (Pure Realtime Summary Cards - Stable Core Deployment)
// 🎨 Minimal Platinum Light Mode Overhaul: (User Feedback Optimized — High Contrast Layout)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Store, BarChart3, Receipt, Users, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react';

const DashboardPage = () => {
  const { shopSlug } = useParams();
  const activeSlug = shopSlug || 'advancetech';

  const [storeName, setStoreName] = useState('กำลังเชื่อมต่อฐานข้อมูลพันธมิตร...');
  const [businessTypeLabel, setBusinessTypeLabel] = useState('กำลังประมวลผล...');
  
  const [stats, setStats] = useState({
    todaySales: 0,
    billCount: 0,
    newCustomers: 0,
    activeStock: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingStats(true);
      try {
        const profileRes = await axios.get(`/api/branch-prices/profile-by-slug/${activeSlug}`);
        if (profileRes.data) {
          setStoreName(profileRes.data.name || 'ร้านค้าพันธมิตร');
          setBusinessTypeLabel(profileRes.data.businessType || 'ทั่วไป');
        }

        const statsRes = await axios.get(`/api/pos/dashboard/summary-stats?slug=${activeSlug}`);
        if (statsRes.data) {
          setStats({
            todaySales: statsRes.data.todaySales || 0,
            billCount: statsRes.data.billCount || 0,
            newCustomers: statsRes.data.newCustomers || 0,
            activeStock: statsRes.data.activeStock || 0
          });
        }
      } catch (err) {
        console.error('[Dashboard Live Fetch Error]', err);
        setStoreName(shopSlug ? `ร้านค้าพันธมิตร (${shopSlug})` : 'ร้านค้าพันธมิตร');
        setBusinessTypeLabel('ทั่วไป');
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [activeSlug, shopSlug]);

  // 🟢 FIXED: รีสกิน Shimmer สเกเลตอนให้เป็นโทนสว่างนวลตา เข้ากับโหมดสว่างใหม่
  const ShimmerSkeleton = () => (
    <div className="w-full space-y-3">
      <div className="h-4 bg-slate-200/80 animate-pulse rounded-md w-1/2" />
      <div className="h-8 bg-slate-200/80 animate-pulse rounded-xl w-3/4" />
      <div className="h-3 bg-slate-200/80 animate-pulse rounded-md w-2/3" />
    </div>
  );

  return (
    // 🟢 PLATINUM LIGHT MODE OVERHAUL: เปลี่ยนฉากหลักเป็นสีเงิน Slate-50 ล้างคราบความมืดทึมออกทั้งหมด
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-6 space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white overflow-hidden animate-fadeIn font-sans">
      
      {/* 🏢 1. แผงหัวเสาแบรนดิ้ง (ปรับเป็นกล่องขาวลอยโมเดิร์นคลีน) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300 ease-out relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.01] to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{storeName}</h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
              โครงสร้างเทนเนนท์: <span className="text-orange-600 font-black">{businessTypeLabel}</span>
            </p>
          </div>
        </div>
        
        <div className="sm:self-center shrink-0 self-start bg-slate-100 text-orange-700 font-black text-[10px] tracking-widest px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 select-none uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
          <span>Multi-Tenant Verified</span>
        </div>
      </div>

      {/* 📊 2. แผงกล่องข้อมูลอัจฉริยะ (การ์ดพื้นขาวตัดฟอนต์เข้ม คมชัด สบายตา) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* การ์ดที่ 1: ยอดขายวันนี้ */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md hover:border-orange-500/40 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10 select-none">
                <span className="text-[11px] font-black text-orange-700 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" /> Live Sales
                </span>
                <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight relative z-10">
                ฿{stats.todaySales.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 relative z-10 select-none">
                <span className="text-[10px] text-slate-400 font-black font-sans">Saduaksabuy Engine</span>
                <ArrowUpRight className="w-3 h-3 text-orange-600 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

        {/* การ์ดที่ 2: จำนวนบิล */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md hover:border-emerald-500/40 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10 select-none">
                <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Tickets
                </span>
                <Receipt className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight relative z-10">
                {stats.billCount.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 relative z-10 select-none">
                <span className="text-[10px] text-slate-400 font-black font-sans">อัปเดตผ่าน Realtime API</span>
                <ArrowUpRight className="w-3 h-3 text-orange-600 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

        {/* การ์ดที่ 3: Traffic ลูกค้า */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md hover:border-blue-500/40 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10 select-none">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Traffic
                </span>
                <Users className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight relative z-10">
                {stats.newCustomers.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 relative z-10 select-none">
                <span className="text-[10px] text-slate-400 font-black font-sans">พิกัด Hyperlocal Radar</span>
                <ArrowUpRight className="w-3 h-3 text-orange-600 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

        {/* การ์ดที่ 4: สต๊อกสินค้าคงเหลือ */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md hover:border-amber-500/40 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10 select-none">
                <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Stock
                </span>
                <Layers className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 tracking-tight relative z-10">
                {stats.activeStock.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 relative z-10 select-none">
                <span className="text-[10px] text-slate-400 font-black font-sans">Live Inventory Control</span>
                <ArrowUpRight className="w-3 h-3 text-orange-600 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

      </div>

      {/* 📊 3. แผงจำลองกราฟฟิกดีไซน์ (ปรับเป็นขาวขอบประเงิน คลีน สว่าง) */}
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 shadow-[0_4px_25px_rgba(0,0,0,0.01)] text-center select-none">
        <div className="text-orange-600 text-3xl mb-2">📊</div>
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">โมดูลดัชนีวิเคราะห์ยอดขายสะสมรายสัปดาห์</h4>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">ระบบดักสแตนด์บายโครงสร้างข้อมูลกราฟิกเพื่อเตรียมเชื่อมต่อ Live API ดีไซน์ใหม่</p>
      </div>

    </div>
  );
};

export default DashboardPage;