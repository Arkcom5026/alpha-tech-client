// src/features/bank/pages/ListBankPage.jsx
// 🏛️ Premium Next-Gen POS Bank Settings Hub: (Dynamic Path Unified Slate Layout)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import useBankStore from '@/features/bank/store/bankStore';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}>{children}</span>
);

const ActionButton = ({ children, className = '', type = 'button', ...rest }) => (
  <button
    type={type}
    className={`px-3 py-1.5 rounded-xl text-xs font-black transition focus:outline-none active:scale-95 disabled:opacity-40 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const ListBankPage = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin: isSuperAdminFromStore } = useAuthStore();
  
  const roleName = (
    user?.roleName || user?.role?.name || user?.role || user?.profile?.roleName || user?.profile?.role || ''
  ).toString();
  const roleId = user?.roleId ?? user?.role?.id ?? user?.profile?.roleId ?? user?.profile?.role?.id;
  
  const isSuperAdmin = Boolean(
    isSuperAdminFromStore === true ||
    roleName.toUpperCase() === 'SUPERADMIN' ||
    roleId === 1 ||
    user?.isSuperAdmin === true
  );

  const { banks, fetchBanksAction, toggleBankActiveAction } = useBankStore();
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState('all');
  const [confirm, setConfirm] = React.useState(null);

  React.useEffect(() => {
    fetchBanksAction({ search, active: active === 'all' ? undefined : active === 'true' });
  }, [search, active, fetchBanksAction]);

  // 🟢 [DYNAMIC PATH MATCHING]: ผูกพาธสัมพัทธ์โดยแกะพิกัดจากตำแหน่งเบราว์เซอร์ปัจจุบันโดยตรง ป้องกันหน้าจอว่างเปล่าเด้งหลุด
  const currentPath = window.location.pathname;

  const onEdit = (row) => navigate(`${currentPath}/${row.id}/edit`);

  const handleToggle = (row) => {
    const nextActive = !row?.active;
    setConfirm({ row, nextActive });
  };

  const proceedToggle = async () => {
    if (!isSuperAdmin) return setConfirm(null);
    if (!confirm?.row) return setConfirm(null);
    await toggleBankActiveAction(confirm.row.id);
    setConfirm(null);
  };

  const rows = Array.isArray(banks) ? banks : [];

  return (
    <div className="p-3 md:p-5 w-full flex flex-col items-center selection:bg-slate-900 selection:text-white font-sans text-xs md:text-sm antialiased font-semibold text-slate-800 animate-fadeIn">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-sm p-4 overflow-hidden">
        
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 select-none">
          <div>
            <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-wide">รายการสารบบสมุดบัญชีธนาคาร</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">กำหนดข้อมูลธนาคารรับ/จ่ายเงินของหน่วยงาน ควบคุมสิทธิ์สากลด้วยระบบเซสชัน SuperAdmin เท่านั้น</p>
          </div>
          <ActionButton
            className="bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed border border-slate-900"
            onClick={() => isSuperAdmin && navigate(`${currentPath}/create`)}
            disabled={!isSuperAdmin}
            title={!isSuperAdmin ? 'สิทธิ์ไม่ถึงระดับ SuperAdmin' : undefined}
          >
            เพิ่มธนาคารใหม่
          </ActionButton>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 select-none">
          <input
            className="border border-slate-200 rounded-xl px-3 h-8 w-full max-w-xs bg-slate-50 focus:bg-white focus:border-slate-900 outline-none text-xs font-bold shadow-inner transition-all"
            placeholder="พิมพ์ค้นชื่อสถาบันธนาคาร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-slate-200 rounded-xl px-3 h-8 bg-slate-50 text-xs font-bold outline-none cursor-pointer"
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            <option value="all">แสดงสถาบันทั้งหมด</option>
            <option value="true">เฉพาะสถานะใช้งานอยู่</option>
            <option value="false">เฉพาะสถานะปิดใช้งาน</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-wider select-none border-b border-slate-100">
              <tr>
                <th className="p-2.5 w-[60px] text-center">#</th>
                <th className="p-2.5">รายชื่อสถาบันธนาคารรับ-จ่าย</th>
                <th className="p-2.5 w-[120px] text-center">สถานะใช้งาน</th>
                <th className="p-2.5 text-center w-[180px]">การจัดการควบคุม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic font-bold select-none">❌ ไม่พบประวัติรายชื่อข้อมูลบัญชีธนาคารในขอบเขตนี้</td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5"><span className="font-black text-slate-900 text-xs sm:text-sm select-all">{row.name}</span></td>
                    <td className="p-2.5 text-center select-none">
                      {row.active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">ใช้งานอยู่</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-400 border border-slate-200">ปิดใช้งาน</Badge>
                      )}
                    </td>
                    <td className="p-2.5 text-center select-none">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          onClick={() => onEdit(row)}
                        >
                          แก้ไขข้อมูล
                        </ActionButton>
                        {isSuperAdmin && (
                          <ActionButton
                            className={`text-white ${row.active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            onClick={() => handleToggle(row)}
                          >
                            {row.active ? 'สั่งระงับ' : 'เปิดใช้งาน'}
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {confirm && (
          <div className="mt-3 p-3 flex flex-col sm:flex-row sm:items-center justify-between bg-amber-50 border border-amber-100 rounded-xl animate-slideUp gap-2 select-none">
            <div className="text-xs font-black text-amber-900">
              ⚠️ ยืนยันการเปลี่ยนแปลงระบบเป็น [{confirm.nextActive ? 'กู้คืนเปิดใช้งาน' : 'ระงับปิดใช้งาน'}] ของธนาคาร “{confirm.row?.name}” หรือไม่?
            </div>
            <div className="flex gap-1.5 shrink-0 justify-end">
              <ActionButton className="border border-amber-200 bg-white text-amber-800 hover:bg-amber-100" onClick={() => setConfirm(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-slate-900 text-white hover:bg-slate-800" onClick={proceedToggle} disabled={!isSuperAdmin}>
                ยืนยันคำสั่ง
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBankPage;