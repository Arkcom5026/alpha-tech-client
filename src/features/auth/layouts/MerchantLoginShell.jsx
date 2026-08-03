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
  ['จัดซื้อ', FaShoppingCart],
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

const MerchantLoginShell = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex min-h-[72px] items-center gap-3 px-4 lg:pl-[220px]">
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
          <span className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-bold text-slate-700">BRANCH ONLINE<br /><strong>Merchant Center</strong></span>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">POS OPERATOR</span>
        </div>
      </div>
    </header>

    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[200px] border-r border-orange-100 bg-[#fffaf4] lg:flex lg:flex-col">
      <div className="border-b border-orange-100 px-7 py-7">
        <p className="text-base font-black text-orange-600">POS SYSTEM</p>
        <p className="mt-1 text-[10px] font-bold tracking-[0.16em] text-slate-500">ENTERPRISE COMMAND RAIL</p>
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

    <main className="lg:pl-[200px]">
      <div className="mx-auto flex min-h-[calc(100vh-118px)] max-w-[1380px] items-center px-4 py-8 sm:px-6 lg:px-10">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden min-h-[610px] flex-col justify-between bg-gradient-to-br from-[#fffaf3] via-[#fff7ed] to-white p-10 lg:flex xl:p-14">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">Merchant Center</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950">เข้าสู่ระบบจัดการร้านค้า<br /><span className="text-orange-500">ครบทุกงานในที่เดียว</span></h1>
              <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-600">จัดการร้านค้า สินค้า สต๊อก การขาย บริการ รายงาน และการเงิน ภายใต้ Tenant ของร้านคุณอย่างปลอดภัย</p>
            </div>

            <div className="relative mx-auto my-8 flex h-60 w-full max-w-lg items-center justify-center rounded-[32px] bg-orange-50">
              <div className="absolute bottom-9 left-1/2 h-20 w-64 -translate-x-1/2 rounded-2xl border-4 border-slate-700 bg-slate-800 shadow-xl" />
              <div className="absolute bottom-24 left-1/2 h-28 w-48 -translate-x-1/2 rounded-xl border-[10px] border-slate-700 bg-white shadow-xl">
                <div className="flex h-full items-center justify-center"><span className="rounded-xl bg-orange-500 px-4 py-3 text-xl font-black text-white">SS</span></div>
              </div>
              <div className="absolute bottom-10 left-12 h-20 w-24 rounded-xl bg-slate-800 shadow-lg" />
              <div className="absolute bottom-14 right-14 h-24 w-10 -rotate-12 rounded-xl bg-slate-800 shadow-lg" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['จัดการครบวงจร', 'ร้านค้า สินค้า สต๊อก และการขาย'],
                ['ใช้งานง่าย', 'ออกแบบให้ทำงานได้อย่างคล่องตัว'],
                ['ปลอดภัย', 'แยกข้อมูลแต่ละร้านอย่างชัดเจน'],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-2xl border border-orange-100 bg-white p-4 text-center shadow-sm">
                  <FaLock className="mx-auto text-orange-500" />
                  <p className="mt-2 text-xs font-black text-slate-900">{title}</p>
                  <p className="mt-1 text-[10px] font-semibold leading-5 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center bg-white p-4 sm:p-7 lg:p-10">
            <div className="mx-auto w-full max-w-xl">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] font-semibold text-slate-500 lg:pl-[200px]">
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 sm:justify-between">
        <span>© 2026 SADUAKSABUY.COM. All rights reserved.</span>
        <span>เวอร์ชัน 2.1.0 &nbsp; <strong className="text-emerald-600">● ระบบพร้อมใช้งาน</strong></span>
      </div>
    </footer>
  </div>
);

export default MerchantLoginShell;
