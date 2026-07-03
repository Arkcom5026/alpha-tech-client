// src/features/pos/components/sidebar/SidebarLoader.jsx
// P1 Sidebar — POS Runtime + Superadmin Governance contextual sidebar
import React from 'react';
import { useParams, useLocation, NavLink } from 'react-router-dom';
import {
  BadgePercent,
  Banknote,
  Box,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  Package,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tags,
  Truck,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';

import { getSidebarMenuConfig } from '@/config/sidebarMenuConfig';

const moduleMeta = {
  dashboard: {
    title: 'หน้าหลัก',
    subtitle: 'System Dashboard',
    icon: LayoutDashboard,
  },
  purchases: {
    title: 'จัดซื้อ',
    subtitle: 'Procurement',
    icon: ShoppingCart,
  },
  sales: {
    title: 'การขาย',
    subtitle: 'Sales Operations',
    icon: ClipboardList,
  },
  services: {
    title: 'บริการ',
    subtitle: 'Service Desk',
    icon: Wrench,
  },
  stock: {
    title: 'สต๊อก',
    subtitle: 'Inventory Control',
    icon: Package,
  },
  reports: {
    title: 'รายงาน',
    subtitle: 'Reports Center',
    icon: Gauge,
  },
  finance: {
    title: 'การเงิน',
    subtitle: 'Finance Control',
    icon: Banknote,
  },
  settings: {
    title: 'ตั้งค่าระบบ',
    subtitle: 'System Settings',
    icon: ShieldCheck,
  },
  superadminDashboard: {
    title: 'Dashboard',
    subtitle: 'Admin Console',
    icon: LayoutDashboard,
  },
  superadminCatalog: {
    title: 'Catalog',
    subtitle: 'Catalog Governance',
    icon: Box,
  },
  superadminGovernance: {
    title: 'Governance',
    subtitle: 'Review Control',
    icon: ShieldCheck,
  },
  superadminAnalytics: {
    title: 'Analytics',
    subtitle: 'Catalog Intelligence',
    icon: Gauge,
  },
  superadminSettings: {
    title: 'Settings',
    subtitle: 'System Control',
    icon: ShieldCheck,
  },
};

const itemIconMap = [
  { keywords: ['Dashboard', 'ภาพรวม', 'หน้าหลัก'], icon: LayoutDashboard },
  { keywords: ['Candidate', 'Review Queue', 'Promotion', 'Merge'], icon: ShieldCheck },
  { keywords: ['Template', 'Catalog'], icon: Box },
  { keywords: ['Brand', 'Category', 'Type', 'Unit'], icon: Tags },
  { keywords: ['Analytics', 'Stats', 'Growth', 'Adoption'], icon: Gauge },
  { keywords: ['Audit'], icon: FileText },
  { keywords: ['Permission', 'System', 'Settings'], icon: ShieldCheck },
  { keywords: ['ขายสินค้า', 'ขาย'], icon: ShoppingCart },
  { keywords: ['ใบเสร็จ', 'ใบส่ง', 'บิล', 'พิมพ์'], icon: ReceiptText },
  { keywords: ['ออนไลน์'], icon: Truck },
  { keywords: ['คืนสินค้า', 'คืน'], icon: PackageCheck },
  { keywords: ['ลูกค้า'], icon: Users },
  { keywords: ['สินค้า', 'บริการ'], icon: Box },
  { keywords: ['โปรโมชัน', 'ส่วนลด'], icon: BadgePercent },
  { keywords: ['พนักงาน', 'อนุมัติ'], icon: UserCheck },
  { keywords: ['ตำแหน่ง', 'สิทธิ์'], icon: ShieldCheck },
  { keywords: ['สาขา', 'บริษัท', 'ร้าน'], icon: Building2 },
  { keywords: ['ธนาคาร', 'การเงิน'], icon: Banknote },
  { keywords: ['รายงาน'], icon: Gauge },
  { keywords: ['จัดซื้อ', 'สั่งซื้อ'], icon: BriefcaseBusiness },
];

const getItemIcon = (label = '') => {
  const found = itemIconMap.find((entry) =>
    entry.keywords.some((keyword) => label.toLowerCase().includes(keyword.toLowerCase())),
  );
  return found?.icon || FileText;
};

const normalizePath = (path = '') => {
  if (!path) return '/';
  const normalized = path.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return normalized || '/';
};

const isRouteMatch = (currentPath, targetPath) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);
  return current === target || current.startsWith(`${target}/`);
};

const findBestActiveItemPath = (pathname, sections = []) => {
  const allItems = sections.flatMap((section) => section.items || []);
  const matches = allItems
    .filter((item) => isRouteMatch(pathname, item.to))
    .sort((a, b) => normalizePath(b.to).length - normalizePath(a.to).length);
  return matches[0]?.to || null;
};

const getSuperadminActiveModule = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const superadminIdx = segments.indexOf('superadmin');
  const moduleKey = segments[superadminIdx + 1] || 'dashboard';

  if (moduleKey === 'catalog') return 'superadminCatalog';
  if (moduleKey === 'governance') return 'superadminGovernance';
  if (moduleKey === 'analytics') return 'superadminAnalytics';
  if (moduleKey === 'settings') return 'superadminSettings';
  return 'superadminDashboard';
};

const getPosActiveModule = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const posIdx = segments.indexOf('pos');
  return posIdx !== -1 && segments[posIdx + 1] ? segments[posIdx + 1] : 'purchases';
};

