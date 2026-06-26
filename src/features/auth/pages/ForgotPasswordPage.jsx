// src/features/auth/pages/ForgotPasswordPage.jsx

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
      // 💡 จุดเชื่อมต่อ Action ส่งลิงก์กู้คืนรหัสผ่าน (ปรับเปลี่ยนตามชื่อ Store จริงของคุณ)
      // await forgotPasswordAction({ identifier: identifier.trim() });
      
      setSuccess('ระบบได้ส่งลิงก์สำหรับการตั้งรหัสผ่านใหม่ไปยังข้อมูลของคุณเรียบร้อยแล้ว');
    } catch (err) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🏛️ MASTER LAYOUT: ถอดแบบโครงสร้างพื้นหลังและฟอนต์หลักมาจากหน้าต้อนรับกลาง
    <div className="min-h-screen bg-[#FFF9F5] font-sans antialiased text-slate-800 flex flex-col justify-between relative overflow-hidden selection:bg-orange-500 selection:text-white">
      
      {/* 🔮 BACKGROUND ATMOSPHERE: บรรยากาศพื้นหลังคลื่นแสงและ Grid[cite: 5] */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-orange-200/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1e9e2_1px,transparent_1px),linear-gradient(to_bottom,#f1e9e2_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
      </div>

      {/* 🌐 TOP NAVIGATION BAR[cite: 5] */}
      <header className="w-full bg-slate-950 border-b border-orange-500/10 sticky top-0 z-50 py-4 px-6 shadow-xl shadow-slate-950/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 select-none">
            <div className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/30 tracking-wider">
              SS
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black leading-none tracking-tight text-white">
                SADUAK<span className="text-orange-500">SABUY</span>
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Hyperlocal Market
              </span>
            </div>
          </a>
          
          <Link
            to="/partner-portal"
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-2 transition-all"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>ย้อนกลับหน้าแรก</span>
          </Link>
        </div>
      </header>

      {/* 🏛️ 🚀 MAIN CONTAINER GRID[cite: 5] */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex items-center justify-center flex-1 z-10">
        
        <div className="w-full min-h-[560px] rounded-[44px] bg-slate-950 text-white shadow-2xl border border-slate-800 p-8 md:p-12 lg:p-16 relative overflow-hidden group grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.14),transparent_40%)] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

          {/* 🌌 ส่วนข้อมูลด้านซ้าย (7 คอลัมน์)[cite: 5] */}
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

          {/* 🧾 ส่วนอินเตอร์เฟซฟอร์มฝั่งขวา (5 คอลัมน์)[cite: 5] */}
          <div className="md:col-span-5 relative z-10 w-full max-w-sm mx-auto md:max-w-none">
            
            <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 text-center w-full shadow-2xl shadow-black/20 text-left">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center text-lg mx-auto shadow-md shadow-orange-500/20">
                  <FaLock />
                </div>
                <h3 className="font-black text-lg text-white tracking-tight pt-1">ลืมรหัสผ่าน?</h3>
                <p className="text-slate-500 text-xs font-semibold">กรอกข้อมูลบัญชีเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
              </div>

              <div className="w-full space-y-4 pt-1">
                {error && (
                  <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                    {success}
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="อีเมลหรือเบอร์โทรศัพท์ของคุณ"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      className="w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-slate-600 border-white/10 focus:border-orange-500 focus:bg-white/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] ${
                      loading || !identifier.trim()
                        ? 'bg-orange-500/30 cursor-not-allowed text-white/50 shadow-none'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/15'
                    }`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>กำลังส่งข้อมูล...</span>
                      </>
                    ) : (
                      'ส่งลิงก์กู้คืนรหัสผ่าน'
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center text-[11px] font-bold pt-2 border-t border-white/5 select-none w-full">
                  <Link
                    to="/partner-portal"
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 📑 GLOBAL FOOTER[cite: 5] */}
      <footer className="w-full bg-white border-t border-slate-200/50 py-4 text-center text-[11px] text-slate-400 font-medium select-none">
        &copy; {new Date().getFullYear()} SADUAKSABUY.COM. All rights reserved.
      </footer>

    </div>
  );
};

export default ForgotPasswordPage;