// src/features/auth/pages/ForgotPasswordPage.jsx
// 🏛️ Masterpiece Single Container Edition: Integrated Hyperlocal Theme
// 🎨 Warm Luxury Style - Fully Synced with Marketplace Design Language (Original Code Base Enhanced)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { 
  FaLock, 
  FaSpinner, 
  FaArrowLeft,
  FaBolt,
  FaBoxes,
  FaChartLine
} from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 🟢 CONNECT ZUSTAND ENGINE: ล็อกท่อเข้าหา Action กลางในสเตตสโตร์จริงของระบบ
  const requestPasswordResetAction = useAuthStore((state) => state.requestPasswordResetAction);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ของคุณ');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 🟢 [API STORE CALL]: เรียกใช้งานผ่านแอกชันหลักเพื่อส่งต่อ Payload กู้คืนรหัสผ่านข้ามฝั่งไปหลังบ้าน
      await requestPasswordResetAction({ email: identifier.trim() });
      setSuccess('ระบบได้ส่งลิงก์สำหรับการตั้งรหัสผ่านใหม่ไปยังข้อมูลของคุณเรียบร้อยแล้ว');
      setIdentifier('');
    } catch (err) {
      // ดักจับชุดข้อความเออร์เรอร์จากเซิร์ฟเวอร์มาแสดงผลหน้าระบบ
      setError(err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🎨 [THEME INTEGRATION] ย้อมสีพื้นหลังเป็นสีครีมอุ่นละมุนแบบเดียวกับหน้าแรกของตลาดกลาง
    <div className="min-h-screen bg-[#FDFBF9] font-sans antialiased text-slate-800 flex flex-col justify-between relative overflow-hidden">
      
      {/* 🔮 BACKGROUND LATTICE GRID & BLUR EFFECTS */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5ebe2_1px,transparent_1px),linear-gradient(to_bottom,#f5ebe2_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      </div>

      {/* 🌐 TOP NAVIGATION BAR (คุมธีมสีกรมท่าลึก ขอบทองส้มหรูหราเข้าชุดคู่แฝด) */}
      <header className="w-full bg-[#111625] border-b border-orange-500/10 sticky top-0 z-50 py-4 px-6 shadow-md shadow-slate-900/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 select-none">
            <div className="bg-[#EF6C00] text-white w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/20 tracking-wider">
              SS
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black leading-none tracking-tight text-white">
                SADUAK<span className="text-orange-500">SABUY</span>
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Hyperlocal Market
              </span>
            </div>
          </a>
          
          <Link
            to="/partner-portal"
            className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <FaArrowLeft className="text-[10px] text-orange-400" />
            <span>ย้อนกลับหน้าแรก</span>
          </Link>
        </div>
      </header>

      {/* 🏛️ MAIN SCREEN BOX CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex items-center justify-center flex-1 z-10">
        
        {/* 🟢 [UX REVOLUTION] เปลี่ยนจากกล่องดำทึบอึดอัดดั้งเดิม เป็นพาเนลสีครีมสว่างสลับขาว นวลตาสไตล์มินิมอล Warm Luxury */}
        <div className="w-full min-h-[540px] rounded-[36px] bg-[#FAF6F0] text-slate-800 shadow-xl shadow-slate-200/60 border border-[#EFE9DE] p-8 md:p-12 lg:p-16 relative overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(250,140,22,0.05),transparent_40%)] pointer-events-none" />

          {/* 🌌 ส่วนข้อมูลด้านซ้าย (ดึงสไตล์ฟอนต์และการไล่เฉดสว่างพรีเมียมมาจากหน้าแรก) */}
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
                  <p className="text-[11px] text-slate-500 leading-normal font-medium">ตัดสต๊อกอัตโนมัติ สพันธ์ตรงกัน 100%</p>
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

          {/* 🧾 ส่วนอินเตอร์เฟซฟอร์มฝั่งขวา (กล่องการ์ดสีขาวสว่าง คอนทราสต์อ่านง่ายขึ้นชัดเจน) */}
          <div className="md:col-span-5 relative z-10 w-full max-w-sm mx-auto md:max-w-none">
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-5 w-full text-left">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#FAF6F0] border border-[#EFE9DE] text-orange-500 rounded-xl flex items-center justify-center text-lg mx-auto shadow-sm">
                  <FaLock />
                </div>
                <h3 className="font-black text-base text-slate-900 tracking-tight pt-1">ลืมรหัสผ่าน?</h3>
                <p className="text-slate-500 text-xs font-semibold">กรอกข้อมูลบัญชีเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
              </div>

              <div className="w-full space-y-4 pt-1">
                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50/5 border border-red-200/50 p-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-emerald-600 text-xs font-bold bg-emerald-50/5 border border-emerald-200/50 p-2.5 rounded-xl">
                    {success}
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                      ข้อมูลบัญชีผู้ใช้งาน
                    </label>
                    {/* ปรับสไตล์ช่อง Input ย้อมสีสว่างกรอบชัด ไม่มืดมนจมสายตา */}
                    <input
                      type="text"
                      placeholder="อีเมลหรือเบอร์โทรศัพท์ของคุณ"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* ปุ่มกดส่งข้อมูลสีน้ำเงินลึก สว่าง คมชัด ตัดกับตัวอักษรสีขาวบริสุทธิ์แก้อาการจม */}
                  <button
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] ${
                      loading || !identifier.trim()
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                        : 'bg-[#111625] hover:bg-slate-800 text-white mt-2 shadow-slate-900/10'
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span className="text-white">กำลังส่งข้อมูล...</span>
                      </>
                    ) : (
                      <span className="text-white">ส่งลิงก์กู้คืนรหัสผ่าน</span>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center text-[11px] font-bold pt-2 border-t border-slate-100 select-none w-full">
                  <Link
                    to="/partner-portal"
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </Link>
                </div>

              </div>
            </div>

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

export default ForgotPasswordPage;