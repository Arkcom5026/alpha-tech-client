// src/features/auth/pages/PartnerWelcomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBoxes,
  FaCheck,
  FaChevronRight,
  FaClipboardCheck,
  FaSignInAlt,
  FaStore,
  FaUserPlus,
} from 'react-icons/fa';

const benefits = [
  {
    icon: FaBoxes,
    title: 'ขายหน้าร้านและออนไลน์',
    caption: 'ใช้สินค้า ราคา และสต๊อกชุดเดียวกัน',
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    icon: FaStore,
    title: 'เพิ่มลูกค้าผ่าน Marketplace',
    caption: 'ให้คนใกล้ร้านค้นพบสินค้าของคุณได้ง่ายขึ้น',
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    icon: FaClipboardCheck,
    title: 'เริ่มต้นได้อย่างมั่นใจ',
    caption: 'ทีมงานตรวจสอบข้อมูลก่อนเปิดใช้งานจริง',
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

const PartnerWelcomePage = () => (
  <div className="min-h-screen overflow-hidden bg-[#f7f8f7] font-sans text-slate-900 antialiased">
    <header className="h-[72px] border-b border-slate-200 bg-white px-5">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-sm font-black text-white shadow-sm">
            SS
          </span>
          <div>
            <p className="text-base font-black tracking-[-0.025em] text-slate-950">SADUAKSABUY</p>
            <p className="mt-0.5 text-[10px] font-bold tracking-[0.08em] text-slate-400">MERCHANT CENTER</p>
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

    <main className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center px-5 py-8">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.08em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            สำหรับเจ้าของร้านค้า
          </div>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.06] tracking-[-0.05em] text-slate-950 sm:text-[54px]">
            เชื่อมร้านของคุณ
            <span className="block text-slate-700">เข้าสู่ Marketplace</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
            สมัครร้านใหม่เพื่อเริ่มขายออนไลน์ หรือเข้าสู่ Merchant Center เพื่อจัดการร้านที่มีอยู่แล้ว
          </p>

          <div className="relative mt-7 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[80px] bg-gradient-to-br from-teal-50 via-sky-50 to-violet-50" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg text-teal-700">
                <FaStore />
              </span>
              <div>
                <p className="text-sm font-extrabold text-slate-950">ระบบเดียว ตั้งแต่หน้าร้านถึงออนไลน์</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  จัดการสินค้า สต๊อก และการขายจากพื้นที่ทำงานเดียวกัน
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${benefit.tone}`}>
                      <Icon />
                    </span>
                    <div>
                      <h2 className="text-sm font-extrabold leading-5 text-slate-950">{benefit.title}</h2>
                      <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{benefit.caption}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.13)] sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-xl text-teal-700">
            <FaStore />
          </div>

          <h2 className="mt-5 text-[28px] font-black tracking-[-0.04em] text-slate-950">
            เริ่มจัดการร้านค้า
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            เลือกขั้นตอนที่ตรงกับสถานะของร้านคุณ
          </p>

          <div className="mt-6 space-y-3">
            <Link
              to="/partner-portal/apply"
              className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_12px_24px_rgba(13,148,136,0.22)] transition hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-[0_16px_30px_rgba(13,148,136,0.26)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FaUserPlus />
              สมัครเปิดร้านค้า
              <FaChevronRight className="text-[10px] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/login"
              className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <FaSignInAlt className="text-slate-400" />
              เข้าสู่ Merchant Center
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-bold text-slate-700">สมัครได้โดยไม่มีค่าใช้จ่าย</p>
            <div className="mt-3 space-y-2">
              {['ส่งข้อมูลร้านให้ทีมงานตรวจสอบ', 'เปิดสิทธิ์เมื่อข้อมูลพร้อมใช้งาน'].map((item) => (
                <p key={item} className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[9px] text-emerald-600">
                    <FaCheck />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
);

export default PartnerWelcomePage;
