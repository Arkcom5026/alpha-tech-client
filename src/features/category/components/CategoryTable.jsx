// ✅ src/features/category/components/CategoryTable.jsx
import { useMemo, useState } from 'react';
import { useCategoryStore } from '../Store/CategoryStore';


// ✅ ตัวช่วยเช็คสิทธิ์ (รองรับ superadmin/supperadmin)
const roleIsAdminOrSuper = () => {
  const role = (localStorage.getItem('role') || '').toLowerCase();
  return role === 'admin' || role === 'supperadmin' || role === 'superadmin';
};

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>
);

const ActionButton = ({ children, className = '', ...rest }) => (
  <button
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const CategoryTable = ({ data = [], onEdit }) => {
  const isAdmin = roleIsAdminOrSuper();
  const { archiveAction, restoreAction } = useCategoryStore();

  const rows = useMemo(() => data || [], [data]);
  const [confirm, setConfirm] = useState(null); // { type: 'archive'|'restore', id }

  const handleArchive = (id) => setConfirm({ type: 'archive', id });
  const handleRestore = (id) => setConfirm({ type: 'restore', id });

  const proceed = async () => {
    if (!confirm) return;
    if (confirm.type === 'archive') await archiveAction(confirm.id);
    if (confirm.type === 'restore') await restoreAction(confirm.id);
    setConfirm(null);
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[900px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        {/* table header (sticky) */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">รายการ</div>
            <div className="text-xs text-zinc-500">ทั้งหมด {rows.length} รายการ</div>
          </div>
        </div>

        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2 w-[60%]">ชื่อหมวดหมู่</th>
              <th className="px-4 py-2 w-[15%]">สถานะ</th>
              <th className="px-4 py-2 text-right w-[25%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
              </tr>
            )}
            {rows.map((cat, idx) => {
              const isActive = !!cat.active;
              const isSystem = !!cat.isSystem;
              const canEdit = isAdmin && !isSystem && isActive;
              const canArchive = isAdmin && !isSystem && isActive;
              const canRestore = isAdmin && !isSystem && !isActive;

              return (
                <tr
                  key={cat.id}
                  className={`border-b border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 ${idx % 2 === 1 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-900/40'}`}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-800 dark:text-zinc-100">{cat.name}</span>
                      {isSystem && (
                        <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-400/30">หมวดระบบ</Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    {isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30">ใช้งาน</Badge>
                    ) : (
                      <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">ปิดใช้งาน</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-flex items-center gap-2">
                      <ActionButton
                        className="border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed"
                        disabled={!canEdit}
                        onClick={() => onEdit?.(cat)}
                        title={!isAdmin ? 'สำหรับผู้ดูแลระบบเท่านั้น' : isSystem ? 'หมวดระบบถูกล็อก' : !isActive ? 'ต้องเป็นสถานะใช้งาน' : 'แก้ไข'}
                      >
                        แก้ไข
                      </ActionButton>

                      {isActive ? (
                        <ActionButton
                          className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-400"
                          disabled={!canArchive}
                          onClick={() => handleArchive(cat.id)}
                          title={isSystem ? 'หมวดระบบถูกล็อก' : ''}
                        >
                          ปิดใช้งาน
                        </ActionButton>
                      ) : (
                        <ActionButton
                          className="bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"
                          disabled={!canRestore}
                          onClick={() => handleRestore(cat.id)}
                          title={isSystem ? 'หมวดระบบถูกล็อก' : ''}
                        >
                          กู้คืน
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Confirm bar (ไม่ใช้ alert) */}
        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.type === 'archive' ? 'ปิดใช้งาน' : 'กู้คืน'} หมวดหมู่หรือไม่?
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

export default CategoryTable;



