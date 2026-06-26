// src/features/pos/components/sidebar/SidebarLoader.jsx
// 🏛️ P1 POS Sidebar — Dark Enterprise + Brass Gold (Header-Matched Final Polish)
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
};

const itemIconMap = [
  { keywords: ['Dashboard', 'ภาพรวม', 'หน้าหลัก'], icon: LayoutDashboard },
  { keywords: ['ขายสินค้า', 'ขาย'], icon: ShoppingCart },
  { keywords: ['ใบเสร็จ', 'ใบส่ง', 'บิล', 'พิมพ์'], icon: ReceiptText },
  { keywords: ['ออนไลน์'], icon: Truck },
  { keywords: ['คืนสินค้า', 'คืน'], icon: PackageCheck },
  { keywords: ['ลูกค้า'], icon: Users },
  { keywords: ['สินค้า', 'บริการ'], icon: Box },
  { keywords: ['โปรโมชัน', 'ส่วนลด'], icon: Tags },
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

const SidebarLoader = () => {
  const { shopSlug } = useParams();
  const { pathname } = useLocation();

  const menuConfig = getSidebarMenuConfig(shopSlug);

  const activeModule = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const posIdx = segments.indexOf('pos');

    if (posIdx !== -1 && segments[posIdx + 1]) {
      return segments[posIdx + 1];
    }

    return 'purchases';
  }, [pathname]);

  const currentMenuItems = menuConfig[activeModule] || [];
  const currentModule = moduleMeta[activeModule] || {
    title: 'POS',
    subtitle: 'Operations',
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

      {/* System anchor */}
      <div className="relative flex h-[76px] shrink-0 items-center border-b border-[#7a5b21]/50 bg-slate-950/76 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400 shadow-[0_0_0_4px_rgba(245,158,11,0.12),0_0_12px_rgba(245,158,11,0.55)]" />
          <div className="min-w-0">
            <p className="truncate text-base font-black uppercase tracking-[0.11em] text-white">
              POS System
            </p>
            <p className="mt-0.5 truncate text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/65">
              Enterprise command rail
            </p>
          </div>
        </div>
      </div>

      {/* Current module card */}
      <div className="relative px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-[#7a5b21]/72 bg-slate-950/42 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_0_22px_rgba(245,158,11,0.10)]">
          <div className="absolute inset-x-7 top-[16px] h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b7791f]/72 bg-gradient-to-br from-orange-500/28 to-amber-500/10 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(245,158,11,0.16)]">
              <ModuleIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black text-amber-300/80">
                โมดูลปัจจุบัน
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

      {/* Menu sections */}
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
                  // 🟢 [LONGEST MATCH WINS]
                  // ป้องกัน Active ซ้ำเมื่อ URL เป็น route ซ้อน เช่น /receipt และ /receipt/items
                  const isItemActive = normalizePath(item.to) === normalizePath(activeItemPath);

                  const ItemIcon = getItemIcon(item.label);

                  return (
                    <li key={`item-${itemIdx}`}>
                      <NavLink
                        to={item.to}
                        className={() =>
                          [
                            'group relative flex items-center justify-between gap-3 overflow-visible rounded-2xl border px-4 py-2.5',
                            'text-[13px] font-black transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                            'before:absolute before:inset-x-3 before:top-0 before:h-px before:rounded-full before:transition-opacity before:duration-200',
                            'after:absolute after:left-5 after:right-5 after:-bottom-[3px] after:h-[2px] after:rounded-full after:transition-all after:duration-200',

                            isItemActive
                              ? [
                                'border-amber-300/58 bg-gradient-to-b from-amber-400/90 to-orange-500/95 text-white',
                                'shadow-[0_0_0_1px_rgba(251,191,36,0.16),0_0_12px_rgba(245,158,11,0.22),0_6px_14px_rgba(249,115,22,0.12)]',
                                'before:bg-amber-100/35 before:opacity-100 after:bg-amber-200/80 after:opacity-100 after:shadow-[0_0_6px_rgba(251,191,36,0.32)]',
                              ].join(' ')
                              : [
                                'border-[#7a5b21]/80 bg-slate-950/34 text-slate-100',
                                'shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_0_0_1px_rgba(120,53,15,0.14)]',
                                'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:opacity-100 after:bg-amber-400/55 after:opacity-0',
                                'hover:-translate-y-px hover:border-[#d6a84a]/85 hover:bg-white/10 hover:text-white hover:shadow-[0_0_0_1px_rgba(251,191,36,0.18),0_0_16px_rgba(212,168,74,0.24)] hover:after:opacity-100',
                              ].join(' '),

                          ].join(' ')

                        }
                      >
                        <span className="relative z-10 flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-xl transition ${isItemActive
                                ? 'bg-[#fff3c4]/14 text-amber-100 ring-1 ring-amber-200/18'
                                : 'text-amber-300 group-hover:text-amber-200'
                              }`}
                          >
                            <ItemIcon className="h-4 w-4" />
                          </span>

                          <span className="truncate">{item.label}</span>
                        </span>

                        <span className="relative z-10 flex shrink-0 items-center">
                          {isItemActive ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.55)]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-amber-300/45 transition group-hover:translate-x-0.5 group-hover:text-amber-200" />
                          )}
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>

              {idx < currentMenuItems.length - 1 && (
                <div className="pt-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#7a5b21]/42 to-transparent" />
                </div>
              )}
            </div>
          ))}

          {currentMenuItems.length === 0 && (
            <div className="rounded-2xl border border-[#7a5b21]/60 bg-slate-950/38 px-4 py-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-amber-300 ring-1 ring-[#7a5b21]/55">
                <FileTextFallback />
              </div>
              <p className="text-xs font-black text-slate-400">ไม่มีรายการเมนูย่อย</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-600">
                ยังไม่มีเมนูสำหรับโมดูลนี้
              </p>
            </div>
          )}
        </div>

        {/* Favorite / quick access block */}
        {currentMenuItems.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[#7a5b21]/80 bg-slate-950/34 px-4 py-3 text-amber-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Star className="h-4 w-4 shrink-0 text-amber-300" />
                <span className="truncate text-xs font-black">เมนูโปรด</span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-amber-300/60" />
            </div>
          </div>
        )}
      </div>

      {/* Collapse affordance */}
      <div className="relative shrink-0 border-t border-[#7a5b21]/45 bg-slate-950/68 p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-[#7a5b21]/80 bg-slate-950/34 px-4 py-2.5 text-xs font-black text-amber-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition hover:border-[#d6a84a]/85 hover:bg-white/8 hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#b7791f]/70 text-amber-300">
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
          <span>ซ่อนเมนู</span>
        </button>
      </div>
    </aside>
  );
};

const FileTextFallback = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

export default SidebarLoader;