const SidebarLoader = () => {
  const { shopSlug } = useParams();
  const { pathname } = useLocation();

  const menuConfig = getSidebarMenuConfig(shopSlug);
  const isSuperadmin = pathname.includes('/superadmin');

  const activeModule = React.useMemo(() => {
    if (isSuperadmin) return getSuperadminActiveModule(pathname);
    return getPosActiveModule(pathname);
  }, [isSuperadmin, pathname]);

  const currentMenuItems = React.useMemo(() => {
    if (isSuperadmin) {
      return menuConfig[activeModule] || menuConfig.superadminDashboard || [];
    }

    return menuConfig[activeModule] || menuConfig.reports || menuConfig.purchases || [];
  }, [activeModule, isSuperadmin, menuConfig]);

  const currentModule = moduleMeta[activeModule] || {
    title: isSuperadmin ? 'Superadmin' : 'POS',
    subtitle: isSuperadmin ? 'Admin Console' : 'Operations',
    icon: CircleDot,
  };
  const ModuleIcon = currentModule.icon;

  const activeItemPath = React.useMemo(
    () => findBestActiveItemPath(pathname, currentMenuItems),
    [pathname, currentMenuItems],
  );

  return (
    <aside className="relative z-30 flex h-full w-64 shrink-0 select-none flex-col overflow-hidden border-r border-[#7a5b21]/70 bg-slate-950 text-white shadow-[18px_0_46px_rgba(15,23,42,0.26)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(245,158,11,0.14),transparent_32%),radial-gradient(circle_at_100%_40%,rgba(251,191,36,0.06),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-400/75 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-amber-500/8 blur-2xl" />

      <div className="relative flex h-[76px] shrink-0 items-center border-b border-[#7a5b21]/50 bg-slate-950/76 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400 shadow-[0_0_0_4px_rgba(245,158,11,0.12),0_0_12px_rgba(245,158,11,0.55)]" />
          <div className="min-w-0">
            <p className="truncate text-base font-black uppercase tracking-[0.11em] text-white">
              {isSuperadmin ? 'Admin Console' : 'POS System'}
            </p>
            <p className="mt-0.5 truncate text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/65">
              {isSuperadmin ? 'Governance command rail' : 'Enterprise command rail'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-[#7a5b21]/72 bg-slate-950/42 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_0_22px_rgba(245,158,11,0.10)]">
          <div className="absolute inset-x-7 top-[16px] h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b7791f]/72 bg-gradient-to-br from-orange-500/28 to-amber-500/10 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(245,158,11,0.16)]">
              <ModuleIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black text-amber-300/80">
                {isSuperadmin ? 'พื้นที่ปัจจุบัน' : 'โมดูลปัจจุบัน'}
              </p>
              <h2 className="truncate text-lg font-black leading-tight text-orange-400">
                {currentModule.title}
              </h2>
              <p className="truncate text-[10px] font-bold text-amber-200/70">
                {currentModule.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 pb-4 pr-3 scrollbar-none">
        <div className="space-y-5">
          {currentMenuItems.map((section, idx) => (
            <div key={`sec-${idx}`} className="space-y-2.5">
              <div className="space-y-2 px-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[11px] font-black text-amber-400">
                    {section.label}
                  </h3>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-amber-200/80" />
                </div>
                <div className="h-px bg-gradient-to-r from-[#7a5b21]/70 via-[#d6a84a]/22 to-transparent" />
              </div>

              <ul className="space-y-1.5">
                {(section.items || []).map((item, itemIdx) => {
                  const isItemActive = normalizePath(item.to) === normalizePath(activeItemPath);
                  const ItemIcon = getItemIcon(item.label);

                  return (
                    <li key={`${item.to}-${itemIdx}`}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={[
                          'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 text-[13px] font-black transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                          isItemActive
                            ? 'border-amber-300/90 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.24),0_0_20px_rgba(245,158,11,0.32)]'
                            : 'border-[#7a5b21]/80 bg-slate-950/42 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-px hover:border-amber-400/80 hover:bg-white/10 hover:text-white hover:shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_0_14px_rgba(245,158,11,0.18)]',
                        ].join(' ')}
                      >
                        <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                        <span
                          className={[
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
                            isItemActive
                              ? 'border-white/20 bg-white/16 text-white shadow-inner'
                              : 'border-[#7a5b21]/60 bg-slate-900/60 text-amber-300 group-hover:border-amber-400/60 group-hover:bg-amber-500/10',
                          ].join(' ')}
                        >
                          <ItemIcon className="h-4 w-4" />
                        </span>

                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <ChevronRight
                          className={[
                            'h-3.5 w-3.5 shrink-0 transition-all duration-200',
                            isItemActive ? 'translate-x-0 text-white' : 'text-amber-300/60 group-hover:translate-x-0.5 group-hover:text-amber-200',
                          ].join(' ')}
                        />
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-[#7a5b21]/55 bg-slate-950/72 p-4">
        <NavLink
          to={isSuperadmin ? `/${shopSlug || 'advancetech'}/superadmin/settings` : `/${shopSlug || 'advancetech'}/pos/settings`}
          className="group flex items-center gap-3 rounded-2xl border border-[#7a5b21]/78 bg-slate-950/48 px-3 py-3 text-[13px] font-black text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:-translate-y-px hover:border-amber-400/85 hover:bg-white/10 hover:text-white"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#b7791f]/65 bg-orange-500/10 text-amber-300 transition group-hover:border-amber-300/70">
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 truncate">
            {isSuperadmin ? 'Settings' : 'ซ่อนเมนู'}
          </span>
        </NavLink>
      </div>
    </aside>
  );
};

export default SidebarLoader;
