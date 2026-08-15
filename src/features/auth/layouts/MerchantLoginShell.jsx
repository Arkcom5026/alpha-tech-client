import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBoxes,
  FaCheckCircle,
  FaShieldAlt,
  FaStore,
} from 'react-icons/fa';

const values = [
  {
    title: 'ข้อมูลร้านเดียวกัน',
    detail: 'สินค้า สต๊อก ราคา และการขายเชื่อมต่อในระบบเดียว',
    Icon: FaBoxes,
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    title: 'เข้าสู่ร้านที่ได้รับสิทธิ์',
    detail: 'พนักงานเห็นเฉพาะร้านและขอบเขตงานของตนเอง',
    Icon: FaStore,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    title: 'ใช้งานอย่างมั่นใจ',
    detail: 'ระบบตรวจสอบตัวตนและสิทธิ์ก่อนเข้าสู่ Merchant Center',
    Icon: FaShieldAlt,
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

const MerchantLoginShell = () => (
  <div className="min-h-screen bg-[#f6f7f6] font-sans text-slate-900 antialiased">
    <header className="h-16 border-b border-slate-200 bg-white px-5">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4">
        <Link
          to="/partner-portal"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          aria-label="กลับหน้า Merchant Center"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-xs font-black text-white shadow-sm">
            SS
          </span>
          <div>
            <p className="text-sm font-black tracking-tight text-slate-950">SADUAKSABUY</p>
            <p className="text-[9px] font-extrabold tracking-[0.12em] text-slate-400">MERCHANT CENTER</p>
          </div>
        </Link>

        <Link
          to="/partner-portal"
          aria-label="กลับหน้าพาร์ทเนอร์"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <FaArrowLeft className="text-[10px]" />
          กลับหน้าสำหรับร้านค้า
        </Link>
      </div>
    </header>

    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center px-5 py-8">
      <section className="grid w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.10)] lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="relative hidden overflow-hidden border-r border-slate-100 bg-gradient-to-br from-white via-[#fbfcfb] to-sky-50/60 p-10 lg:flex lg:flex-col xl:p-12">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-100/65 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-emerald-100/45 blur-3xl" />

          <div className="relative">
            <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.08em] text-emerald-700">
              สำหรับเจ้าของร้านและทีมงาน
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.045em] text-slate-950 xl:text-5xl">
              เข้าสู่ร้านของคุณ
              <span className="block text-slate-700">แล้วเริ่มทำงานต่อได้ทันที</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-600">
              ใช้อีเมลหรือเบอร์โทรศัพท์ที่ได้รับสิทธิ์ เพื่อเข้าสู่ร้านและพื้นที่ทำงานที่ถูกต้อง
            </p>
          </div>

          <img
            src="/assets/merchant-pos-hardware.svg"
            alt="อุปกรณ์หน้าร้านสำหรับระบบ Merchant POS"
            className="relative mx-auto mt-7 max-h-44 w-full max-w-md object-contain"
          />

          <div className="relative mt-7 grid gap-3">
            {values.map(({ title, detail,
              // eslint-disable-next-line no-unused-vars -- JSX icon component comes from the value-card definition.
              Icon, tone }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">{title}</p>
                  <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-auto pt-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
              <FaCheckCircle />
              ระบบจะพาเข้าสู่ร้านและหน้าที่ของคุณโดยอัตโนมัติ
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white px-5 py-8 sm:px-8 lg:px-9 xl:px-10">
          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </section>
    </main>

    <footer className="border-t border-slate-200 bg-white px-5 py-4 text-center text-[11px] font-medium text-slate-400">
      SADUAKSABUY Merchant Center · Secure store access
    </footer>
  </div>
);

export default MerchantLoginShell;
