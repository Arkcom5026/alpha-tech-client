// src/features/pos/components/header/HeaderPos.jsx
// 🏛️ P1 POS Header — Dark Enterprise + Amber Premium
// Principle: clear module state, calm operational surface, premium but not distracting.

import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Home,
  LogOut,
  Menu,
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
import { P1_CAP } from '@/features/auth/rbac/rbacClient';
import { useBranchStore } from '@/features/branch/store/branchStore';

const HeaderPos = () => {
  const navigate = useNavigate();
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

  const displayBranchName =
    employee?.branchName ||
    fallbackBranchName ||
    (shopSlug ? `ร้านค้าพันธมิตร (${shopSlug})` : 'ไม่ระบุสาขา');

  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';
  const isGlobalSuperAdmin = isSuperAdmin;
  const displayName = employee?.name || user?.username || user?.email || 'ผู้ใช้';

   const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    clearBranch();
    logoutAction();
    navigate('/');
  };

  useEffect(() => {
    if (isSuperAdmin) return;

    const roleLower = String(role || '').toLowerCase();

    if (isAuthenticated && roleLower === 'employee' && employee?.branchId && selectedBranchId) {
      loadAndSetBranchById(selectedBranchId);
    }
  }, [isSuperAdmin, isAuthenticated, role, employee?.branchId, selectedBranchId, loadAndSetBranchById]);

  const getRoutePath = (subPath) => {
    return shopSlug ? `/${shopSlug}/pos${subPath}` : `/pos${subPath}`;
  };

  // 🟢 FIXED: ปลดล็อกสวิตช์ฟิลเตอร์เมนูหลักด้านบน เปิดโล่ง show: true ให้ผู้ใช้งานกดใช้งานได้ครบทุกโมดูล
  const navItems = [
    { label: 'หน้าหลัก', path: getRoutePath(''), end: true, show: true, icon: Home },
    { label: 'จัดซื้อ', path: getRoutePath('/purchases'), show: true, icon: ShoppingCart },
    { label: 'การขาย', path: getRoutePath('/sales'), show: true, icon: ClipboardList },
    { label: 'บริการ', path: getRoutePath('/services'), show: true, icon: Wrench },
    { label: 'สต๊อก', path: getRoutePath('/stock'), show: true, icon: Package },
    { label: 'รายงาน', path: getRoutePath('/reports'), show: true, icon: BarChart3 },
    { label: 'การเงิน', path: getRoutePath('/finance'), show: true, icon: CircleDollarSign },
    { label: 'ตั้งค่าระบบ', path: getRoutePath('/settings'), show: true, icon: Settings },
  ].filter((item) => item.show);

  const navLinkClass = ({ isActive }) =>
    [
      'relative inline-flex items-center justify-center gap-2 overflow-visible rounded-2xl px-4 py-2.5',
      'text-[13px] font-black whitespace-nowrap border transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
      'before:absolute before:inset-x-3 before:top-0 before:h-px before:rounded-full before:transition-opacity before:duration-200',
      'after:absolute after:left-5 after:right-5 after:-bottom-[3px] after:h-[2px] after:rounded-full after:transition-all after:duration-200',
      isActive
        ? [
            'border-amber-300/70 bg-gradient-to-b from-amber-400 to-orange-500 text-white',
            'shadow-[0_0_0_1px_rgba(251,191,36,0.28),0_0_28px_rgba(245,158,11,0.50),0_10px_32px_rgba(249,115,22,0.34)]',
            'before:bg-white/60 before:opacity-100 after:bg-amber-200 after:opacity-100 after:shadow-[0_0_12px_rgba(251,191,36,0.55)]',
          ].join(' ')
        : [
            'border-[#7a5b21]/80 bg-slate-950/34 text-slate-100',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_0_0_1px_rgba(120,53,15,0.14)]',
            'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:opacity-100 after:bg-amber-400/55 after:opacity-0',
            'hover:-translate-y-px hover:border-[#d6a84a]/85 hover:bg-white/10 hover:text-white hover:shadow-[0_0_0_1px_rgba(251,191,36,0.18),0_0_16px_rgba(212,168,74,0.24)] hover:after:opacity-100',
          ].join(' '),
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 w-full border-t-2 border-orange-400 border-b border-amber-500/35 bg-slate-950 text-white shadow-[0_18px_48px_rgba(15,23,42,0.24)]">
      <div className="relative overflow-visible">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(249,115,22,0.20),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(251,191,36,0.10),transparent_24%),radial-gradient(circle_at_70%_100%,rgba(59,130,246,0.05),transparent_40%),linear-gradient(90deg,rgba(15,23,42,0.98),rgba(30,41,59,0.97),rgba(15,23,42,0.98))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-80" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/95 to-transparent" />
        <div className="pointer-events-none absolute inset-x-1/4 bottom-0 h-10 bg-amber-500/14 blur-2xl" />

        <div className="relative mx-auto flex h-[76px] max-w-[1680px] items-center gap-4 px-6 xl:px-8">
          {/* Mobile selector */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#b7791f]/65 bg-slate-950/40 text-orange-300 shadow-inner">
              <Menu className="h-4 w-4" />
            </div>

            <select
              onChange={(event) => navigate(event.target.value)}
              className="h-10 rounded-2xl border border-[#b7791f]/65 bg-slate-900 px-3 text-sm font-black text-white outline-none transition focus:border-orange-400"
              defaultValue=""
            >
              <option value="" disabled hidden>
                เมนู POS
              </option>
              {navItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* POS identity badge */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-10 items-center gap-2 rounded-2xl border border-[#b7791f]/70 bg-slate-950/38 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_18px_rgba(245,158,11,0.12)]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.14)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">POS</span>
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-400/28 to-transparent" />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden min-w-0 flex-1 items-center gap-1.5 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.path} to={item.path} end={item.end} className={navLinkClass}>
                  <Icon className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-amber-300/25 to-transparent xl:block" />

          {/* Right control panel */}
          <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
            {displayBranchName && !isGlobalSuperAdmin && (
              <div className="hidden max-w-[320px] items-center gap-2 rounded-full border border-[#b7791f]/65 bg-slate-950/28 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur lg:flex">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-300 ring-1 ring-amber-400/35">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-[pulse_3.5s_ease-in-out_infinite]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-300/85">
                    Branch online
                  </p>
                  <p className="truncate text-xs font-black text-slate-100">{displayBranchName}</p>
                </div>
              </div>
            )}

            {isGlobalSuperAdmin && (
              <div className="hidden items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-red-300 lg:flex">
                <Terminal className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">Superadmin</span>
              </div>
            )}

            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((value) => !value)}
                  className="flex h-11 items-center gap-2 rounded-full border border-[#b7791f]/65 bg-slate-950/28 px-3 text-left text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-amber-400/80 hover:bg-white/10 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
                  aria-expanded={showMenu}
                  aria-label="เปิดเมนูผู้ใช้งาน POS"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-slate-300 ring-1 ring-amber-400/30">
                    <UserCircle className="h-4 w-4" />
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      POS Operator
                    </p>
                    <p className="max-w-[130px] truncate text-xs font-black">{displayName}</p>
                  </div>

                  <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition ${showMenu ? 'rotate-180' : ''}`} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#7a5b21]/85 bg-slate-950/95 p-2 text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-black">{displayName}</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                        {displayBranchName}
                      </p>
                    </div>

                    <div className="my-1 h-px bg-gradient-to-r from-transparent via-amber-300/28 to-transparent" />

                    {/* 🟢 FIXED: ถอดเงื่อนไข canSettings ออกเพื่อให้ปุ่มตั้งค่าระบบแสดงผลกับทุกคนเสมอ */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        navigate(getRoutePath('/settings'));
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Settings className="h-3.5 w-3.5 text-orange-300" />
                      ตั้งค่าระบบ
                    </button>

                    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Session พร้อมใช้งาน
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black text-red-300 transition hover:bg-red-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      ออกจากระบบ POS
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderPos;