import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBolt,
  FaBriefcase,
  FaShieldAlt,
} from 'react-icons/fa';

const features = [
  {
    title: 'จัดการครบวงจร',
    detail: 'ร้านค้า สินค้า สต๊อก และการขาย',
    Icon: FaBriefcase,
  },
  {
    title: 'ใช้งานง่าย',
    detail: 'ออกแบบมาเพื่อให้ใช้งานได้อย่างสะดวก',
    Icon: FaBolt,
  },
  {
    title: 'ปลอดภัย',
    detail: 'ระบบรักษาความปลอดภัยมาตรฐานสากล',
    Icon: FaShieldAlt,
  },
];

const FeatureCard = ({ title, detail, Icon }) => (
  <div className="group rounded-[20px] border border-orange-100 bg-white/95 px-5 py-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)]">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] border border-orange-100 bg-[#fff5e9] text-lg text-orange-500 shadow-sm">
      <Icon />
    </div>
    <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
    <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{detail}</p>
  </div>
);

const MerchantLoginShell = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_50%_10%,#ffffff_0%,#f7fafc_45%,#f2f6fa_100%)] text-slate-900">
    <header className="border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[78px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link to="/partner-portal" className="flex items-center gap-3" aria-label="กลับหน้าพาร์ทเนอร์">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-orange-400 to-orange-600 text-base font-black text-white shadow-[0_8px_18px_rgba(234,88,12,0.25)]">SS</div>
          <div>
            <p className="text-[15px] font-black tracking-[0.02em] text-slate-950">SADUAKSABUY</p>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500">HYPERLOCAL MARKET</p>
          </div>
        </Link>

        <Link to="/partner-portal" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
          <FaArrowLeft className="text-orange-500" /> กลับหน้าพาร์ทเนอร์
        </Link>
      </div>
    </header>

    <main>
      <div className="mx-auto flex min-h-[calc(100vh-142px)] max-w-[1440px] items-center px-4 py-8 sm:px-7 lg:px-10">
        <section className="grid w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_26px_72px_rgba(15,23,42,0.13)] lg:grid-cols-[1.12fr_0.88fr]">
          <div className="hidden min-h-[700px] flex-col bg-gradient-to-br from-[#fffaf4] via-[#fff7ed] to-[#fffdf9] px-12 py-12 lg:flex xl:px-16">
            <div className="text-center">
              <h1 className="text-[36px] font-black leading-tight tracking-[-0.025em] text-slate-950">
                <span className="text-orange-500">เข้าสู่ระบบ</span> Merchant Center
              </h1>
              <p className="mt-3 text-base font-semibold text-slate-600">จัดการร้านค้าของคุณได้อย่างมีประสิทธิภาพ</p>
            </div>

            <div className="mx-auto mt-7 w-full max-w-[650px]">
              <img
                src="/assets/merchant-pos-hardware.svg"
                alt="ชุดอุปกรณ์ POS สำหรับ Merchant Center"
                className="h-auto w-full select-none drop-shadow-[0_20px_22px_rgba(15,23,42,0.12)]"
                draggable="false"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-5">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          <div className="flex items-center bg-white px-5 py-8 sm:px-9 lg:px-12 xl:px-14">
            <div className="mx-auto w-full max-w-[520px]">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] font-semibold text-slate-500">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 sm:justify-between sm:px-8 lg:px-10">
        <span>© 2026 SADUAKSABUY.COM. All rights reserved.</span>
        <span>เวอร์ชัน 2.1.0</span>
      </div>
    </footer>
  </div>
);

export default MerchantLoginShell;
