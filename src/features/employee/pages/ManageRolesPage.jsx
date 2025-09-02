

// --- filepath: src/features/employee/pages/ManageRolesPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore.js';
import { getAllEmployees, updateUserRole, getBranchDropdowns } from '@/features/employee/api/employeeApi';

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

export default function ManageRolesPage() {
  const role = useAuthStore((s) => s.role);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all | admin | employee | superadmin | customer
  const [branchFilter, setBranchFilter] = useState('all'); // all | <branchId>
  const [branches, setBranches] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [pending, setPending] = useState(null); // { user, nextRole }

  const pages = useMemo(() => Math.max(1, Math.ceil(total / Math.max(1, limit))), [total, limit]);

  // 🔎 Client-side filtering & pagination
  const filtered = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    return (allItems || []).filter((e) => {
      if (filterRole !== 'all' && String(e.role || '').toLowerCase() !== filterRole) return false;
      if (branchFilter !== 'all' && String(e.branch?.id ?? e.branchId ?? '') !== String(branchFilter)) return false;
      if (!q) return true;
      const hay = `${e.name ?? ''} ${e.email ?? ''} ${e.phone ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allItems, search, filterRole, branchFilter]);

  useEffect(() => {
    setTotal(filtered.length);
    setPage(1); // รีเซ็ตหน้าเมื่อมีการเปลี่ยนเงื่อนไขกรอง
  }, [filtered.length]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllEmployees({ page: 1, limit: 10000, status: 'all' });
      const items = Array.isArray(data) ? data : (data?.items || []);

      const normalized = items.map((e) => ({
        id: e.id ?? e.userId,
        name: e.name ?? e.user?.name ?? '',
        email: e.email ?? e.user?.email ?? '',
        role: (e.role ?? e.user?.role ?? '')?.toLowerCase?.() || '',
        status: (e.status ?? e.employeeStatus ?? '')?.toLowerCase?.() || '',
        ...e,
      }));

      setAllItems(normalized);
      setTotal(normalized.length);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);
  // โหลดรายการสาขา (เฉพาะ superadmin)
  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      try {
        const rows = await getBranchDropdowns();
        setBranches(Array.isArray(rows) ? rows : []);
      } catch {
        // เงียบไว้ ไม่ต้องบังคับให้ล้ม
      }
    })();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="w-full mt-4">
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      </div>
    );
  }

  const handleChangeRole = (u) => {
    const current = String(u?.role || '').toLowerCase();
    const allowed = ['admin', 'employee'];
    if (!allowed.includes(current)) return; // ไม่ปรับ superadmin/customer ที่นี่

    const status = String(u?.status || u?.employeeStatus || '').toLowerCase();
    if (status === 'pending') {
      setError('ไม่สามารถเปลี่ยนสิทธิ์ได้: ผู้ใช้งานยังไม่ได้รับอนุมัติพนักงาน');
      return;
    }

    const next = current === 'admin' ? 'employee' : 'admin';
    setPending({ user: u, nextRole: next });
  };

  const confirmChangeRole = async () => {
    if (!pending?.user) return setPending(null);
    try {
      await updateUserRole(Number(pending.user.id || pending.user.userId), pending.nextRole);
      setAllItems((s) => s.map((x) => (x.id === (pending.user.id ?? pending.user.userId) ? { ...x, role: pending.nextRole } : x)));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'เปลี่ยนสิทธิ์ไม่สำเร็จ');
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">จัดการ Role</h1>
              {error && <span className="text-xs text-rose-600">{error}</span>}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          <input
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full flex-1 min-w-[300px] max-w-2xl bg-white dark:bg-zinc-900"
            placeholder="ค้นหาชื่อ / อีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Role: ทั้งหมด</option>
            <option value="admin">admin</option>
            <option value="employee">employee</option>
            <option value="superadmin">superadmin</option>
            <option value="customer">customer</option>
          </select>

          {isSuperAdmin && (
            <select
              className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 min-w-[260px]"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              title="กรองตามสาขา"
            >
              <option value="all">สาขา: ทั้งหมด</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Table */}
        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2 w-[60px] text-center">#</th>
              <th className="px-4 py-2">ชื่อ</th>
              <th className="px-4 py-2">อีเมล</th>
              <th className="px-4 py-2 w-[18%] min-w-[220px]">สาขา</th>
              <th className="px-4 py-2 w-[10%] text-center">Role</th>
              <th className="px-4 py-2 w-[10%] text-center">สถานะ</th>
              <th className="px-4 py-2 text-right w-[20%]">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">กำลังโหลด...</td>
              </tr>
            )}

            {!loading && pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
              </tr>
            )}

            {!loading && pageRows.map((u, idx) => {
              const roleLower = String(u.role || '').toLowerCase();
              const statusLower = String(u.status || u.employeeStatus || '').toLowerCase();
              const canToggle = ['admin', 'employee'].includes(roleLower) && statusLower !== 'pending';
              return (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 text-center">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3">{u.name || '-'}</td>
                  <td className="px-4 py-3">{u.email || '-'}</td>
                  <td className="px-4 py-3 min-w-[220px]">{u.branch?.name || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={roleLower === 'admin' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : roleLower === 'employee' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-zinc-200 text-zinc-800 ring-zinc-400/40'}>
                      {u.role || '-'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={statusLower === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : statusLower === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-zinc-200 text-zinc-800 ring-zinc-400/40'}>
                      {u.status || u.employeeStatus || '-'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionButton
                      className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
                      disabled={!canToggle}
                      onClick={() => handleChangeRole(u)}
                      title={canToggle ? 'สลับสิทธิ์ admin ↔ employee' : 'อนุมัติพนักงานก่อน หรือ role ไม่อนุญาต'}
                    >
                      เปลี่ยน Role
                    </ActionButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex gap-2 p-4 justify-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1.5 border rounded ${p === page ? 'bg-gray-200 dark:bg-zinc-700' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Inline confirm */}
        {pending && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการเปลี่ยนสิทธิ์ของ “{pending.user?.name || pending.user?.email}” เป็น "{pending.nextRole}" ?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={() => setPending(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={confirmChangeRole}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





