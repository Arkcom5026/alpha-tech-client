import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmployeeTable from '../components/EmployeeTable';
import { getAllEmployees, getBranchDropdowns } from '../api/employeeApi';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const ListEmployeePage = () => {
  // 🔐 Auth
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const branchId = useAuthStore((s) => s.branchId);
  const lowerRole = String(role || '').toLowerCase();
  const canManage = ['admin', 'superadmin'].includes(lowerRole);
  const isSuperAdmin = lowerRole === 'superadmin';

  // 📄 Data & UI state
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔎 Filters & Pagination
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [branchFilter, setBranchFilter] = useState('all'); // เฉพาะ superadmin
  const [branchOptions, setBranchOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / Math.max(1, limit))), [total, limit]);

  // 🧮 Client-side filtering & pagination
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

  useEffect(() => {
    setTotal(filtered.length);
  }, [filtered.length]);

  const employeesPage = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  // ⏱️ Debounce search
    const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  // 📥 Load list
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const branchParam = isSuperAdmin ? undefined : branchId; // superadmin ดึงทุกสาขาครั้งเดียว
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

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isSuperAdmin, branchId]);

  useEffect(() => { setPage(1); }, [filters, branchFilter]);

  // โหลดสาขาสำหรับ superadmin
  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      try {
        const rows = await getBranchDropdowns();
        setBranchOptions(Array.isArray(rows) ? rows : []);
      } catch {/* no-op */}
    })();
  }, [isSuperAdmin]);

  // Handler ส่งต่อให้ตาราง (จะผูก API จริงที่ store/api ภายหลัง)
  const handleToggleActive = async (id, nextActive) => {
    // ปัจจุบันยังไม่ได้เชื่อม API จริง แค่ return สำเร็จไปก่อน
    return Promise.resolve({ id, nextActive });
  };

  return (
    <div className="w-full mt-4">
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        {/* Header (match ManageRolesPage) */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">รายชื่อพนักงาน</h1>
              {error && <span className="text-xs text-rose-600">{error}</span>}
            </div>
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Link
                  to="/pos/settings/roles"
                  className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title="จัดการ Role (admin ↔ employee)"
                >
                  จัดการ Role
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar (match ManageRolesPage) */}
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          <input
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full flex-1 min-w-[300px] max-w-2xl bg-white dark:bg-zinc-900"
            placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร..."
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
          />
          <select
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900"
            value={filters.status}
            onChange={(e) => updateFilter({ status: e.target.value })}
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="active">สถานะ: ใช้งาน</option>
            <option value="inactive">สถานะ: ปิดใช้งาน</option>
            <option value="pending">สถานะ: รออนุมัติ</option>
          </select>

          {isSuperAdmin ? (
            <select
              className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 min-w-[260px]"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              title="กรองตามสาขา"
            >
              <option value="all">สาขา: ทั้งหมด</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : !canManage ? (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              คุณมีสิทธิ์ดูรายการเท่านั้น หากต้องการจัดการ โปรดติดต่อผู้ดูแลระบบ
            </div>
          ) : null}
        </div>

        {/* Table (embedded) */}
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

        {/* Pagination (match ManageRolesPage) */}
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
      </div>
    </div>
  );
};

export default ListEmployeePage;


