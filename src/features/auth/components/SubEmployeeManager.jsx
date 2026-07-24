// src/features/auth/components/SubEmployeeManager.jsx

import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  FaCheckCircle,
  FaCopy,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaShieldAlt,
  FaSpinner,
  FaUser,
  FaUserPlus,
} from 'react-icons/fa';

const roleDetails = {
  CASHIER: {
    label: 'แคชเชียร์',
    description: 'ขายสินค้า เปิดกะ รับชำระเงิน และออกใบเสร็จหน้าร้าน',
  },
  MANAGER: {
    label: 'ผู้จัดการร้าน',
    description: 'ดูแลงานขาย คลังสินค้า และรายงานภายในสาขา',
  },
};

const SubEmployeeManager = () => {
  const addSubEmployeeAction = useAuthStore((state) => state.addSubEmployeeAction);
  const isSubEmployeeLoading = useAuthStore((state) => state.isSubEmployeeLoading || false);
  const subEmployeeError = useAuthStore((state) => state.subEmployeeError || null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [v2Role, setV2Role] = useState('CASHIER');
  const [localError, setLocalError] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateEmployee = async (event) => {
    event.preventDefault();
    setLocalError('');
    setCreatedEmployee(null);
    setCopied(false);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password.trim()) {
      setLocalError('กรุณากรอกชื่อ อีเมลสำหรับเข้าสู่ระบบ และรหัสผ่านเริ่มต้นให้ครบถ้วน');
      return;
    }

    if (password.length < 6) {
      setLocalError('รหัสผ่านเริ่มต้นต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      const result = await addSubEmployeeAction({
        name: normalizedName,
        email: normalizedEmail,
        password,
        phone: phone.trim(),
        v2Role,
      });

      if (result?.ok || result) {
        const responseData = result?.data || result?.response?.data?.data || {};
        setCreatedEmployee({
          name: responseData.name || normalizedName,
          email: responseData.email || normalizedEmail,
          password,
          phone: phone.trim(),
          v2Role: responseData.v2Role || v2Role,
          branchId: responseData.branchId || null,
          employeeId: responseData.employeeId || null,
        });

        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setV2Role('CASHIER');
      }
    } catch (error) {
      console.error('สร้างบัญชีพนักงานไม่สำเร็จ:', error);
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdEmployee) return;

    const role = roleDetails[createdEmployee.v2Role]?.label || createdEmployee.v2Role;
    const text = [
      'ข้อมูลเข้าสู่ระบบพนักงาน',
      `ชื่อ: ${createdEmployee.name}`,
      `อีเมล: ${createdEmployee.email}`,
      `รหัสผ่านเริ่มต้น: ${createdEmployee.password}`,
      `บทบาทในร้าน: ${role}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('คัดลอกข้อมูลบัญชีไม่สำเร็จ:', error);
    }
  };

  const displayError = localError || subEmployeeError;
  const selectedRole = roleDetails[v2Role];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600">
            <FaUserPlus />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Employee onboarding</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">เพิ่มพนักงานใหม่</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              สร้างบัญชี กำหนดบทบาทในร้าน และส่งข้อมูลเข้าสู่ระบบให้พนักงานได้จากหน้าจอนี้ในครั้งเดียว
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          สร้างแล้วใช้งานได้ทันที · ไม่ต้องอนุมัติซ้ำ
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-3">
        {[
          ['1', 'กรอกข้อมูลบัญชี', 'ชื่อ อีเมล รหัสผ่าน และเบอร์โทร'],
          ['2', 'กำหนดบทบาทในร้าน', 'เลือกแคชเชียร์หรือผู้จัดการร้าน'],
          ['3', 'ส่งข้อมูลให้พนักงาน', 'พนักงานใช้อีเมลและรหัสผ่านเข้าสู่ระบบ'],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                {number}
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {createdEmployee && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-600" />
              <div>
                <h4 className="text-base font-black text-emerald-950">สร้างบัญชีพนักงานสำเร็จ</h4>
                <p className="mt-1 text-sm text-emerald-800">
                  ส่งข้อมูลด้านล่างให้พนักงานเพื่อเข้าสู่ระบบได้ทันที
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-xs font-black text-emerald-800 transition hover:bg-emerald-100"
            >
              <FaCopy />
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อมูลเข้าสู่ระบบ'}
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <dt className="text-[11px] font-bold text-slate-500">ชื่อพนักงาน</dt>
              <dd className="mt-1 text-sm font-black text-slate-900">{createdEmployee.name}</dd>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <dt className="text-[11px] font-bold text-slate-500">บทบาทในร้าน</dt>
              <dd className="mt-1 text-sm font-black text-slate-900">
                {roleDetails[createdEmployee.v2Role]?.label || createdEmployee.v2Role}
              </dd>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <dt className="text-[11px] font-bold text-slate-500">อีเมลเข้าสู่ระบบ</dt>
              <dd className="mt-1 break-all text-sm font-black text-slate-900">{createdEmployee.email}</dd>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <dt className="text-[11px] font-bold text-slate-500">รหัสผ่านเริ่มต้น</dt>
              <dd className="mt-1 break-all font-mono text-sm font-black text-slate-900">{createdEmployee.password}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form onSubmit={handleCreateEmployee} className="space-y-5 lg:col-span-7" noValidate>
          {displayError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              {displayError}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-black text-slate-700">ชื่อ-นามสกุลพนักงาน</label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
              <FaUser className="shrink-0 text-sm text-slate-400" />
              <input
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (localError) setLocalError('');
                }}
                disabled={isSubEmployeeLoading}
                className="w-full bg-transparent px-3 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">อีเมลสำหรับเข้าสู่ระบบ</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
                <FaEnvelope className="shrink-0 text-sm text-slate-400" />
                <input
                  type="email"
                  placeholder="staff@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (localError) setLocalError('');
                  }}
                  disabled={isSubEmployeeLoading}
                  className="w-full bg-transparent px-3 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">รหัสผ่านเริ่มต้น</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
                <FaLock className="shrink-0 text-sm text-slate-400" />
                <input
                  type="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (localError) setLocalError('');
                  }}
                  disabled={isSubEmployeeLoading}
                  className="w-full bg-transparent px-3 py-3 font-mono text-sm font-semibold text-slate-900 outline-none placeholder:font-sans placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">แจ้งรหัสผ่านนี้แก่พนักงานหลังสร้างบัญชีสำเร็จ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">เบอร์โทรศัพท์ติดต่อ <span className="font-medium text-slate-400">(ไม่บังคับ)</span></label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
                <FaPhone className="shrink-0 text-sm text-slate-400" />
                <input
                  type="text"
                  placeholder="เช่น 0812345678"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={isSubEmployeeLoading}
                  className="w-full bg-transparent px-3 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black text-slate-700">บทบาทในร้าน</label>
              <select
                value={v2Role}
                onChange={(event) => setV2Role(event.target.value)}
                disabled={isSubEmployeeLoading}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              >
                <option value="CASHIER">แคชเชียร์</option>
                <option value="MANAGER">ผู้จัดการร้าน</option>
              </select>
              <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{selectedRole.description}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubEmployeeLoading}
            className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white shadow-sm transition active:scale-[0.99] ${
              isSubEmployeeLoading
                ? 'cursor-not-allowed bg-orange-300'
                : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200'
            }`}
          >
            {isSubEmployeeLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                กำลังสร้างบัญชีพนักงาน...
              </>
            ) : (
              <>
                <FaUserPlus />
                สร้างบัญชีพนักงาน
              </>
            )}
          </button>
        </form>

        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <FaShieldAlt />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">สิ่งที่ระบบทำให้อัตโนมัติ</h4>
                <p className="mt-0.5 text-xs text-slate-600">ไม่มีขั้นตอนซ่อนหลังจากกดสร้างบัญชี</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>• สร้างบัญชีผู้ใช้และโปรไฟล์พนักงานพร้อมกัน</li>
              <li>• ผูกพนักงานเข้ากับสาขาของผู้สร้างโดยอัตโนมัติ</li>
              <li>• เปิดใช้งานและอนุมัติพนักงานทันที</li>
              <li>• พนักงานใช้อีเมลและรหัสผ่านที่กำหนดเพื่อเข้าสู่ระบบ</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h4 className="text-sm font-black text-amber-950">บทบาทในร้านกับตำแหน่งงานเป็นคนละข้อมูล</h4>
            <p className="mt-2 text-xs leading-6 text-amber-900">
              หน้านี้กำหนดบทบาทการใช้งานในร้าน เช่น แคชเชียร์หรือผู้จัดการร้าน ส่วนตำแหน่งงานภายในองค์กรสามารถจัดการเพิ่มเติมจากเมนูตำแหน่งงานภายหลังได้
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SubEmployeeManager;
