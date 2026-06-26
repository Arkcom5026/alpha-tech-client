// src/features/pos/pages/DashboardPage.jsx
// 🏛️ Next-Gen SaaS Edition: (Pure Realtime Summary Cards - Stable Core Deployment)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Store, BarChart3, Receipt, Users, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react';

// 🛑 ถอนบรรทัดการ Import SalesBarChart ที่โดนลบทิ้งออกไปเรียบร้อยแล้ว เพื่อป้องกันโค้ดพัง

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

  // 🟢 FIXED: รีสกิน Shimmer สเกเลตอนให้สว่างนวลตาในโหมดมืด ป้องกันแสงโดดขัดตา
  const ShimmerSkeleton = () => (
    <div className="w-full space-y-3">
      <div className="h-4 bg-zinc-800 animate-pulse rounded-md w-1/2" />
      <div className="h-8 bg-zinc-800 animate-pulse rounded-xl w-3/4" />
      <div className="h-3 bg-zinc-800 animate-pulse rounded-md w-2/3" />
    </div>
  );

  return (
    // 🟢 FIXED: เปลี่ยนพื้นหลังรากฐานเป็น bg-slate-900 และคง p-6 ไว้เพื่อสร้างมิติตัดขอบการ์ดลอยแบบ Layered Depth ที่ต้องการ
    <div className="w-full min-h-screen bg-slate-900 p-6 space-y-6 text-white selection:bg-orange-500 selection:text-white overflow-hidden animate-fadeIn">
      
      {/* 🏢 1. แผงหัวเสาแบรนดิ้ง */}
      {/* 🟢 FIXED: คงการ์ดสีมืดระดับพรีเมียม (bg-zinc-900) ดุดันเข้ากับหน้าจอการตั้งค่า */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-out relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.02] to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          {/* 🟢 FIXED: คงโครงสีไอคอนหน้าร้านค้าพันธมิตรให้โดดเด่นตัดขอบทองส้มรับธีมพรีเมียม */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight leading-tight">{storeName}</h2>
            <p className="text-xs text-zinc-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
              โครงสร้างเทนเนนท์: <span className="text-orange-400 font-black">{businessTypeLabel}</span>
            </p>
          </div>
        </div>
        {/* 🟢 FIXED: คงตรายืนยันระดับโมดูลให้เป็นสกินดาร์กพรีเมียม */}
        <div className="sm:self-center shrink-0 self-start bg-zinc-800 text-orange-400 font-black text-[10px] tracking-widest px-4 py-2 rounded-2xl border border-zinc-700 shadow-sm flex items-center gap-2 select-none uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Multi-Tenant Verified</span>
        </div>
      </div>

      {/* 📊 2. แผงกล่องข้อมูลอัจฉริยะ */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* การ์ดที่ 1: ยอดขายวันนี้ */}
        {/* 🟢 FIXED: คงผิวการ์ดสีมืดระดับพรีเมียม (bg-zinc-900/60) และสีกรอบตัดมุม border-zinc-800/80 */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/[0.03] hover:border-orange-500/60 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" /> Live Sales
                </span>
                <BarChart3 className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-white tracking-tight relative z-10">
                ฿{stats.todaySales.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50 relative z-10">
                <span className="text-[10px] text-zinc-500 font-black font-sans">Saduaksabuy Engine</span>
                <ArrowUpRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

        {/* การ์ดที่ 2: จำนวนบิล */}
        {/* 🟢 FIXED: คงผิวการ์ดสีมืดระดับพรีเมียม (bg-zinc-900/60) และสีกรอบตัดมุม border-zinc-800/80 */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/[0.03] hover:border-orange-500/60 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Tickets
                </span>
                <Receipt className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-white tracking-tight relative z-10">
                {stats.billCount.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50 relative z-10">
                <span className="text-[10px] text-zinc-500 font-black font-sans">อัปเดตผ่าน Realtime API</span>
                <ArrowUpRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

        {/* การ์ดที่ 3: Traffic ลูกค้า */}
        {/* 🟢 FIXED: คงผิวการ์ดสีมืดระดับพรีเมียม (bg-zinc-900/60) และสีกรอบตัดมุม border-zinc-800/80 */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/[0.03] hover:border-orange-500/60 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /> Traffic
                </span>
                <Users className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-white tracking-tight relative z-10">
                {stats.newCustomers.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50 relative z-10">
                <span className="text-[10px] text-zinc-500 font-black font-sans">พิกัด Hyperlocal Radar</span>
                <ArrowUpRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

        {/* การ์ดที่ 4: สต๊อกสินค้าคงเหลือ */}
        {/* 🟢 FIXED: คงผิวการ์ดสีมืดระดับพรีเมียม (bg-zinc-900/60) และสีกรอบตัดมุม border-zinc-800/80 */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/[0.03] hover:border-orange-500/60 active:scale-[0.98] group">
          {isLoadingStats ? <ShimmerSkeleton /> : (
            <>
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Stock
                </span>
                <Layers className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <p className="mt-3 text-3xl font-black text-white tracking-tight relative z-10">
                {stats.activeStock.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50 relative z-10">
                <span className="text-[10px] text-zinc-500 font-black font-sans">Live Inventory Control</span>
                <ArrowUpRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </>
          )}
        </div>

      </div>

      {/* 🟢 [HARDENED STANDBY COMPONENT] แผงจำลองเพื่อรองรับโครงสร้างกราฟฟิกดีไซน์อันใหม่ในอนาคต */}
      {/* 🟢 FIXED: คงสกินสีมืด bg-zinc-900 และสีกรอบแดชบอร์ดด้านล่างให้กลืนเข้าหาเซ็ตติ้งทั้งหมดครับ */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm text-center select-none border-dashed">
        <div className="text-orange-400 text-3xl mb-2">📊</div>
        <h4 className="text-xs font-black text-white uppercase tracking-wide">โมดูลดัชนีวิเคราะห์ยอดขายสะสมรายสัปดาห์</h4>
        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">ระบบดักสแตนด์บายโครงสร้างข้อมูลกราฟิกเพื่อเตรียมเชื่อมต่อ Live API ดีไซน์ใหม่</p>
      </div>

    </div>
  );
};

export default DashboardPage;