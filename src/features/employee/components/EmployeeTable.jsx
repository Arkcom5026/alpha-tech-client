
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore.js';

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

/*
  Props:
    - data, loading, error, page, limit, readOnly, onToggleActive, onRefresh
    - embedded?: boolean (default false) → ถ้า true จะไม่วาดกรอบการ์ด/หัวตารางภายนอก
*/
const EmployeeTable = ({
  data = [],
  loading = false,
  error = null,
  page = 1,
  limit = 20,
  readOnly = true,
  onToggleActive,
  onRefresh,
  embedded = false,
}) => {
  // 🔐 ใช้ role จาก auth store เพื่อแสดงคอลัมน์สาขาเฉพาะ superadmin
  const role = useAuthStore((s) => s.role);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const rows = Array.isArray(data) ? data : [];
  const colCount = 8 + (isSuperAdmin ? 1 : 0);

  const [confirm, setConfirm] = useState(null); // { row, nextActive }
  const [toggling, setToggling] = useState(null);

  const resolveEmpActive = (row) => {
    const s = String(row?.status || row?.employeeStatus || '').toLowerCase();
    if (s === 'pending') return null;
    if (s === 'active') return true;
    if (s === 'inactive') return false;
    return true;
  };

  const handleToggle = (row) => {
    const cur = resolveEmpActive(row);
    if (cur === null) return;
    setConfirm({ row, nextActive: !cur });
  };

  const proceed = async () => {
    if (!confirm?.row || !onToggleActive) return setConfirm(null);
    const id = confirm.row.id ?? confirm.row.userId;
    try {
      setToggling(id);
      await onToggleActive(id, confirm.nextActive);
      onRefresh && onRefresh();
    } catch (err) {
      console.error('❌ เปลี่ยนสถานะพนักงานล้มเหลว:', err);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะพนักงาน');
    } finally {
      setToggling(null);
      setConfirm(null);
    }
  };

  if (error) {
    return <div className={`p-4 text-sm text-red-600 ${embedded ? '' : 'w-full'}`}>{String(error)}</div>;
  }

  const TableBlock = (
    <table className="min-w-full text-sm">
      <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
        <tr className="border-b border-zinc-200 dark:border-zinc-800">
          <th className="px-4 py-2 w-[60px] text-center">#</th>
          <th className="px-4 py-2">ชื่อ</th>
          <th className="px-4 py-2">เบอร์โทร</th>
          <th className="px-4 py-2">อีเมล</th>
          <th className="px-4 py-2 w-[16%] min-w-[160px]">ตำแหน่ง</th>
          {isSuperAdmin && (<th className="px-4 py-2 w-[14%] min-w-[200px]">สาขา</th>) }
          <th className="px-4 py-2 w-[10%] text-center">สถานะ</th>
          <th className="px-4 py-2 w-[10%] text-center">Role</th>
          <th className="px-4 py-2 text-right w-[20%]">การจัดการ</th>
        </tr>
      </thead>
      <tbody>
        {!loading && rows.length === 0 && (
          <tr>
            <td colSpan={colCount} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
          </tr>
        )}

        {rows.map((e, idx) => {
          const role = String(e.role || e.user?.role || '').toLowerCase();
          const status = String(e.status || e.employeeStatus || '').toLowerCase();
          const id = e.id ?? e.userId;
          const cur = resolveEmpActive(e);
          const isPending = cur === null;
          const isActive = cur === true;
          const canToggle = !!onToggleActive && !readOnly && !isPending;

          return (
            <tr key={id} className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 ${idx % 2 === 1 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-900/40'}`}>
              <td className="px-4 py-3 text-center">{(page - 1) * limit + idx + 1}</td>
              <td className="px-4 py-3"><span className="font-medium text-zinc-800 dark:text-zinc-100">{e.name || '-'}</span></td>
              <td className="px-4 py-3">{e.phone || '-'}</td>
              <td className="px-4 py-3">{e.user?.email || '-'}</td>
              <td className="px-4 py-3 min-w-[200px]">{e.position?.name || '-'}</td>
              {isSuperAdmin && (<td className="px-4 py-3 w-[14%] min-w-[160px]">{e.branch?.name || '-'}</td>)}
              <td className="px-4 py-3 text-center">
                {status === 'active' ? (
                  <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30">active</Badge>
                ) : status === 'pending' ? (
                  <Badge className="bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-400/30">pending</Badge>
                ) : (
                  <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">{status || '-'}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {role === 'admin' ? (
                  <Badge className="bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-200 dark:ring-purple-400/30">admin</Badge>
                ) : role === 'employee' ? (
                  <Badge className="bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-400/30">employee</Badge>
                ) : role ? (
                  <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">{role}</Badge>
                ) : (
                  <span className="text-zinc-500">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2 justify-end min-w-[260px]">
                  {!readOnly && (
                    <Link
                      to={`/pos/settings/employee/edit/${id}`}
                      className="px-3 py-1.5 rounded-md text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="แก้ไขข้อมูลพนักงาน"
                    >
                      แก้ไข
                    </Link>
                  )}
                  <ActionButton
                    className={`text-white ${isActive ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`}
                    onClick={() => handleToggle(e)}
                    disabled={!canToggle || toggling === id}
                  >
                    {isActive ? 'ปิดใช้งาน' : 'กู้คืน'}
                  </ActionButton>
                </div>
              </td>
            </tr>
          );
        })}

        {loading && (
          <tr>
            <td colSpan={colCount} className="px-4 py-8 text-center text-zinc-500">กำลังโหลดข้อมูล...</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  if (embedded) {
    // ฝังในกรอบจากหน้า ListEmployeePage (รูปแบบเดียวกับ ManageRolesPage)
    return (
      <div className="w-full">
        <div>{TableBlock}</div>
        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'} พนักงาน “{confirm.row?.name || confirm.row?.user?.email}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={() => setConfirm(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={proceed}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  // โหมดมีกรอบการ์ดในตัว (ยังคงไว้เพื่อความยืดหยุ่น)
  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">รายการ</div>
            <div className="text-xs text-zinc-500">ทั้งหมด {rows.length} รายการ</div>
          </div>
        </div>

        {TableBlock}

        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'} พนักงาน “{confirm.row?.name || confirm.row?.user?.email}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={() => setConfirm(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={proceed}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTable;




