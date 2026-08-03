import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaArrowLeft, FaLock } from 'react-icons/fa';

const FeatureCard = ({ title, detail }) => (
  <div className="group rounded-2xl border border-orange-100 bg-white/95 px-4 py-5 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]">
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-500 shadow-sm">
      <FaLock />
    </div>
    <p className="mt-3 text-sm font-black text-slate-900">{title}</p>
    <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{detail}</p>
  </div>
);

const PosHardwareArtwork = () => (
  <div className="relative mx-auto mt-8 h-[270px] w-full max-w-[520px] overflow-hidden rounded-[42px] bg-[radial-gradient(circle_at_50%_32%,#fffdf8_0%,#fff5e8_58%,#ffedd8_100%)]">
    <div className="absolute inset-x-12 bottom-5 h-10 rounded-[50%] bg-orange-200/55 blur-2xl" />

    <div className="absolute bottom-[50px] left-[31%] h-[88px] w-[238px] rounded-[16px] border-[7px] border-[#303746] bg-gradient-to-b from-[#2a3343] to-[#171d29] shadow-[0_20px_28px_rgba(15,23,42,0.32)]">
      <div className="absolute inset-x-6 top-4 h-3 rounded-full bg-slate-600/70" />
      <div className="absolute bottom-4 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-slate-400/70 bg-slate-700" />
    </div>

    <div className="absolute bottom-[126px] left-[36%] h-[126px] w-[194px] rounded-[14px] border-[10px] border-[#333b49] bg-gradient-to-br from-white via-slate-50 to-orange-50 shadow-[0_24px_34px_rgba(15,23,42,0.28)]">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-black text-white shadow-lg">SS</div>
        <p className="mt-2 text-[9px] font-black tracking-[0.17em] text-slate-700">SADUAKSABUY</p>
        <p className="mt-0.5 text-[6px] font-bold tracking-[0.18em] text-slate-400">HYPERLOCAL MARKET</p>
      </div>
    </div>
    <div className="absolute bottom-[105px] left-[45%] h-9 w-20 rounded-b-md bg-gradient-to-b from-[#394252] to-[#232b38]" />

    <div className="absolute bottom-[53px] left-[10%] h-[100px] w-[116px] rounded-[18px] bg-gradient-to-b from-[#303847] to-[#171d29] shadow-[0_18px_26px_rgba(15,23,42,0.32)]">
      <div className="absolute inset-x-3 top-4 h-5 rounded-md bg-slate-600/70" />
      <div className="absolute -top-11 left-5 h-16 w-[78px] rotate-[-3deg] rounded-t-md border border-slate-200 bg-white shadow-md">
        <div className="mx-auto mt-3 h-1 w-12 bg-slate-200" />
        <div className="mx-auto mt-2 h-1 w-10 bg-slate-200" />
        <div className="mx-auto mt-2 h-1 w-11 bg-slate-200" />
        <div className="mx-auto mt-2 h-1 w-9 bg-slate-200" />
      </div>
    </div>

    <div className="absolute bottom-[68px] right-[11%] h-[112px] w-[46px] -rotate-12 rounded-[20px] bg-gradient-to-b from-[#303847] to-[#161c28] shadow-[0_18px_26px_rgba(15,23,42,0.32)]">
      <div className="absolute left-2 top-2 h-8 w-7 rounded-md border border-slate-500/60 bg-slate-700" />
      <div className="absolute bottom-3 left-1/2 h-8 w-2 -translate-x-1/2 rounded-full bg-slate-700/70" />
    </div>
  </div>
);

const MerchantLoginShell = () => (
  <div className="min-h-screen bg-[#f8fafc] text-slate-900">
    <header className="border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/partner-portal" className="flex items-center gap-3" aria-label="กลับหน้าพาร์ทเนอร์">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-black text-white shadow-md">SS</div>
          <div>
            <p className="text-sm font-black text-slate-950">SADUAKSABUY</p>
            <p className="text-[9px] font-bold tracking-[0.18em] text-slate-500">MERCHANT CENTER</p>
          </div>
        </Link>

        <Link to="/partner-portal" className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-50">
          <FaArrowLeft /> กลับหน้าพาร์ทเนอร์
        </Link>
      </div>
    </header>

    <main>
      <div className="mx-auto flex min-h-[calc(100vh-128px)] max-w-[1280px] items-center px-4 py-9 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.14)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hidden min-h-[620px] flex-col bg-gradient-to-br from-[#fffaf4] via-[#fff8ef] to-white px-12 py-10 lg:flex xl:px-14">
            <div className="text-center">
              <h1 className="text-[28px] font-black leading-tight text-slate-950">
                <span className="text-orange-500">เข้าสู่ระบบ</span> Merchant Center
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">จัดการร้านค้าของคุณได้อย่างมีประสิทธิภาพ</p>
            </div>

            <PosHardwareArtwork />

            <div className="mt-7 grid grid-cols-3 gap-4">
              <FeatureCard title="จัดการครบวงจร" detail="ร้านค้า สินค้า สต๊อก และการขาย" />
              <FeatureCard title="ใช้งานง่าย" detail="ออกแบบมาเพื่อให้ใช้งานได้อย่างสะดวก" />
              <FeatureCard title="ปลอดภัย" detail="ระบบรักษาความปลอดภัยมาตรฐานสากล" />
            </div>
          </div>

          <div className="flex items-center bg-white px-5 py-7 sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-[500px]">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] font-semibold text-slate-500">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 sm:justify-between">
        <span>© 2026 SADUAKSABUY.COM. All rights reserved.</span>
        <span>การเข้าสู่ระบบที่ปลอดภัยสำหรับร้านพาร์ทเนอร์</span>
      </div>
    </footer>
  </div>
);

export default MerchantLoginShell;
