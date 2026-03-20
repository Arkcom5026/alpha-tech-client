import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    label: 'แดชบอร์ดหลัก',
    to: '/superadmin/dashboard',
  },
  {
    label: 'หมวดสินค้า',
    to: '/superadmin/categories',
  },
  {
    label: 'ประเภทสินค้า',
    to: '/superadmin/product-types',
  },
  {
    label: 'แบรนด์',
    to: '/superadmin/brands',
  },
  {
    label: 'สินค้า Global',
    to: '/superadmin/products',
  },
  {
    label: 'จัดการสาขา',
    to: '/superadmin/branches',
  },
  {
    label: 'ตั้งค่าระบบ',
    to: '/superadmin/settings',
  },
];

const baseLinkClass =
  'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150';

const SidebarSuperAdmin = () => {
  return (
    <aside className="flex min-h-screen w-full max-w-[280px] flex-col border-r border-slate-200 bg-slate-900 text-white">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          Global Control
        </div>
        <h2 className="mt-2 text-2xl font-bold">SuperAdmin</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          พื้นที่ควบคุมข้อมูลกลางและโครงสร้างระดับ Platform
        </p>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-2xl border border-blue-900 bg-blue-950/40 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            Session Scope
          </div>
          <div className="mt-1 text-sm font-semibold text-white">GLOBAL MODE</div>
          <div className="mt-1 text-xs leading-5 text-slate-300">
            ใช้สำหรับงานระดับระบบ ไม่ใช่งานปฏิบัติการรายสาขา
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 pb-6">
        <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          เมนูหลัก
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${baseLinkClass} ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3">
          <div className="text-sm font-semibold text-amber-300">ข้อควรระวัง</div>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            หลีกเลี่ยงการนำเมนูขาย, สต๊อก, ลูกค้า, supplier หรือ workflow ระดับสาขา
            เข้ามาปะปนในฝั่ง SuperAdmin
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarSuperAdmin;
