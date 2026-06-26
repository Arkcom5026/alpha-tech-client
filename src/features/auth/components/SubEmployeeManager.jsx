// src/features/auth/components/SubEmployeeManager.jsx
// 🏛️ Back-Office Sub-Employee Management (Owner Command Edition)

import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FaSpinner, FaShieldAlt, FaEnvelope, FaUser, FaPhone, FaLock } from 'react-icons/fa';

const SubEmployeeManager = () => {
  // 🟢 เรียกใช้งาน Action และ State จาก Zustand Store
  const addSubEmployeeAction = useAuthStore((state) => state.addSubEmployeeAction);
  const isSubEmployeeLoading = useAuthStore((state) => state.isSubEmployeeLoading || false);
  const subEmployeeError = useAuthStore((state) => state.subEmployeeError || null);

  // 📝 Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [v2Role, setV2Role] = useState('CASHIER'); // ค่าเริ่มต้นเป็นพนักงานแคชเชียร์ประจำเครื่อง POS

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🚀 SUBMIT HANDLER
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // 🔍 Front-End Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError('กรุณากรอกข้อมูล ชื่อ, อีเมล และรหัสผ่าน ให้ครบถ้วน');
      return;
    }

    if (password.length < 6) {
      setLocalError('เพื่อความปลอดภัย รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      // 🚀 ยิงส่งข้อมูลไปให้หลังบ้านสลักสิทธิ์แชร์สาขาผ่าน Zustand Store (สับสายผ่าน apiClient ปลอดภัย 100%)
      const result = await addSubEmployeeAction({ name, email, password, phone, v2Role });

      // ตรวจสอบเงื่อนไขการตอบกลับจากโครงสร้างหลังบ้าน Atomic Transaction
      if (result?.ok || result) {
        setSuccessMessage(`เพิ่มพนักงาน "${name}" เข้าสู่ระบบและสับรางรหัสสาขาสำเร็จแล้ว!`);
        
        // ล้างข้อมูลในฟอร์มเมื่อสำเร็จ
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setV2Role('CASHIER');
      }
    } catch (err) {
      // เออร์เรอร์จากเซิร์ฟเวอร์จะถูกจับและแสดงผลผ่าน Store ไปยังตัวแปร subEmployeeError โดยอัตโนมัติ
      console.error('❌ คลื่นสัญญาณการบันทึกพนักงานย่อยขัดข้อง:', err);
    }
  };

  const displayError = localError || subEmployeeError;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* เอฟเฟกต์แสงส้ม Ambient ด้านหลัง */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.08),transparent_40%)] pointer-events-none" />

      {/* 💳 HEADER PANEL */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-5 mb-6">
        <div className="w-11 h-11 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center text-lg">
          <FaShieldAlt />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-white leading-none">จัดการสิทธิ์ทีมงานหลังร้าน</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5 uppercase tracking-wider">
            เพิ่มบัญชีพนักงานย่อยเพื่อสืบทอดสิทธิ์คุมเครื่องและตัดสต๊อกภายในสาขาเดียวกัน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* 📝 ฝั่งฟอร์มกรอกข้อมูล (7 คอลัมน์) */}
        <form onSubmit={handleCreateEmployee} className="md:col-span-7 space-y-4" noValidate>
          
          {displayError && (
            <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-fadeIn">
              ⚠️ {displayError}
            </div>
          )}

          {successMessage && (
            <div className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl animate-fadeIn">
              🎉 {successMessage}
            </div>
          )}

          {/* ชื่อพนักงาน */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ชื่อ-นามสกุล พนักงาน
            </label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-orange-500 focus-within:bg-white/10 transition-all px-3.5">
              <FaUser className="text-slate-500 text-xs shrink-0" />
              <input 
                type="text" 
                placeholder="เช่น สมชาย ใจดี"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (localError) setLocalError('');
                }}
                disabled={isSubEmployeeLoading}
                className="w-full px-3 py-2.5 bg-transparent outline-none text-xs text-white placeholder:text-slate-600 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* อีเมลล็อกอิน */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                อีเมลเข้าใช้งาน (Login Email)
              </label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-orange-500 focus-within:bg-white/10 transition-all px-3.5">
                <FaEnvelope className="text-slate-500 text-xs shrink-0" />
                <input 
                  type="email" 
                  placeholder="staff@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  disabled={isSubEmployeeLoading}
                  className="w-full px-3 py-2.5 bg-transparent outline-none text-xs text-white placeholder:text-slate-600 font-bold"
                />
              </div>
            </div>

            {/* รหัสผ่านเริ่มต้น */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                กำหนดรหัสผ่าน (Password)
              </label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-orange-500 focus-within:bg-white/10 transition-all px-3.5">
                <FaLock className="text-slate-500 text-xs shrink-0" />
                <input 
                  type="password" 
                  placeholder="ความยาว 6 ตัวขึ้นไป"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  disabled={isSubEmployeeLoading}
                  className="w-full px-3 py-2.5 bg-transparent outline-none text-xs text-white placeholder:text-slate-600 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* เบอร์โทรศัพท์ */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                เบอร์โทรศัพท์ติดต่อ (ไม่บังคับ)
              </label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-orange-500 focus-within:bg-white/10 transition-all px-3.5">
                <FaPhone className="text-slate-500 text-xs shrink-0" />
                <input 
                  type="text" 
                  placeholder="เช่น 0812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubEmployeeLoading}
                  className="w-full px-3 py-2.5 bg-transparent outline-none text-xs text-white placeholder:text-slate-600 font-bold"
                />
              </div>
            </div>

            {/* การเลือกตำแหน่งย่อยสลับสิทธิ์ภายในสาขา */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ระดับตำแหน่ง (Store Role)
              </label>
              <select
                value={v2Role}
                onChange={(e) => setV2Role(e.target.value)}
                disabled={isSubEmployeeLoading}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:bg-white/10 focus:border-orange-500 transition-all cursor-pointer select-none"
              >
                <option value="CASHIER" className="bg-slate-950 text-white font-bold">CASHIER (พนักงานคิดเงินหน้าร้าน POS)</option>
                <option value="MANAGER" className="bg-slate-950 text-white font-bold">MANAGER (ผู้จัดการร้าน คุมคลังสินค้าและยอดขาย)</option>
              </select>
            </div>
          </div>

          {/* ปุ่มกดยืนยันบันทึกข้อมูล */}
          <button 
            type="submit"
            disabled={isSubEmployeeLoading}
            className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] ${
              isSubEmployeeLoading
                ? 'bg-orange-500/30 cursor-not-allowed text-white/50' 
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/15 mt-2'
            }`}
          >
            {isSubEmployeeLoading ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>กำลังบันทึกข้อมูลพนักงานใหม่...</span>
              </>
            ) : (
              'เปิดสิทธิ์และสร้างบัญชีพนักงานย่อย'
            )}
          </button>
        </form>

        {/* ℹ️ ส่วนข้อมูลกล่องอธิบายเงื่อนไขด้านขวา (5 คอลัมน์) */}
        <div className="md:col-span-5 bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-4 self-stretch flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-orange-400 uppercase tracking-wider">🔒 นโยบายความปลอดภัยสิทธิ์ร่วมสาขา</h4>
            <ul className="space-y-2.5 text-[11px] text-slate-400 font-medium leading-relaxed list-disc list-inside">
              <li>พนักงานรายใหม่จะสืบทอดสิทธิ์เข้าใช้งานรหัสสาขาเดียวกับแบรนด์ของคุณทันทีโดยอ้างอิงอัตโนมัติ</li>
              <li><strong className="text-white">CASHIER:</strong> เข้าถึงได้เฉพาะเมนูเปิดกะ ขายสินค้า และออกใบเสร็จหน้าร้าน</li>
              <li><strong className="text-white">MANAGER:</strong> สามารถเข้าช่วยจัดการเพิ่ม-ลดสต๊อกสินค้า และเปิดดูรายงานยอดขายสรุปวันได้</li>
            </ul>
          </div>
          <div className="text-[10px] text-slate-500 leading-normal border-t border-white/5 pt-3">
            * หลังจากบันทึกสำเร็จ พนักงานสามารถนำอีเมลนี้ไปพิมพ์เข้าใช้งานที่หน้าล็อกอินหลักหลังบ้านได้ทันที
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubEmployeeManager;