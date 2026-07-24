// src/features/auth/components/SubEmployeeManager.jsx

import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '@/utils/apiClient';
import useEmployeeStore from '@/features/employee/store/employeeStore';
import {
  FaBriefcase,
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
  CASHIER: { label: 'แคชเชียร์', description: 'ขายสินค้า เปิดกะ รับชำระเงิน และออกใบเสร็จหน้าร้าน' },
  MANAGER: { label: 'ผู้จัดการร้าน', description: 'ดูแลงานขาย คลังสินค้า และรายงานภายในสาขา' },
};

const emptyForm = (positionId = '') => ({
  name: '', email: '', password: '', phone: '', v2Role: 'CASHIER', positionId,
});

const SubEmployeeManager = () => {
  const positions = useEmployeeStore((state) => state.positions || []);
  const fetchPositionsAction = useEmployeeStore((state) => state.fetchPositionsAction);

  const [form, setForm] = useState(emptyForm());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchPositionsAction(); }, [fetchPositionsAction]);
  useEffect(() => {
    if (!form.positionId && positions[0]?.id) {
      setForm((current) => ({ ...current, positionId: String(positions[0].id) }));
    }
  }, [form.positionId, positions]);

  const selectedRole = roleDetails[form.v2Role];
  const selectedPosition = useMemo(
    () => positions.find((position) => Number(position.id) === Number(form.positionId)) || null,
    [form.positionId, positions],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const handleCreateEmployee = async (event) => {
    event.preventDefault();
    setError('');
    setCreatedEmployee(null);
    setCopied(false);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
      v2Role: form.v2Role,
      positionId: Number(form.positionId),
    };

    if (!payload.name || !payload.email || !payload.password.trim() || !payload.positionId) {
      setError('กรุณากรอกข้อมูลบัญชี บทบาทในร้าน และตำแหน่งงานให้ครบถ้วน');
      return;
    }
    if (payload.password.length < 6) {
      setError('รหัสผ่านเริ่มต้นต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/add-sub-employee', payload);
      const data = response?.data?.data || {};
      setCreatedEmployee({ ...payload, ...data, position: data.position || selectedPosition });
      setForm(emptyForm(positions[0]?.id ? String(positions[0].id) : ''));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'ไม่สามารถสร้างบัญชีพนักงานได้ กรุณาลองใหม่อีกครั้ง');
      console.error('สร้างบัญชีพนักงานไม่สำเร็จ:', requestError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdEmployee) return;
    const text = [
      'ข้อมูลเข้าสู่ระบบพนักงาน',
      `ชื่อ: ${createdEmployee.name}`,
      `อีเมล: ${createdEmployee.email}`,
      `รหัสผ่านเริ่มต้น: ${createdEmployee.password}`,
      `บทบาทในร้าน: ${roleDetails[createdEmployee.v2Role]?.label || createdEmployee.v2Role}`,
      `ตำแหน่งงาน: ${createdEmployee.position?.name || 'ไม่ระบุ'}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error('คัดลอกข้อมูลบัญชีไม่สำเร็จ:', copyError);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600"><FaUserPlus /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Employee onboarding</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">เพิ่มพนักงานใหม่</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">สร้างบัญชี กำหนดบทบาทและตำแหน่งงาน พร้อมส่งข้อมูลเข้าสู่ระบบให้พนักงานในครั้งเดียว</p>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">สร้างแล้วใช้งานได้ทันที · ไม่ต้องอนุมัติซ้ำ</div>
      </div>

      <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-3">
        {[
          ['1', 'กรอกข้อมูลบัญชี', 'ชื่อ อีเมล รหัสผ่าน และเบอร์โทร'],
          ['2', 'กำหนดงานและสิทธิ์', 'เลือกบทบาทในร้านและตำแหน่งงาน'],
          ['3', 'ส่งข้อมูลให้พนักงาน', 'พนักงานเข้าสู่ระบบและใช้งานได้ทันที'],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">{number}</span>
              <div><p className="text-sm font-black text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p></div>
            </div>
          </div>
        ))}
      </div>

      {createdEmployee && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3"><FaCheckCircle className="mt-0.5 text-xl text-emerald-600" /><div><h4 className="font-black text-emerald-950">สร้างบัญชีพนักงานสำเร็จ</h4><p className="mt-1 text-sm text-emerald-800">บัญชีพร้อมใช้งานและผูกตำแหน่งงานเรียบร้อยแล้ว</p></div></div>
            <button type="button" onClick={handleCopyCredentials} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-xs font-black text-emerald-800 hover:bg-emerald-100"><FaCopy />{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อมูลเข้าสู่ระบบ'}</button>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['ชื่อพนักงาน', createdEmployee.name],
              ['บทบาทในร้าน', roleDetails[createdEmployee.v2Role]?.label || createdEmployee.v2Role],
              ['ตำแหน่งงาน', createdEmployee.position?.name || '-'],
              ['อีเมลเข้าสู่ระบบ', createdEmployee.email],
              ['รหัสผ่านเริ่มต้น', createdEmployee.password],
              ['สาขา', createdEmployee.branch?.name || (createdEmployee.branchId ? `สาขา #${createdEmployee.branchId}` : '-')],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-emerald-200 bg-white p-3"><dt className="text-[11px] font-bold text-slate-500">{label}</dt><dd className="mt-1 break-all text-sm font-black text-slate-900">{value}</dd></div>)}
          </dl>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form onSubmit={handleCreateEmployee} className="space-y-5 lg:col-span-7" noValidate>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

          <Field label="ชื่อ-นามสกุลพนักงาน" icon={<FaUser />}><input value={form.name} onChange={(e) => updateField('name', e.target.value)} disabled={isLoading} placeholder="เช่น สมชาย ใจดี" className="w-full bg-transparent px-3 py-3 text-sm font-semibold outline-none" /></Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="อีเมลสำหรับเข้าสู่ระบบ" icon={<FaEnvelope />}><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} disabled={isLoading} placeholder="staff@example.com" className="w-full bg-transparent px-3 py-3 text-sm font-semibold outline-none" /></Field>
            <Field label="รหัสผ่านเริ่มต้น" icon={<FaLock />}><input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} disabled={isLoading} placeholder="อย่างน้อย 6 ตัวอักษร" className="w-full bg-transparent px-3 py-3 font-mono text-sm font-semibold outline-none" /></Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="เบอร์โทรศัพท์ติดต่อ (ไม่บังคับ)" icon={<FaPhone />}><input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} disabled={isLoading} placeholder="เช่น 0812345678" className="w-full bg-transparent px-3 py-3 text-sm font-semibold outline-none" /></Field>
            <div><label className="mb-2 block text-xs font-black text-slate-700">บทบาทในร้าน</label><select value={form.v2Role} onChange={(e) => updateField('v2Role', e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"><option value="CASHIER">แคชเชียร์</option><option value="MANAGER">ผู้จัดการร้าน</option></select><p className="mt-1.5 text-[11px] leading-5 text-slate-500">{selectedRole.description}</p></div>
          </div>

          <div><label className="mb-2 block text-xs font-black text-slate-700">ตำแหน่งงาน</label><div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100"><FaBriefcase className="text-sm text-slate-400" /><select value={form.positionId} onChange={(e) => updateField('positionId', e.target.value)} disabled={isLoading || positions.length === 0} className="w-full bg-transparent px-3 py-3 text-sm font-bold outline-none">{positions.length === 0 ? <option value="">กำลังโหลดตำแหน่งงาน...</option> : positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}</select></div><p className="mt-1.5 text-[11px] text-slate-500">ตำแหน่งนี้จะแสดงในหน้าจัดการพนักงานทันที</p></div>

          <button type="submit" disabled={isLoading || positions.length === 0} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white ${isLoading || positions.length === 0 ? 'cursor-not-allowed bg-orange-300' : 'bg-orange-500 hover:bg-orange-600'}`}>{isLoading ? <><FaSpinner className="animate-spin" />กำลังสร้างบัญชีพนักงาน...</> : <><FaUserPlus />สร้างบัญชีพนักงาน</>}</button>
        </form>

        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600"><FaShieldAlt /></div><div><h4 className="text-sm font-black text-slate-900">สิ่งที่ระบบทำให้อัตโนมัติ</h4><p className="mt-0.5 text-xs text-slate-600">ไม่มีขั้นตอนซ่อนหลังจากกดสร้างบัญชี</p></div></div><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li>• สร้างบัญชีผู้ใช้และโปรไฟล์ที่เกี่ยวข้องพร้อมกัน</li><li>• ผูกสาขา บทบาท และตำแหน่งใน transaction เดียว</li><li>• เปิดใช้งานทันทีโดยไม่ต้องอนุมัติซ้ำ</li><li>• แสดงข้อมูลครบในหน้าจัดการพนักงาน</li></ul></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h4 className="text-sm font-black text-amber-950">บทบาทในร้านและตำแหน่งงาน</h4><p className="mt-2 text-xs leading-6 text-amber-900">บทบาทกำหนดขอบเขตงานหลัก ส่วนตำแหน่งใช้แสดงโครงสร้างหน้าที่ ทั้งสองค่าถูกบันทึกพร้อมกันตั้งแต่สร้างบัญชี</p></div>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, icon, children }) => <div><label className="mb-2 block text-xs font-black text-slate-700">{label}</label><div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100"><span className="text-sm text-slate-400">{icon}</span>{children}</div></div>;

export default SubEmployeeManager;
