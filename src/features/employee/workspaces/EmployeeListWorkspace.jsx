import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmployeeTable from '../components/EmployeeTable';
import { getAllEmployees, getBranchDropdowns } from '../api/employeeApi';
import useEmployeeStore from '../store/employeeStore';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const ListEmployeePage = () => {
  const { shopSlug } = useParams();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const branchId = useAuthStore((s) => s.branchId);
  const setEmployeeActiveAction = useEmployeeStore((state) => state.setEmployeeActiveAction);
  const lowerRole = String(role || '').toLowerCase();
  const canManage = ['admin', 'superadmin'].includes(lowerRole);
  const isSuperAdmin = lowerRole === 'superadmin';

  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [branchFilter, setBranchFilter] = useState('all');
  const [branchOptions, setBranchOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / Math.max(1, limit))), [total, limit]);

  const filtered = useMemo(() => {
    const q = String(filters.search || '').trim().toLowerCase();
    return (allEmployees || []).filter((e) => {
      const status = String(e.status || e.employeeStatus || '').toLowerCase();
      if (filters.status !== 'all' && status !== filters.status) return false;
      if (isSuperAdmin && branchFilter !== 'all') {
        const bid = String(e.branch?.id ?? e.branchId ?? '');
        if (bid !== String(branchFilter)) return false;
      }
      if (!q) return true;
      const hay = `${e.name ?? ''} ${e.user?.email ?? ''} ${e.phone ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allEmployees, filters, branchFilter, isSuperAdmin]);

  useEffect(() => { setTotal(filtered.length); }, [filtered.length]);

  const employeesPage = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const branchParam = isSuperAdmin ? undefined : branchId;
      const data = await getAllEmployees({ page: 1, limit: 10000, status: 'all', branchId: branchParam });
      const items = Array.isArray(data) ? data : (data?.items || []);
      setAllEmployees(items);
      setTotal(items.length);
    } catch (err) {
      console.error('❌ โหลดพนักงานล้มเหลว:', err);
      setError(err?.response?.data?.message || err?.message || 'โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [token, isSuperAdmin, branchId]);
  useEffect(() => { setPage(1); }, [filters, branchFilter]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      try {
        const rows = await getBranchDropdowns();
        setBranchOptions(Array.isArray(rows) ? rows : []);
      } catch {}
    })();
  }, [isSuperAdmin]);

  const handleToggleActive = async (id, nextActive) => setEmployeeActiveAction(id, nextActive);

  const controlClass = 'border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/40';

  return (
    <div className="w-full mt-4 animate-fadeIn">
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-50/70 via-white to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">EMP</div>
              <div className="min-w-0">
                <h1 className="text-base font-black text-slate-900 dark:text-zinc-100">รายชื่อพนักงาน</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">ค้นหา ตรวจสถานะ และจัดการบัญชีพนักงานภายในสาขา</p>
                {error && <span className="text-xs text-rose-600">{error}</span>}
              </div>
            </div>
            {isSuperAdmin && (
              <Link
                to={`/${shopSlug}/pos/settings/roles`}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 text-xs font-black transition"
                title="จัดการ Role (admin ↔ employee)"
              >
                จัดการ Role
              </Link>
            )}
          </div>
        </div>

        <div className="px-5 py-4 flex items-center gap-2 flex-wrap bg-slate-50/40 dark:bg-zinc-900">
          <input
            className={`${controlClass} w-full flex-1 min-w-[300px] max-w-2xl`}
            placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร..."
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
          />
          <select className={controlClass} value={filters.status} onChange={(e) => updateFilter({ status: e.target.value })}>
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="active">สถานะ: ใช้งาน</option>
            <option value="inactive">สถานะ: ปิดใช้งาน</option>
            <option value="pending">สถานะ: รออนุมัติ</option>
          </select>

          {isSuperAdmin ? (
            <select
              className={`${controlClass} min-w-[260px]`}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              title="กรองตามสาขา"
            >
              <option value="all">สาขา: ทั้งหมด</option>
              {branchOptions.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          ) : !canManage ? (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              คุณมีสิทธิ์ดูรายการเท่านั้น หากต้องการจัดการ โปรดติดต่อผู้ดูแลระบบ
            </div>
          ) : null}
        </div>

        <EmployeeTable
          data={employeesPage}
          loading={loading}
          error={error}
          page={page}
          limit={limit}
          readOnly={!canManage}
          onToggleActive={handleToggleActive}
          onRefresh={fetchEmployees}
          embedded
        />

        {pages > 1 && (
          <div className="flex gap-2 p-4 justify-center border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1.5 border rounded-lg transition ${p === page ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-black' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListEmployeePage;
