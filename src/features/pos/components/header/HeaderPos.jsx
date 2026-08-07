import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  Check,
  CircleDollarSign,
  ClipboardList,
  Home,
  LogOut,
  Package,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Terminal,
  UserCircle,
  Wrench,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import OperationalStatusBadge from '@/features/system/operational-status/components/OperationalStatusBadge';

const DEFAULT_MOBILE_NAV_IDS = ['purchases', 'sales', 'services', 'stock', 'finance'];
const MOBILE_NAV_PREFERENCE_PREFIX = 'alpha-tech.pos.mobile-nav.visible.v1';

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

const normalizePath = (value = '') => {
  const normalized = String(value || '/').replace(/\/+$/u, '');
  return normalized || '/';
};

const readVisibleMobileNavIds = (storageKey) => {
  if (typeof window === 'undefined') return DEFAULT_MOBILE_NAV_IDS;

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_MOBILE_NAV_IDS;
    return stored.filter((value) => typeof value === 'string');
  } catch {
    return DEFAULT_MOBILE_NAV_IDS;
  }
};

const HeaderPos = ({ onMobileModuleSelect }) => {
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
  const canViewOperationalStatus = normalizedRole === 'admin' || normalizedRole === 'superadmin';

  const displayBranchName =
    employee?.branchName ||
    fallbackBranchName ||
    (shopSlug ? `ร้านค้าพันธมิตร (${shopSlug})` : 'ไม่ระบุสาขา');
  const compactBranchName = getCompactBranchName(displayBranchName, shopSlug);
  const displayName = employee?.name || user?.username || user?.email || 'ผู้ใช้';
  const mobilePreferenceOwner = employee?.id || user?.id || user?.email || 'anonymous';
  const mobilePreferenceKey = `${MOBILE_NAV_PREFERENCE_PREFIX}:${mobilePreferenceOwner}`;

  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNavSettings, setShowMobileNavSettings] = useState(false);
  const [visibleMobileNavIds, setVisibleMobileNavIds] = useState(() =>
    readVisibleMobileNavIds(`${MOBILE_NAV_PREFERENCE_PREFIX}:anonymous`),
  );

  const handleLogout = () => {
    clearBranch();
    logoutAction();
    navigate('/');
  };

  useEffect(() => {
    setShowMenu(false);
    setShowMobileNavSettings(false);
  }, [pathname]);

  useEffect(() => {
    setVisibleMobileNavIds(readVisibleMobileNavIds(mobilePreferenceKey));
  }, [mobilePreferenceKey]);

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

  const posNavItems = useMemo(
    () => [
      { id: 'home', label: 'หน้าหลัก', path: getPosRoutePath(''), end: true, icon: Home },
      { id: 'purchases', label: 'จัดซื้อ', path: getPosRoutePath('/purchases'), icon: ShoppingCart },
      { id: 'sales', label: 'การขาย', path: getPosRoutePath('/sales'), icon: ClipboardList },
      { id: 'services', label: 'บริการ', path: getPosRoutePath('/services'), icon: Wrench },
      { id: 'stock', label: 'สต๊อก', path: getPosRoutePath('/stock'), icon: Package },
      { id: 'reports', label: 'รายงาน', path: getPosRoutePath('/reports'), icon: BarChart3 },
      { id: 'finance', label: 'การเงิน', path: getPosRoutePath('/finance'), icon: CircleDollarSign },
      { id: 'settings', label: 'ตั้งค่าระบบ', path: getPosRoutePath('/settings'), icon: Settings },
    ],
    [shopSlug],
  );

  const superAdminNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: getSuperAdminRoutePath(''), end: true, icon: Home },
    { id: 'catalog', label: 'Catalog', path: getSuperAdminRoutePath('/catalog'), icon: Store },
    { id: 'governance', label: 'Governance', path: getSuperAdminRoutePath('/governance'), icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', path: getSuperAdminRoutePath('/analytics'), icon: BarChart3 },
    { id: 'settings', label: 'Settings', path: getSuperAdminRoutePath('/settings'), icon: Settings },
  ];

  const navItems = isGlobalSuperAdmin ? superAdminNavItems : posNavItems;
  const mobileNavItems = isGlobalSuperAdmin
    ? superAdminNavItems
    : posNavItems.filter((item) => visibleMobileNavIds.includes(item.id));
  const logoutLabel = isGlobalSuperAdmin ? 'ออกจากระบบ Superadmin' : 'ออกจากระบบ';
  const currentPath = normalizePath(pathname);

  const isNavItemActive = (item) => {
    const itemPath = normalizePath(item.path);
    if (item.end) return currentPath === itemPath;
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  const saveVisibleMobileNavIds = (nextIds) => {
    const safeIds = nextIds.length > 0 ? nextIds : DEFAULT_MOBILE_NAV_IDS;
    setVisibleMobileNavIds(safeIds);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(mobilePreferenceKey, JSON.stringify(safeIds));
    }
  };

  const toggleMobileNavItem = (itemId) => {
    const nextIds = visibleMobileNavIds.includes(itemId)
      ? visibleMobileNavIds.filter((id) => id !== itemId)
      : [...visibleMobileNavIds, itemId];

    saveVisibleMobileNavIds(nextIds);
  };

  const resetMobileNavItems = () => {
    saveVisibleMobileNavIds(DEFAULT_MOBILE_NAV_IDS);
  };

  const handleNavItemSelect = (item, mobile = false) => {
    setShowMobileNavSettings(false);
    navigate(item.path);
    if (mobile && !isGlobalSuperAdmin) onMobileModuleSelect?.(item);
  };

  const renderNavButton = (item, mobile = false) => {
    const Icon = item.icon;
    const isActive = isNavItemActive(item);

    return (
      <button
        key={`${mobile ? 'mobile' : 'desktop'}-${item.path}`}
        type="button"
        onClick={() => handleNavItemSelect(item, mobile)}
        aria-current={isActive ? 'page' : undefined}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        style={
          isActive
            ? {
                backgroundColor: '#d1fae5',
                borderColor: '#6ee7b7',
                color: '#065f46',
              }
            : {
                backgroundColor: '#f0fdfa',
                borderColor: '#99f6e4',
                color: '#134e4a',
              }
        }
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: 'currentColor' }} />
        <span style={{ color: 'currentColor' }}>{item.label}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50 text-slate-900">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-3 px-3 sm:px-5 lg:px-5">
        <nav className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto py-2 scrollbar-none md:flex">
          {navItems.map((item) => renderNavButton(item))}
        </nav>

        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-semibold text-slate-950">{compactBranchName}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">แตะเมนูหลักเพื่อเปิดเมนูย่อย</p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!isGlobalSuperAdmin && (
            <div className="hidden max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 sm:flex">
              <span className="truncate">{compactBranchName}</span>
            </div>
          )}

          {isGlobalSuperAdmin && (
            <div className="hidden items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-800 lg:flex">
              <Terminal className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Superadmin</span>
            </div>
          )}

          <OperationalStatusBadge enabled={canViewOperationalStatus} />

          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
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
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  >
                    <Settings className="h-4 w-4 text-teal-600" />
                    {isGlobalSuperAdmin ? 'Settings' : 'ตั้งค่าระบบ'}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl bg-red-700 px-3 text-left text-sm font-semibold text-white transition-colors hover:bg-red-800"
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

      <div className="relative md:hidden">
        <nav
          className="flex items-center gap-2 overflow-x-auto border-t border-slate-200 bg-white px-3 py-2 pr-16 scrollbar-none"
          aria-label="เมนูหลัก POS"
        >
          {mobileNavItems.map((item) => renderNavButton(item, true))}
        </nav>

        {!isGlobalSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowMobileNavSettings((value) => !value)}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-white text-teal-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-expanded={showMobileNavSettings}
            aria-label="จัดการเมนูหลัก"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        )}

        {showMobileNavSettings && !isGlobalSuperAdmin && (
          <section className="absolute inset-x-3 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">เลือกเมนูที่ต้องการแสดง</h2>
                <p className="mt-1 text-xs text-slate-500">ค่าที่เลือกจะถูกบันทึกสำหรับผู้ใช้งานคนนี้</p>
              </div>
              <button
                type="button"
                onClick={resetMobileNavItems}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                ค่าเริ่มต้น
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {posNavItems.map((item) => {
                const Icon = item.icon;
                const selected = visibleMobileNavIds.includes(item.id);
                const isLastVisible = selected && visibleMobileNavIds.length === 1;

                return (
                  <button
                    key={`mobile-setting-${item.id}`}
                    type="button"
                    onClick={() => toggleMobileNavItem(item.id)}
                    disabled={isLastVisible}
                    className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                    aria-pressed={selected}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </header>
  );
};

export default HeaderPos;
