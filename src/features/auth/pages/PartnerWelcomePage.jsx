// src/features/auth/pages/PartnerWelcomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBoxes,
  FaChevronRight,
  FaClipboardCheck,
  FaSignInAlt,
  FaStore,
  FaUserPlus,
} from 'react-icons/fa';

const benefits = [
  {
    icon: FaBoxes,
    title: 'ใช้สต๊อกเดียวกับหน้าร้าน',
    caption: 'สินค้า ราคา และจำนวนคงเหลือจัดการจากระบบเดียว',
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    icon: FaStore,
    title: 'เปิดขายบน Marketplace',
    caption: 'ให้ลูกค้าใกล้ร้านค้นพบสินค้าและติดต่อซื้อได้ง่ายขึ้น',
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    icon: FaClipboardCheck,
    title: 'เริ่มต้นอย่างเป็นระบบ',
    caption: 'ทีมงานตรวจสอบข้อมูลร้านก่อนเปิดใช้งานจริง',
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

const PartnerWelcomePage = () => (
  <div className="min-h-screen bg-[#f7f8f7] font-sans text-slate-900 antialiased">
    <header className="h-16 border-b border-slate-200 bg-white px-5">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-xs font-black text-white">
            SS
          </span>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-950">SADUAKSABUY</p>
            <p className="text-[9px] font-semibold text-slate-400">Merchant Center</p>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <FaArrowLeft className="text-[10px]" />
          กลับ Marketplace
        </Link>
      </div>
    </header>

    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-5 py-8">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section>
          <p className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.08em] text-amber-700">
            สำหรับเจ้าของร้านค้า
          </p>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl">
            เชื่อมร้านของคุณ
            <span className="block text-slate-700">เข้าสู่ Marketplace</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
            สมัครร้านใหม่เพื่อขายสินค้าออนไลน์ หรือเข้าสู่ Merchant Center เพื่อจัดการร้านที่มีอยู่แล้ว
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${benefit.tone}`}>
                    <Icon />
                  </span>
                  <h2 className="mt-3 text-sm font-extrabold text-slate-950">{benefit.title}</h2>
                  <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{benefit.caption}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-lg text-teal-700">
            <FaStore />
          </div>

          <h2 className="mt-5 text-2xl font-black tracking-[-0.035em] text-slate-950">
            เริ่มจัดการร้านค้า
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            เลือกขั้นตอนที่ตรงกับสถานะของร้านคุณ
          </p>

          <div className="mt-6 space-y-3">
            <Link
              to="/partner-portal/apply"
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FaUserPlus />
              สมัครเปิดร้านค้า
              <FaChevronRight className="text-[10px] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/login"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FaSignInAlt className="text-slate-400" />
              เข้าสู่ Merchant Center
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-bold text-slate-700">ยังไม่มีร้านในระบบ?</p>
            <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
              ส่งข้อมูลร้านเพื่อให้ทีมงานตรวจสอบก่อนเปิดสิทธิ์ใช้งาน โดยไม่มีค่าใช้จ่ายในการสมัคร
            </p>
          </div>
        </section>
      </div>
    </main>
  </div>
);

export default PartnerWelcomePage;
