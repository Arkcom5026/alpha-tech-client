// src/features/auth/pages/PartnerWelcomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBolt,
  FaBoxes,
  FaChartLine,
  FaChevronRight,
  FaSignInAlt,
  FaStore,
  FaUserPlus,
} from 'react-icons/fa';

const PartnerWelcomePage = () => (
  <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#FDFBF9] font-sans text-slate-800 antialiased">
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-orange-100/40 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5ebe2_1px,transparent_1px),linear-gradient(to_bottom,#f5ebe2_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
    </div>

    <header className="sticky top-0 z-50 w-full border-b border-orange-500/10 bg-[#111625] px-6 py-4 shadow-md shadow-slate-900/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex select-none items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EF6C00] text-sm font-black tracking-wider text-white shadow-lg shadow-orange-500/20">
            SS
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black leading-none tracking-tight text-white">
              SADUAK<span className="text-orange-500">SABUY</span>
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Hyperlocal Market
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="group flex items-center gap-2 text-xs font-bold text-slate-400 transition-all duration-200 hover:text-white"
        >
          <FaArrowLeft className="text-[10px] text-orange-400 transition-transform group-hover:-translate-x-0.5" />
          <span>กลับหน้าตลาดกลาง</span>
        </Link>
      </div>
    </header>

    <main className="z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-12">
      <div className="group relative grid min-h-[540px] w-full grid-cols-1 items-center gap-8 overflow-hidden rounded-[36px] border border-[#EFE9DE] bg-[#FAF6F0] p-8 text-slate-800 shadow-xl shadow-slate-200/60 md:grid-cols-12 md:gap-12 md:p-12 lg:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(250,140,22,0.05),transparent_40%)]" />

        <section className="relative z-10 space-y-6 text-center md:col-span-7 md:text-left">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#D46B08] md:mx-0">
            <FaBolt className="text-[9px]" /> P1 MERCHANT SERVICE PLATFORM
          </div>

          <h1 className="text-4xl font-black leading-[1.08] tracking-tighter text-[#111625] md:text-5xl">
            ขยายร้านค้าของคุณ <br />
            <span className="bg-gradient-to-r from-[#D46B08] via-[#FA8C16] to-[#FF9C6E] bg-clip-text text-transparent">
              ให้ขายได้ใกล้กว่าเดิม
            </span>
          </h1>

          <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-600 md:mx-0">
            สมัครใช้งานระบบบริหารร้านค้าและ POS ของ SaduakSabuy โดยส่งข้อมูลร้านให้ทีมงานตรวจสอบก่อนเปิดใช้งานจริง
          </p>

          <div className="grid grid-cols-1 gap-4 pt-4 text-left sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              <FaBoxes className="mt-0.5 shrink-0 text-base text-orange-500" />
              <div className="space-y-0.5">
                <h2 className="text-xs font-bold text-slate-900">Live Inventory Control</h2>
                <p className="text-[11px] font-medium leading-normal text-slate-500">จัดการสต๊อกและการขายภายในร้านเดียวกัน</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              <FaChartLine className="mt-0.5 shrink-0 text-base text-orange-500" />
              <div className="space-y-0.5">
                <h2 className="text-xs font-bold text-slate-900">Store Analytics</h2>
                <p className="text-[11px] font-medium leading-normal text-slate-500">รายงานและข้อมูลทั้งหมดแยกตามร้านอย่างชัดเจน</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
          <div className="w-full space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#EFE9DE] bg-[#FAF6F0] text-lg text-orange-500 shadow-sm">
                <FaStore />
              </div>
              <h2 className="pt-1 text-lg font-black tracking-tight text-slate-900">เริ่มต้นจัดการร้านค้า</h2>
              <p className="text-xs font-semibold text-slate-500">สมัครร้านใหม่หรือเข้าสู่ระบบ Merchant Center</p>
            </div>

            <div className="space-y-3 pt-1">
              <Link
                to="/partner-portal/apply"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#111625] px-4 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
              >
                <FaUserPlus className="text-xs text-orange-400" />
                <span>ลงทะเบียนเปิดร้านค้าฟรี</span>
                <FaChevronRight className="text-[10px] text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold text-slate-800 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
              >
                <FaSignInAlt className="text-xs text-slate-400" />
                <span>เข้าสู่ระบบ Merchant Center</span>
              </Link>
            </div>

            <p className="mx-auto max-w-[240px] border-t border-slate-100 pt-4 text-center text-[10px] font-medium leading-relaxed text-slate-400">
              ใบสมัครจะได้รับการตรวจสอบก่อนสร้างร้านและเปิดสิทธิ์ใช้งาน
            </p>
          </div>
        </section>
      </div>
    </main>

    <footer className="w-full border-t border-slate-200 bg-white py-4 text-center text-[11px] font-medium text-slate-400">
      &copy; {new Date().getFullYear()} SADUAKSABUY.COM. All rights reserved.
    </footer>
  </div>
);

export default PartnerWelcomePage;
