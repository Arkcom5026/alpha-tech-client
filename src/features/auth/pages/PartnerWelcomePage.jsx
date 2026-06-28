// src/features/auth/pages/PartnerWelcomePage.jsx
// 🏛️ Masterpiece Single Container Edition: Integrated Hyperlocal Theme
// 🎨 Warm Luxury Style - Fully Synced with Marketplace Design Language

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
  FaSpinner,
  FaBriefcase 
} from 'react-icons/fa';
import { useAuthStore } from '@/features/auth/store/authStore'; 
import LoginPage from './LoginPage';

const PartnerWelcomePage = () => {
  const [activeMode, setActiveMode] = useState('welcome'); 

  // 📝 REGISTRATION FLOW STATES
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState(1); 
  
  const registerPartnerAction = useAuthStore((state) => state.registerPartnerAction);
  const isRegisterLoading = useAuthStore((state) => state.isRegisterLoading || false);
  const storeRegisterError = useAuthStore((state) => state.registerError || null);
  
  const [localValidationError, setLocalValidationError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // 💡 รายการหมวดธุรกิจสากลแกนหลัก (ตรงล็อก 1-6 กับตาราง Category ในฐานข้อมูล)
  const businessCategories = [
    { id: 1, name: '💻 อุปกรณ์ไอทีและคอมพิวเตอร์' },
    { id: 2, name: '📱 สมาร์ทโฟนและแกดเจ็ต' },
    { id: 3, name: '📺 เครื่องใช้ไฟฟ้าภายในบ้าน' },
    { id: 4, name: '🔨 เครื่องมือช่างและวัสดุก่อสร้าง' },
    { id: 5, name: '🛒 สินค้าอุปโภคบริโภคและโชห่วย' },
    { id: 6, name: '📝 อุปกรณ์สำนักงาน' },
  ];

  const handleSlugChange = (val) => {
    const formattedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');
    setShopSlug(formattedSlug);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalValidationError('');
    setRegisterSuccess('');

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
      await registerPartnerAction({ shopName, shopSlug, email, categoryId: Number(categoryId) });
      setRegisterSuccess('ลงทะเบียนเปิดร้านค้าสำเร็จ! ระบบกำลังนำทางคุณไปยังหน้าล็อกอิน');
      
      setTimeout(() => {
        setShopName('');
        setShopSlug('');
        setEmail('');
        setCategoryId(1); 
        setRegisterSuccess('');
        setLocalValidationError('');
        setActiveMode('login'); 
      }, 2000);

    } catch (err) {
      // Error handles inside state store
    }
  };

  const resetRegisterForm = (mode) => {
    setShopName('');
    setShopSlug('');
    setEmail('');
    setCategoryId(1);
    setLocalValidationError('');
    setRegisterSuccess('');
    setActiveMode(mode);
  };

  const displayError = localValidationError || storeRegisterError;

  return (
    // 🎨 [THEME INTEGRATION] พื้นหลังสีครีมอุ่นละมุนแบบเดียวกับหน้าแรกของตลาดกลาง
    <div className="min-h-screen bg-[#FDFBF9] font-sans antialiased text-slate-800 flex flex-col justify-between relative overflow-hidden">
      
      {/* 🔮 BACKGROUND LATTICE GRID & BLUR EFFECTS */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5ebe2_1px,transparent_1px),linear-gradient(to_bottom,#f5ebe2_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      </div>

      {/* 🌐 TOP NAVIGATION BAR (คุมโทนสีกรมท่าลึก ขอบทองส้มหรูหรา) */}
      <header className="w-full bg-[#111625] border-b border-orange-500/10 sticky top-0 z-50 py-4 px-6 shadow-md shadow-slate-900/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 select-none">
            <div className="bg-[#EF6C00] text-white w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/20 tracking-wider">
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
          </a>
          
          {activeMode !== 'welcome' ? (
            <button
              onClick={() => resetRegisterForm('welcome')}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
            >
              <FaArrowLeft className="text-[10px] text-orange-400" />
              <span>ย้อนกลับหน้าแรก</span>
            </button>
          ) : (
            <a 
              href="/" 
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-all duration-200 group"
            >
              <FaArrowLeft className="text-[10px] group-hover:-translate-x-0.5 transition-transform text-orange-400" /> 
              <span>กลับหน้าตลาดกลาง</span>
            </a>
          )}
        </div>
      </header>

      {/* 🏛️ MAIN SCREEN BOX CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex items-center justify-center flex-1 z-10">
        
        {/* 🟢 กล่องพาเนลสีครีมสว่างสลับขาว นวลตาสไตล์มินิมอลตามแบบหน้าแรกเป๊ะ */}
        <div className="w-full min-h-[540px] rounded-[36px] bg-[#FAF6F0] text-slate-800 shadow-xl shadow-slate-200/60 border border-[#EFE9DE] p-8 md:p-12 lg:p-16 relative overflow-hidden group grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(250,140,22,0.05),transparent_40%)] pointer-events-none" />

          {/* 🌌 ส่วนข้อมูลด้านซ้าย (สาระฟีเจอร์เด็ดของแพลตฟอร์ม) */}
          <div className="md:col-span-7 space-y-6 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-[#D46B08] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest font-sans mx-auto md:mx-0">
              <FaBolt className="text-[9px]" /> P1 MERCHANT SERVICE PLATFORM
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#111625] leading-[1.08]">
              ขยายร้านค้าของคุณ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D46B08] via-[#FA8C16] to-[#FF9C6E]">
                ให้ขายได้ใกล้กว่าเดิม
              </span>
            </h1>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              เปลี่ยนระบบหน้าร้านเดิมเป็นสมาร์ทร้านค้าอัจฉริยะด้วย SaaS POS ข้อมูลสต๊อกสินค้าของคุณจะถูกเชื่อมสตรีมมิ่งขึ้นตลาดออนไลน์เพื่อดึงลูกค้าพิกัดใกล้ตัวคุณทันที
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                <FaBoxes className="text-orange-500 text-base mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-slate-900">Live Inventory Control</h5>
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">ตัดสต๊อกอัตโนมัติ สัมพันธ์ตรงกัน 100%</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
                <FaChartLine className="text-orange-500 text-base mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-slate-900">Advanced Analytics</h5>
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">รายงานยอดขายรายวัน คัดกรองรายสาขา</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🧾 ส่วนอินเตอร์เฟซและฟอร์มฝั่งขวา (การ์ดฟอร์มสีขาวกระจ่างตา) */}
          <div className="md:col-span-5 relative z-10 w-full max-w-sm mx-auto md:max-w-none">
            
            {/* โหมดที่ 1: หน้าเริ่มต้นต้อนรับ */}
            {activeMode === 'welcome' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 text-center w-full text-left">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-[#FAF6F0] border border-[#EFE9DE] text-orange-500 rounded-xl flex items-center justify-center text-lg mx-auto shadow-sm">
                    <FaStore />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight pt-1">เริ่มต้นจัดการร้านค้า</h3>
                  <p className="text-slate-500 text-xs font-semibold">เลือกเข้าสู่ระบบพาร์ตเนอร์ศูนย์บริการ</p>
                </div>

                <div className="space-y-3 pt-1">
                  <button 
                    onClick={() => resetRegisterForm('register')}
                    className="w-full bg-[#111625] hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] group"
                  >
                    <FaUserPlus className="text-xs text-orange-400" /> 
                    <span>ลงทะเบียนเปิดร้านค้าฟรี</span>
                    <FaChevronRight className="text-[10px] text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button 
                    onClick={() => resetRegisterForm('login')}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <FaSignInAlt className="text-xs text-slate-400" /> 
                    <span>เข้าสู่ระบบ Merchant Center</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[240px] mx-auto pt-2 border-t border-slate-100 text-center font-medium">
                  ยอมรับ <a href="#" className="underline hover:text-orange-500">ข้อตกลงและเงื่อนไข</a> แพลตฟอร์มพาร์ตเนอร์
                </p>
              </div>
            )}

            {/* โหมดที่ 2: ฝังหน้าล็อกอินตัวจริง */}
            {activeMode === 'login' && (
              <div className="animate-fadeIn">
                <LoginPage />
              </div>
            )}

            {/* โหมดที่ 3: ฟอร์มลงทะเบียนร้านค้าใหม่ */}
            {activeMode === 'register' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-5 w-full text-left animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900 tracking-tight">ลงทะเบียนร้านค้าใหม่</h3>
                  <button 
                    onClick={() => resetRegisterForm('welcome')}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                    disabled={isRegisterLoading}
                  >
                    ย้อนกลับ
                  </button>
                </div>

                {displayError && (
                  <div className="text-red-500 text-xs font-bold bg-red-50/5 border border-red-200/50 p-2.5 rounded-xl">
                    {displayError}
                  </div>
                )}

                {registerSuccess && (
                  <div className="text-emerald-600 text-xs font-bold bg-emerald-50/5 border border-emerald-200/50 p-2.5 rounded-xl">
                    {registerSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                      ชื่อร้านค้า (Shop Name)
                    </label>
                    <input 
                      type="text" 
                      placeholder="เช่น สบายมาร์ท ชุมชน" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      disabled={isRegisterLoading}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all placeholder:text-slate-400" 
                    />
                    {/* สีข้อความคำแนะนำอ่านง่าย คอนทราสต์ตัดสวยสว่างพรีเมียม */}
                    <p className="mt-1 text-[10px] text-slate-500 font-semibold leading-normal pl-0.5">
                      คำแนะนำ: สามารถระบุชื่อพิกัดหรือชื่อสาขาพ่วงท้ายได้ เช่น สบายมาร์ท (สาขาเมืองนครสวรรค์)
                    </p>
                  </div>
                  
                  {/* ตัวเลือกหมวดหมู่ธุรกิจสากล */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest select-none flex items-center gap-1.5">
                      <FaBriefcase className="text-orange-500 text-[9px]" /> ประเภทกลุ่มธุรกิจของร้านค้า
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      disabled={isRegisterLoading}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all cursor-pointer"
                    >
                      {businessCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="text-slate-900 font-bold">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-[#D46B08] font-semibold leading-normal pl-0.5">
                      *ระบบจะจัดหน้าจอ POS และกลุ่มสินค้าขากลางที่เหมาะสมให้พาร์ตเนอร์ใช้งานอัตโนมัติ
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                      ชื่อย่อลิงก์สาขา (Shop Slug)
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-orange-500 transition-all">
                      <span className="bg-slate-100 px-3 py-2.5 text-[11px] text-slate-400 font-mono font-bold border-r border-slate-200 select-none">slug/</span>
                      <input 
                        type="text" 
                        placeholder="my-shop" 
                        value={shopSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        disabled={isRegisterLoading}
                        className="w-full px-3.5 py-2.5 text-xs bg-transparent outline-none font-mono text-slate-900 placeholder:text-slate-400" 
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isRegisterLoading}
                    className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] ${
                      isRegisterLoading 
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' 
                        : 'bg-[#111625] hover:bg-slate-800 text-white mt-2 shadow-slate-900/10'
                    }`}
                  >
                    {isRegisterLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span className="text-white">กำลังส่งข้อมูลเปิดร้านค้า...</span>
                      </>
                    ) : (
                      // 🟢 [UX POLISH] ปรับเป็นสีขาวสว่าง คมชัด ไม่จมหายไปกับปุ่มสีน้ำเงินเข้ม
                      <span className="text-white">ส่งข้อมูลเปิดร้านค้าฟรี</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 📑 GLOBAL FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 text-center text-[11px] text-slate-400 font-medium select-none">
        &copy; {new Date().getFullYear()} SADUAKSABUY.COM. All rights reserved.
      </footer>

    </div>
  );
};

export default PartnerWelcomePage;