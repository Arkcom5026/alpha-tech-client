import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Home,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Terminal,
  UserCircle,
  Wrench,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const getCompactBranchName = (branchName = '', shopSlug = '') => {
  const value = String(branchName || '').trim();

  if (value.includes('แอดวานซ์ เทค')) return 'แอดวานซ์ เทค';

  const compact = value
    .replace(/^บริษัท\s*/u, '')
    .replace(/\s*จำกัด.*$/u, '')
    .replace(/\s*\([^)]*\)\s*$/u, '')
    .trim();

  if (compact) return compact;
  if (shopSlug) return shopSlug;
  return 'ร้านค้า';
};

const HeaderPos = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { shopSlug } = useParams();

  const employee = useAuthStore((state) => state.employee);
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logoutAction);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticatedSelector?.());
  const role = useAuthStore((state) => state.role);

  const fallbackBranchName = useBranchStore((state) => state.currentBranch?.name);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const clearBranch = useBranchStore((state) => state.clearBranch);
  const loadAndSetBranchById = useBranchStore((state) => state.loadAndSetBranchById);

  const normalizedRole = String(role || '').toLowerCase();
  const isSuperAdmin = normalizedRole === 'superadmin';
  const isSuperAdminRoute = pathname.includes('/superadmin');
  const isGlobalSuperAdmin = isSuperAdmin || isSuperAdminRoute;

  const displayBranchName =
    employee?.branchName ||
    fallbackBranchName ||
    (shopSlug ? `ร้านค้าพันธมิตร (${shopSlug})` : 'ไม่ระบุสาขา');
  const compactBranchName = getCompactBranchName(displayBranchName, shopSlug);
  const displayName = employee?.name || user?.username || user?.email || 'ผู้ใช้';

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    clearBranch();
    logoutAction();
    navigate('/');
  };

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (isSuperAdmin) return;

    if (isAuthenticated && normalizedRole === 'employee' && employee?.branchId && selectedBranchId) {
      loadAndSetBranchById(selectedBranchId);
    }
  }, [isSuperAdmin, isAuthenticated, normalizedRole, employee?.branchId, selectedBranchId, loadAndSetBranchById]);

  useEffect(() => {
    if (!isSuperAdmin || isSuperAdminRoute || !shopSlug) return;

    const isPosRuntimeRoute = pathname.includes(`/${shopSlug}/pos`) || pathname.includes('/pos');
    if (isPosRuntimeRoute) navigate(`/${shopSlug}/superadmin`, { replace: true });
  }, [isSuperAdmin, isSuperAdminRoute, navigate, pathname, shopSlug]);

  const getPosRoutePath = (subPath = '') => (shopSlug ? `/${shopSlug}/pos${subPath}` : `/pos${subPath}`);
  const getSuperAdminRoutePath = (subPath = '') =>
    shopSlug ? `/${shopSlug}/superadmin${subPath}` : `/superadmin${subPath}`;
  const getRoutePath = isGlobalSuperAdmin ? getSuperAdminRoutePath : getPosRoutePath;

  const posNavItems = [
    { label: 'หน้าหลัก', path: getPosRoutePath(''), end: true, icon: Home },
    { label: 'จัดซื้อ', path: getPosRoutePath('/purchases'), icon: ShoppingCart },
    { label: 'การขาย', path: getPosRoutePath('/sales'), icon: ClipboardList },
    { label: 'บริการ', path: getPosRoutePath('/services'), icon: Wrench },
    { label: 'สต๊อก', path: getPosRoutePath('/stock'), icon: Package },
    { label: 'รายงาน', path: getPosRoutePath('/reports'), icon: BarChart3 },
    { label: 'การเงิน', path: getPosRoutePath('/finance'), icon: CircleDollarSign },
    { label: 'ตั้งค่าระบบ', path: getPosRoutePath('/settings'), icon: Settings },
  ];

  const superAdminNavItems = [
    { label: 'Dashboard', path: getSuperAdminRoutePath(''), end: true, icon: Home },
    { label: 'Catalog', path: getSuperAdminRoutePath('/catalog'), icon: Store },
    { label: 'Governance', path: getSuperAdminRoutePath('/governance'), icon: ShieldCheck },
    { label: 'Analytics', path: getSuperAdminRoutePath('/analytics'), icon: BarChart3 },
    { label: 'Settings', path: getSuperAdminRoutePath('/settings'), icon: Settings },
  ];

  const navItems = isGlobalSuperAdmin ? superAdminNavItems : posNavItems;
  const logoutLabel = isGlobalSuperAdmin ? 'ออกจากระบบ Superadmin' : 'ออกจากระบบ';

  const navLinkClass = ({ isActive }) =>
    [
      'inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
      isActive
        ? '!border-emerald-400 !bg-emerald-200 !text-emerald-950 hover:!bg-emerald-300'
        : '!border-teal-200 !bg-teal-50 !text-teal-900 hover:!border-teal-300 hover:!bg-teal-100 hover:!text-teal-950',
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-teal-200 bg-teal-50/95 text-slate-900 shadow-[0_1px_3px_rgba(13,148,136,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-3 px-3 pl-16 sm:px-5 sm:pl-16 lg:px-5">
        <nav className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto py-2 scrollbar-none md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} end={item.end} className={navLinkClass}>
                <Icon className="h-4 w-4 shrink-0 text-current" />
                <span className="text-current">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-semibold text-slate-950">{compactBranchName}</p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!isGlobalSuperAdmin && (
            <div className="hidden max-w-[180px] items-center rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 sm:flex">
              <span className="truncate">{compactBranchName}</span>
            </div>
          )}

          {isGlobalSuperAdmin && (
            <div className="hidden items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-800 lg:flex">
              <Terminal className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Superadmin</span>
            </div>
          )}

          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="ads-icon-button"
                aria-expanded={showMenu}
                aria-label="เปิดเมนูผู้ใช้งาน"
              >
                <UserCircle className="h-6 w-6" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {isGlobalSuperAdmin ? 'Catalog Governance' : displayBranchName}
                    </p>
                  </div>

                  <div className="my-1 h-px bg-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      navigate(getRoutePath('/settings'));
                    }}
                    className="ads-button-ghost w-full justify-start"
                  >
                    <Settings className="h-4 w-4 text-teal-600" />
                    {isGlobalSuperAdmin ? 'Settings' : 'ตั้งค่าระบบ'}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ads-button-danger mt-1 w-full justify-start"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutLabel}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderPos;
