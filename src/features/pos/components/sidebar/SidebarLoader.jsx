import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
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
  Tags,
  Truck,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';

import { getSidebarMenuConfig } from '@/config/sidebarMenuConfig';

const moduleMeta = {
  dashboard: { title: 'หน้าหลัก', subtitle: 'ภาพรวมการดำเนินงาน', icon: LayoutDashboard },
  purchases: { title: 'จัดซื้อ', subtitle: 'งานจัดซื้อและรับสินค้า', icon: ShoppingCart },
  sales: { title: 'การขาย', subtitle: 'งานขายและลูกค้า', icon: ClipboardList },
  services: { title: 'บริการ', subtitle: 'งานบริการและซ่อม', icon: Wrench },
  stock: { title: 'สต๊อก', subtitle: 'สินค้าและคลัง', icon: Package },
  reports: { title: 'รายงาน', subtitle: 'รายงานและการวิเคราะห์', icon: Gauge },
  finance: { title: 'การเงิน', subtitle: 'บัญชีและการเงิน', icon: Banknote },
  settings: { title: 'ตั้งค่าระบบ', subtitle: 'การตั้งค่าและสิทธิ์', icon: ShieldCheck },
  superadminDashboard: { title: 'Dashboard', subtitle: 'Admin Console', icon: LayoutDashboard },
  superadminCatalog: { title: 'Catalog', subtitle: 'Catalog Governance', icon: Box },
  superadminGovernance: { title: 'Governance', subtitle: 'Review Control', icon: ShieldCheck },
  superadminAnalytics: { title: 'Analytics', subtitle: 'Catalog Intelligence', icon: Gauge },
  superadminSettings: { title: 'Settings', subtitle: 'System Control', icon: ShieldCheck },
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
  const matches = sections
    .flatMap((section) => section.items || [])
    .filter((item) => isRouteMatch(pathname, item.to))
    .sort((a, b) => normalizePath(b.to).length - normalizePath(a.to).length);
  return matches[0]?.to || null;
};

const getSuperadminActiveModule = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('superadmin');
  const moduleKey = segments[index + 1] || 'dashboard';
  if (moduleKey === 'catalog') return 'superadminCatalog';
  if (moduleKey === 'governance') return 'superadminGovernance';
  if (moduleKey === 'analytics') return 'superadminAnalytics';
  if (moduleKey === 'settings') return 'superadminSettings';
  return 'superadminDashboard';
};

const getPosActiveModule = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('pos');
  const moduleKey = index !== -1 && segments[index + 1] ? segments[index + 1] : 'dashboard';
  return moduleKey === 'customers' ? 'sales' : moduleKey;
};

const SidebarLoader = ({ collapsed = false, onToggle }) => {
  const { shopSlug } = useParams();
  const { pathname } = useLocation();
  const menuConfig = getSidebarMenuConfig(shopSlug);
  const isSuperadmin = pathname.includes('/superadmin');

  const activeModule = React.useMemo(
    () => (isSuperadmin ? getSuperadminActiveModule(pathname) : getPosActiveModule(pathname)),
    [isSuperadmin, pathname],
  );

  const currentMenuItems = React.useMemo(() => {
    if (isSuperadmin) return menuConfig[activeModule] || menuConfig.superadminDashboard || [];
    return menuConfig[activeModule] || menuConfig.dashboard || menuConfig.reports || menuConfig.purchases || [];
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

  const settingsPath = isSuperadmin
    ? `/${shopSlug || 'advancetech'}/superadmin/settings`
    : `/${shopSlug || 'advancetech'}/pos/settings`;

  return (
    <aside
      className={[
        'relative z-30 flex h-full shrink-0 select-none flex-col overflow-hidden border-r border-slate-200 bg-slate-50/90 text-slate-700',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
      aria-label="เมนูงาน POS"
    >
      <div className={['flex h-16 shrink-0 items-center border-b border-slate-200 bg-white', collapsed ? 'justify-center px-2' : 'px-4'].join(' ')}>
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-semibold text-white" title="Saduaksabuy POS">
            SS
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">SADUAKSABUY</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Merchant Operations</p>
          </div>
        )}
      </div>

      <div className={collapsed ? 'flex justify-center px-2 py-3' : 'px-3 py-3'}>
        <div
          className={[
            'flex items-center text-teal-800',
            collapsed ? 'h-11 w-11 justify-center rounded-xl bg-teal-50' : 'gap-3 px-2 py-2',
          ].join(' ')}
          title={collapsed ? currentModule.title : undefined}
        >
          <ModuleIcon className="h-5 w-5 shrink-0 text-teal-600" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{currentModule.title}</p>
              <p className="truncate text-[11px] text-slate-500">{currentModule.subtitle}</p>
            </div>
          )}
        </div>
      </div>

      <nav className={['min-h-0 flex-1 overflow-y-auto pb-3 scrollbar-none', collapsed ? 'px-2' : 'px-3'].join(' ')}>
        <div className={collapsed ? 'space-y-2' : 'space-y-5'}>
          {currentMenuItems.map((section, sectionIndex) => (
            <section key={`section-${sectionIndex}`} className={collapsed ? '' : 'space-y-2'}>
              {!collapsed && (
                <div className="flex items-center justify-between px-2">
                  <h3 className="truncate text-[11px] font-medium text-slate-400">{section.label}</h3>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}

              <ul className={collapsed ? 'space-y-2' : 'space-y-1'}>
                {(section.items || []).map((item, itemIndex) => {
                  const isItemActive = normalizePath(item.to) === normalizePath(activeItemPath);
                  const ItemIcon = getItemIcon(item.label);

                  return (
                    <li key={`${item.to}-${itemIndex}`}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        title={collapsed ? item.label : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        className={[
                          'group relative flex transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                          collapsed
                            ? 'h-11 w-11 items-center justify-center rounded-xl'
                            : 'min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium',
                          isItemActive
                            ? 'bg-white text-slate-950 shadow-sm ring-1 ring-inset ring-slate-200'
                            : 'text-slate-600 hover:bg-white hover:text-slate-950',
                        ].join(' ')}
                      >
                        {isItemActive && !collapsed && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-teal-500" />}
                        <ItemIcon className={['h-[18px] w-[18px] shrink-0', isItemActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'].join(' ')} />
                        {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                        {!collapsed && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}

                        {collapsed && (
                          <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      <div className={['border-t border-slate-200 bg-white', collapsed ? 'p-2' : 'p-3'].join(' ')}>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className={[
              'flex min-h-11 items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
              collapsed ? 'w-11 justify-center' : 'w-full gap-3 px-3 text-[13px] font-medium',
            ].join(' ')}
            aria-label={collapsed ? 'ขยายเมนูด้านข้าง' : 'ย่อเมนูด้านข้าง'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>ย่อเมนู</span>}
          </button>
        ) : (
          <NavLink
            to={settingsPath}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>ตั้งค่าระบบ</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default SidebarLoader;
