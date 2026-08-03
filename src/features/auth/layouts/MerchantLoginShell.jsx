import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  FaBox,
  FaChartBar,
  FaCheckCircle,
  FaClipboardList,
  FaCoins,
  FaHome,
  FaLock,
  FaShoppingCart,
  FaStore,
  FaTools,
} from 'react-icons/fa';

const topItems = [
  ['หน้าหลัก', FaHome],
  ['สั่งซื้อ', FaShoppingCart],
  ['การขาย', FaClipboardList],
  ['บริการ', FaTools],
  ['สต๊อก', FaBox],
  ['รายงาน', FaChartBar],
  ['การเงิน', FaCoins],
  ['ตั้งค่าระบบ', FaTools],
];

const sideItems = [
  ['หน้าหลัก', FaHome],
  ['จัดการร้าน', FaStore],
  ['จัดการสินค้า', FaBox],
  ['จัดการสต๊อก', FaClipboardList],
  ['รายงาน', FaChartBar],
  ['การเงิน', FaCoins],
];

const FeatureCard = ({ title, detail }) => (
  <div className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-5 text-center shadow-sm">
    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
      <FaLock />
    </div>
    <p className="mt-3 text-sm font-black text-slate-900">{title}</p>
    <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{detail}</p>
  </div>
);

const PosHardwareArtwork = () => (
  <div className="relative mx-auto mt-8 h-[250px] w-full max-w-[500px] overflow-hidden rounded-[38px] bg-[#fff4e8]">
    <div className="absolute inset-x-14 bottom-5 h-8 rounded-[50%] bg-orange-100/70 blur-xl" />

    <div className="absolute bottom-14 left-[34%] h-[92px] w-[210px] rounded-[16px] border-[8px] border-[#303746] bg-[#1f2937] shadow-2xl">
      <div className="absolute inset-x-5 top-4 h-3 rounded-full bg-slate-700" />
      <div className="absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-slate-500" />
    </div>

    <div className="absolute bottom-[128px] left-[38%] h-[112px] w-[175px] rounded-[13px] border-[10px] border-[#303746] bg-white shadow-2xl">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-lg font-black text-white">SS</div>
        <p className="mt-2 text-[9px] font-black tracking-[0.16em] text-slate-700">SADUAKSABUY</p>
      </div>
    </div>
    <div className="absolute bottom-[108px] left-[47%] h-8 w-16 bg-[#303746]" />

    <div className="absolute bottom-[52px] left-[13%] h-[96px] w-[110px] rounded-[18px] bg-[#212938] shadow-2xl">
      <div className="absolute inset-x-3 top-3 h-5 rounded-md bg-slate-700" />
      <div className="absolute -top-9 left-4 h-14 w-20 rotate-[-3deg] rounded-t-md border border-slate-200 bg-white shadow-md">
        <div className="mx-auto mt-2 h-1 w-12 bg-slate-200" />
        <div className="mx-auto mt-2 h-1 w-10 bg-slate-200" />
        <div className="mx-auto mt-2 h-1 w-11 bg-slate-200" />
      </div>
    </div>

    <div className="absolute bottom-[66px] right-[13%] h-[104px] w-[42px] -rotate-12 rounded-[18px] bg-[#202838] shadow-2xl">
      <div className="absolute left-2 top-2 h-7 w-6 rounded-md bg-slate-700" />
    </div>
  </div>
);

const MerchantLoginShell = () => (
  <div className="min-h-screen bg-[#f8fafc] text-slate-900">
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex min-h-[70px] items-center gap-3 px-4 lg:pl-[202px]">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700">
            <FaCheckCircle /> POS
          </span>
          {topItems.map(([label, Icon]) => (
            <span key={label} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
              <Icon className="text-orange-500" /> {label}
            </span>
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">● ระบบพร้อมใช้งาน</span>
          <span className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-bold text-slate-700">BRANCH ONLINE<br /><strong>ร้านทดสอบการสร้างร้านพาร์ทเนอร์</strong></span>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">POS OPERATOR⌄</span>
        </div>
      </div>
    </header>

    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[180px] border-r border-orange-100 bg-[#fffaf4] lg:flex lg:flex-col">
      <div className="border-b border-orange-100 px-6 py-7">
        <p className="text-base font-black text-orange-600">POS SYSTEM</p>
        <p className="mt-1 text-[9px] font-bold tracking-[0.16em] text-slate-500">ENTERPRISE COMMAND RAIL</p>
      </div>
      <div className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-black text-slate-600">เมนูหลัก</p>
        <div className="space-y-2">
          {sideItems.map(([label, Icon]) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm">
              <Icon className="text-orange-500" /> {label}
            </div>
          ))}
        </div>
      </div>
      <div className="p-3">
        <div className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-xs font-bold text-slate-700">← ซ่อนเมนู</div>
      </div>
    </aside>

    <main className="lg:pl-[180px]">
      <div className="mx-auto flex min-h-[calc(100vh-118px)] max-w-[1260px] items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.14)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hidden min-h-[620px] flex-col bg-gradient-to-br from-[#fffaf3] via-[#fff7ed] to-white px-12 py-11 lg:flex xl:px-14">
            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-orange-600">Merchant Center</p>
            <h1 className="mt-5 text-[34px] font-black leading-[1.12] text-slate-950">เข้าสู่ระบบจัดการร้านค้า<br /><span className="text-orange-500">ครบทุกงานในที่เดียว</span></h1>
            <p className="mt-5 max-w-lg text-sm font-semibold leading-7 text-slate-600">จัดการร้านค้า สินค้า สต๊อก การขาย บริการ รายงาน และการเงิน ภายใต้ Tenant ของร้านคุณอย่างปลอดภัย</p>

            <PosHardwareArtwork />

            <div className="mt-7 grid grid-cols-3 gap-3">
              <FeatureCard title="จัดการครบวงจร" detail="ร้านค้า สินค้า สต๊อก และการขาย" />
              <FeatureCard title="ใช้งานง่าย" detail="ออกแบบให้ทำงานได้อย่างคล่องตัว" />
              <FeatureCard title="ปลอดภัย" detail="แยกข้อมูลแต่ละร้านอย่างชัดเจน" />
            </div>
          </div>

          <div className="flex items-center bg-white px-5 py-7 sm:px-8 lg:px-9">
            <div className="mx-auto w-full max-w-[480px]">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] font-semibold text-slate-500 lg:pl-[180px]">
      <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 sm:justify-between">
        <span>© 2026 SADUAKSABUY.COM. All rights reserved.</span>
        <span>เวอร์ชัน 2.1.0 &nbsp; <strong className="text-emerald-600">● ระบบพร้อมใช้งาน</strong></span>
      </div>
    </footer>
  </div>
);

export default MerchantLoginShell;
