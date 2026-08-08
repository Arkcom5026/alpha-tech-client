import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore.js';
import {
  getAllEmployees,
  getBranchDropdowns,
  setEmployeeActive,
  updateUserRole,
} from '@/features/employee/api/employeeApi';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
    {children}
  </span>
);

const ActionButton = ({ children, className = '', type = 'button', ...rest }) => (
  <button
    type={type}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const statusText = {
  pending: 'รออนุมัติ',
  active: 'ใช้งานอยู่',
  inactive: 'ระงับแล้ว',
};

export default function ManageRolesPage() {
  const role = useAuthStore((state) => state.role);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const [allItems, setAllItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null);
  const [changingEmployeeId, setChangingEmployeeId] = useState(null);

  const limit = 20;

  const filtered = useMemo(() => {
    const query = String(search || '').trim().toLowerCase();
    return allItems.filter((employee) => {
      if (filterRole !== 'all' && employee.role !== filterRole) return false;
      if (branchFilter !== 'all' && String(employee.branch?.id ?? employee.branchId ?? '') !== String(branchFilter)) return false;
      if (!query) return true;
      return `${employee.name} ${employee.email} ${employee.phone || ''}`.toLowerCase().includes(query);
    });
  }, [allItems, branchFilter, filterRole, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageRows = filtered.slice((page - 1) * limit, page * limit);

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllEmployees({ page: 1, limit: 100, status: 'all' });
      const items = Array.isArray(data) ? data : data?.items || [];
      setAllItems(items.map((employee) => ({
        ...employee,
        id: Number(employee.id),
        userId: Number(employee.userId),
        name: employee.name ?? '',
        email: employee.email ?? employee.user?.email ?? '',
        role: String(employee.role ?? employee.user?.role ?? '').toLowerCase(),
        status: String(employee.status ?? '').toLowerCase(),
      })));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchList();
    getBranchDropdowns()
      .then((rows) => setBranches(Array.isArray(rows) ? rows : []))
      .catch(() => setBranches([]));
  }, [isSuperAdmin]);

  useEffect(() => {
    setPage(1);
  }, [branchFilter, filterRole, search]);

  const requestRoleChange = (employee) => {
    if (employee.status !== 'active') {
      setError('เปลี่ยน Role ได้เฉพาะพนักงานที่ได้รับอนุมัติและกำลังใช้งานอยู่');
      return;
    }
    if (!['admin', 'employee'].includes(employee.role)) return;
    setPending({ employee, nextRole: employee.role === 'admin' ? 'employee' : 'admin' });
  };

  const confirmRoleChange = async () => {
    if (!pending?.employee) return;
    try {
      setError('');
      await updateUserRole(pending.employee.userId, pending.nextRole);
      setAllItems((items) => items.map((employee) =>
        employee.id === pending.employee.id ? { ...employee, role: pending.nextRole } : employee
      ));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'เปลี่ยนสิทธิ์ไม่สำเร็จ');
    } finally {
      setPending(null);
    }
  };

  const changeLifecycle = async (employee) => {
    if (employee.status === 'pending') return;
    const nextActive = employee.status !== 'active';
    const confirmed = window.confirm(
      nextActive
        ? `ยืนยันเปิดใช้งาน ${employee.name || employee.email} อีกครั้งหรือไม่?`
        : `ยืนยันระงับการใช้งาน ${employee.name || employee.email} หรือไม่?\nประวัติการทำงานทั้งหมดจะยังคงอยู่`
    );
    if (!confirmed) return;

    try {
      setChangingEmployeeId(employee.id);
      setError('');
      await setEmployeeActive(employee.id, nextActive);
      setAllItems((items) => items.map((item) =>
        item.id === employee.id
          ? { ...item, status: nextActive ? 'active' : 'inactive', active: nextActive }
          : item
      ));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'เปลี่ยนสถานะพนักงานไม่สำเร็จ');
    } finally {
      setChangingEmployeeId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="w-full mt-4">
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60">
          <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">จัดการ Role และสถานะพนักงาน</h1>
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>

        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          <input
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full flex-1 min-w-[280px] max-w-2xl bg-white dark:bg-zinc-900"
            placeholder="ค้นหาชื่อ / อีเมล..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="border rounded-md px-3 py-2 bg-white dark:bg-zinc-900" value={filterRole} onChange={(event) => setFilterRole(event.target.value)}>
            <option value="all">Role: ทั้งหมด</option>
            <option value="admin">admin</option>
            <option value="employee">employee</option>
          </select>
          <select className="border rounded-md px-3 py-2 bg-white dark:bg-zinc-900 min-w-[220px]" value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
            <option value="all">สาขา: ทั้งหมด</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2">ชื่อ</th>
                <th className="px-4 py-2">อีเมล</th>
                <th className="px-4 py-2">สาขา</th>
                <th className="px-4 py-2 text-center">Role</th>
                <th className="px-4 py-2 text-center">สถานะ</th>
                <th className="px-4 py-2 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-zinc-500">กำลังโหลด...</td></tr>}
              {!loading && pageRows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td></tr>}
              {!loading && pageRows.map((employee, index) => {
                const roleChangeAllowed = employee.status === 'active' && ['admin', 'employee'].includes(employee.role);
                const lifecycleAllowed = employee.status !== 'pending';
                const isActive = employee.status === 'active';
                return (
                  <tr key={employee.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3 text-center">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-3">{employee.name || '-'}</td>
                    <td className="px-4 py-3">{employee.email || '-'}</td>
                    <td className="px-4 py-3">{employee.branch?.name || '-'}</td>
                    <td className="px-4 py-3 text-center"><Badge className="bg-blue-50 text-blue-700 ring-blue-600/20">{employee.role || '-'}</Badge></td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : employee.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-zinc-200 text-zinc-800 ring-zinc-400/40'}>
                        {statusText[employee.status] || employee.status || '-'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <ActionButton className="bg-indigo-600 text-white" disabled={!roleChangeAllowed} onClick={() => requestRoleChange(employee)}>
                          เปลี่ยน Role
                        </ActionButton>
                        <ActionButton
                          className={isActive ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}
                          disabled={!lifecycleAllowed || changingEmployeeId === employee.id}
                          onClick={() => changeLifecycle(employee)}
                        >
                          {changingEmployeeId === employee.id ? 'กำลังบันทึก...' : isActive ? 'ระงับ' : 'เปิดใช้งาน'}
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex gap-2 p-4 justify-center border-t">
            {Array.from({ length: pages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} className={`px-3 py-1.5 border rounded ${pageNumber === page ? 'bg-gray-200 dark:bg-zinc-700' : ''}`} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </button>
            ))}
          </div>
        )}

        {pending && (
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันเปลี่ยน Role ของ “{pending.employee.name || pending.employee.email}” เป็น “{pending.nextRole}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900" onClick={() => setPending(null)}>ยกเลิก</ActionButton>
              <ActionButton className="bg-blue-600 text-white" onClick={confirmRoleChange}>ยืนยัน</ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
