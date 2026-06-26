// src/features/auth/pages/PartnerWelcomePage.jsx
// 🏛️ Masterpiece Single Container Edition: Unified Partner Portal Onboarding

import React, { useState } from 'react';
import { 
  FaStore, 
  FaChartLine, 
  FaBoxes, 
  FaUserPlus, 
  FaSignInAlt, 
  FaArrowLeft, 
  FaBolt,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa';
import { useAuthStore } from '@/features/auth/store/authStore'; // 🟢 นำเข้า Store เข้ามารับช่วงต่อโฟลว์
import LoginPage from './LoginPage';

const PartnerWelcomePage = () => {
  const [activeMode, setActiveMode] = useState('welcome'); // 'welcome' | 'login' | 'register'

  // 📝 REGISTRATION FLOW STATES
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [email, setEmail] = useState('');
  
  // 🟢 ดึงฟังก์ชันและสเตตจริงมาจาก Zustand Store
  const registerPartnerAction = useAuthStore((state) => state.registerPartnerAction);
  const isRegisterLoading = useAuthStore((state) => state.isRegisterLoading || false);
  const storeRegisterError = useAuthStore((state) => state.registerError || null);
  
  const [localValidationError, setLocalValidationError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // 💡 ฟังก์ชันจัดการแปลงค่า Slug อัตโนมัติ
  const handleSlugChange = (val) => {
    const formattedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');
    setShopSlug(formattedSlug);
  };

  // 🚀 HANDLER SUBMIT REGISTRATION FLOW
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalValidationError('');
    setRegisterSuccess('');

    // 🔍 Front-End Validation
    if (!shopName.trim()) {
      setLocalValidationError('กรุณากรอกชื่อร้านค้าของคุณ');
      return;
    }
    if (!shopSlug.trim()) {
      setLocalValidationError('กรุณากรอกชื่อย่อลิงก์สาขา (Shop Slug)');
      return;
    }
    if (!email.trim()) {
      setLocalValidationError('กรุณากรอกอีเมลติดต่อหลัก');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalValidationError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    try {
      // 🟢 [API CALL]: ยิงส่งข้อมูลไปยังเซิร์ฟเวอร์หลักผ่านระบบสเตต Zustand และรอรับผล
      await registerPartnerAction({ shopName, shopSlug, email });

      setRegisterSuccess('ลงทะเบียนเปิดร้านค้าสำเร็จ! ระบบกำลังนำทางคุณไปยังหน้าล็อกอิน');
      
      // 🟢 [CLEAN & HARD RESET STATE]: ล้างข้อมูลขยะทั้งหมดออกทันทีเมื่อการบันทึกสำเร็จ
      setTimeout(() => {
        setShopName('');
        setShopSlug('');
        setEmail('');
        setRegisterSuccess('');
        setLocalValidationError('');
        setActiveMode('login'); // สับเลนส่งกลับไปที่หน้าล็อกอิน Merchant Center
      }, 2000);

    } catch (err) {
      // เออร์เรอร์ฝั่งเซิร์ฟเวอร์จะถูกจับเก็บไว้ที่ storeRegisterError อัตโนมัติ
    }
  };

  const resetRegisterForm = (mode) => {
    setShopName('');
    setShopSlug('');
    setEmail('');
    setLocalValidationError('');
    setRegisterSuccess('');
    setActiveMode(mode);
  };

  const displayError = localValidationError || storeRegisterError;

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans antialiased text-slate-800 flex flex-col justify-between relative overflow-hidden selection:bg-orange-500 selection:text-white">
      
      {/* 🔮 BACKGROUND ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-orange-200/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1e9e2_1px,transparent_1px),linear-gradient(to_bottom,#f1e9e2_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
      </div>

      {/* 🌐 TOP NAVIGATION BAR */}
      <header className="w-full bg-slate-950 border-b border-orange-500/10 sticky top-0 z-50 py-4 px-6 shadow-xl shadow-slate-950/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 select-none">
            <div className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/30 tracking-wider">
              SS
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black leading-none tracking-tight text-white">
                SADUAK<span className="text-orange-500">SABUY</span>
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Hyperlocal Market
              </span>
            </div>
          </a>
          
          {activeMode !== 'welcome' ? (
            <button
              onClick={() => resetRegisterForm('welcome')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-2 transition-all"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>ย้อนกลับหน้าแรก</span>
            </button>
          ) : (
            <a 
              href="/" 
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-all duration-200 group"
            >
              <FaArrowLeft className="text-[10px] group-hover:-translate-x-0.5 transition-transform text-orange-500" /> 
              <span>กลับหน้าตลาดกลาง</span>
            </a>
          )}
        </div>
      </header>

      {/* 🏛️ 🚀 MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex items-center justify-center flex-1 z-10">
        
        <div className="w-full min-h-[560px] rounded-[44px] bg-slate-950 text-white shadow-2xl border border-slate-800 p-8 md:p-12 lg:p-16 relative overflow-hidden group grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.14),transparent_40%)] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

          {/* 🌌 ส่วนข้อมูลด้านซ้าย (7 คอลัมน์) */}
          <div className="md:col-span-7 space-y-6 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest font-sans mx-auto md:mx-0">
              <FaBolt className="text-[9px]" /> P1 MERCHANT SERVICE PLATFORM
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-[1.05]">
              ขยายร้านค้าของคุณ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                ให้ขายได้ใกล้กว่าเดิม
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              เปลี่ยนระบบหน้าร้านเดิมเป็นสมาร์ทร้านค้าอัจฉริยะด้วย SaaS POS ข้อมูลสต๊อกสินค้าของคุณจะถูกเชื่อมสตรีมมิ่งขึ้นตลาดออนไลน์เพื่อดึงลูกค้าพิกัดใกล้ตัวคุณทันที
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-start gap-3">
                <FaBoxes className="text-orange-400 text-base mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-white">Live Inventory Control</h5>
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">ตัดสต๊อกอัตโนมัติ สัมพันธ์ตรงกัน 100%</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-start gap-3">
                <FaChartLine className="text-amber-400 text-base mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-white">Advanced Analytics</h5>
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">รายงานยอดขายรายวัน คัดกรองรายสาขา</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🧾 ส่วนอินเตอร์เฟซและฟอร์มฝั่งขวา (5 คอลัมน์) */}
          <div className="md:col-span-5 relative z-10 w-full max-w-sm mx-auto md:max-w-none">
            
            {/* 🌟 โหมดที่ 1: หน้าเริ่มต้นต้อนรับ */}
            {activeMode === 'welcome' && (
              <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 text-center w-full shadow-2xl shadow-black/20 text-left">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center text-lg mx-auto shadow-md shadow-orange-500/20">
                    <FaStore />
                  </div>
                  <h3 className="font-black text-lg text-white tracking-tight pt-1">เริ่มต้นจัดการร้านค้า</h3>
                  <p className="text-slate-500 text-xs font-semibold">เลือกเข้าสู่ระบบพาร์ตเนอร์ศูนย์บริการ</p>
                </div>

                <div className="space-y-3 pt-1">
                  <button 
                    onClick={() => resetRegisterForm('register')}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 shadow-lg shadow-orange-500/15 flex items-center justify-center gap-2 active:scale-[0.98] group"
                  >
                    <FaUserPlus className="text-xs" /> 
                    <span>ลงทะเบียนเปิดร้านค้าฟรี</span>
                    <FaChevronRight className="text-[10px] text-orange-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button 
                    onClick={() => resetRegisterForm('login')}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <FaSignInAlt className="text-xs text-slate-400" /> 
                    <span>เข้าสู่ระบบ Merchant Center</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed max-w-[240px] mx-auto pt-2 border-t border-white/5 text-center">
                  ยอมรับ <a href="#" className="underline hover:text-orange-400">ข้อตกลงและเงื่อนไข</a> แพลตฟอร์มพาร์ตเนอร์
                </p>
              </div>
            )}

            {/* 🔑 โหมดที่ 2: ฝังหน้าล็อกอินตัวจริง (LoginPage) */}
            {activeMode === 'login' && (
              <div className="animate-fadeIn">
                <LoginPage />
              </div>
            )}

            {/* 📝 โหมดที่ 3: ฟอร์มลงทะเบียนร้านค้าใหม่ */}
            {activeMode === 'register' && (
              <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-5 w-full shadow-2xl shadow-black/20 text-left animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-black text-base text-white tracking-tight">ลงทะเบียนร้านค้าใหม่</h3>
                  <button 
                    onClick={() => resetRegisterForm('welcome')}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                    disabled={isRegisterLoading}
                  >
                    ย้อนกลับ
                  </button>
                </div>

                {displayError && (
                  <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                    {displayError}
                  </div>
                )}

                {registerSuccess && (
                  <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                    {registerSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                      ชื่อร้านค้า (Shop Name)
                    </label>
                    <input 
                      type="text" 
                      placeholder="เช่น สบายมาร์ท ชุมชน" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      disabled={isRegisterLoading}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:bg-white/10 focus:border-orange-500 transition-all placeholder:text-slate-600" 
                    />
                    {/* 💡 🟢 เพิ่มป้ายคำแนะนำจานช่วยคัดกรอง UX ตามหลักการสร้างร้านค้าทั่วประเทศเพื่อกันพาร์ตเนอร์สับสน */}
                    <p className="mt-1 text-[10px] text-slate-500 font-medium leading-normal pl-0.5">
                      คำแนะนำ: สามารถระบุชื่อพิกัดหรือชื่อสาขาพ่วงท้ายได้ เช่น สบายมาร์ท (สาขาเมืองนครสวรรค์) เพื่อความชัดเจนบนหน้าเอกสารและใบเสร็จรับเงิน
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                      ชื่อย่อลิงก์สาขา (Shop Slug)
                    </label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:bg-white/10 focus-within:border-orange-500 transition-all">
                      <span className="bg-white/5 px-3 py-2.5 text-[11px] text-slate-500 font-mono font-bold border-r border-white/10 select-none">slug/</span>
                      <input 
                        type="text" 
                        placeholder="my-shop" 
                        value={shopSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        disabled={isRegisterLoading}
                        className="w-full px-3.5 py-2.5 text-xs bg-transparent outline-none font-mono text-white placeholder:text-slate-600" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                      อีเมลติดต่อหลัก
                    </label>
                    <input 
                      type="email" 
                      placeholder="merchant@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isRegisterLoading}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:bg-white/10 focus:border-orange-500 transition-all placeholder:text-slate-600" 
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isRegisterLoading}
                    className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] ${
                      isRegisterLoading 
                        ? 'bg-orange-500/30 cursor-not-allowed text-white/50 shadow-none' 
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/15 mt-2'
                    }`}
                  >
                    {isRegisterLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>กำลังส่งข้อมูลเปิดร้านค้า...</span>
                      </>
                    ) : (
                      'ส่งข้อมูลเปิดร้านค้าฟรี'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 📑 GLOBAL FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200/50 py-4 text-center text-[11px] text-slate-400 font-medium select-none">
        &copy; {new Date().getFullYear()} SADUAKSABUY.COM. All rights reserved.
      </footer>

    </div>
  );
};

export default PartnerWelcomePage;