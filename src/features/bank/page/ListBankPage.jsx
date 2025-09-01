// ✅ src/features/bank/pages/ListBankPage.jsx (ปรับรูปแบบให้เหมือนหน้า ListProductTemplatePage และคุมสิทธิ์ SuperAdmin สำหรับเพิ่ม/ปิดใช้งานธนาคาร)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import useBankStore from '@/features/bank/store/bankStore';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>
);

const ActionButton = ({ children, className = '', type = 'button', ...rest }) => (
  <button
    type={type}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${className}`}
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

  const onEdit = (row) => navigate(`edit/${row.id}`);

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
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการธนาคาร</h1>
          <ActionButton
            className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50"
            onClick={() => isSuperAdmin && navigate('create')}
            disabled={!isSuperAdmin}
            title={!isSuperAdmin ? 'ต้องเป็น SuperAdmin' : undefined}
          >
            เพิ่มธนาคาร
          </ActionButton>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full max-w-md bg-white dark:bg-zinc-900"
            placeholder="ค้นหาชื่อธนาคาร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900"
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="true">ใช้งานอยู่</option>
            <option value="false">ปิดใช้งาน</option>
          </select>
        </div>

        <div className="border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <table className="min-w-full text-sm">
            <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-2 w-[60px] text-center">#</th>
                <th className="px-4 py-2">ชื่อธนาคาร</th>
                <th className="px-4 py-2 w-[15%] text-center">สถานะ</th>
                <th className="px-4 py-2 text-right w-[20%]">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-center">{idx + 1}</td>
                  <td className="px-4 py-3"><span className="font-medium text-zinc-800 dark:text-zinc-100">{row.name}</span></td>
                  <td className="px-4 py-3 text-center">
                    {row.active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30">ใช้งาน</Badge>
                    ) : (
                      <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">ปิดใช้งาน</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-end min-w-[160px]">
                      <ActionButton
                        className="border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => onEdit(row)}
                      >
                        แก้ไข
                      </ActionButton>
                      {isSuperAdmin && (
                        <ActionButton
                          className={`text-white ${row.active ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`}
                          onClick={() => handleToggle(row)}
                        >
                          {row.active ? 'ปิดใช้งาน' : 'กู้คืน'}
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'} ธนาคาร “{confirm.row?.name}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={() => setConfirm(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={proceedToggle} disabled={!isSuperAdmin}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBankPage;
