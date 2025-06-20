// ✅ สำรอง Sidebar ทั้งหมดจากระบบ ณ เวลานี้ เพื่อความปลอดภัยและเรียกคืนได้

// src/features/pos/components/SidebarLoader.jsx

import { useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import { sidebarDashboardItems } from '@/features/dashboard/sidebar/sidebarDashboardItems.js';
import { sidebarServicesItems } from '@/features/services/sidebar/sidebarServicesItems.js';
import { sidebarSupplierItems } from '@/features/supplier/sidebar/sidebarSupplierItems.js';
import { sidebarReportsItems } from '@/features/reports/sidebar/sidebarReportsItem.js';
import { sidebarStockItems } from '@/features/stock/sidebar/sidebarStockItems.js';
import { sidebarSalesItems } from '@/features/sales/sidebar/sidebarSalesItems.js';
import { sidebarEmployeeItems } from '@/features/employee/sidebar/sidebarEmployeeItems.js';
import { sidebarFinanceItems } from '@/features/finance/sidebar/sidebarFinanceItems';
import { sidebarPurchaseOrdertems } from '@/features/purchaseOrder/sidebar/sidebarPurchaseOrdertems';
import useEmployeeStore from '@/features/employee/store/employeeStore';

const pathGroups = [
  { prefix: '/pos/stock', sidebar: sidebarStockItems },
  { prefix: '/pos/dashboard', sidebar: sidebarDashboardItems },
  { prefix: '/pos/sales', sidebar: sidebarSalesItems },
  { prefix: '/pos/services', sidebar: sidebarServicesItems },
  { prefix: '/pos/reports', sidebar: sidebarReportsItems },
  { prefix: '/pos/finance', sidebar: sidebarFinanceItems },
  { prefix: '/pos/employees', sidebar: sidebarEmployeeItems },
  { prefix: '/pos/suppliers', sidebar: sidebarSupplierItems },
  { prefix: '/pos/purchases', sidebar: sidebarPurchaseOrdertems },

];

export default function SidebarLoader() {
  const { pathname } = useLocation();
  const role = useEmployeeStore((s) => s.role);
  const position = useEmployeeStore((s) => s.position);
  const rbacEnabled = useEmployeeStore((s) => s.branch?.RBACEnabled ?? true);

  const sortedGroups = pathGroups.sort((a, b) => b.prefix.length - a.prefix.length);
  const matchedGroup = sortedGroups.find(({ prefix }) => pathname.startsWith(prefix));

  const safePosition = position || '__NO_POSITION__';

  const sidebarItems = (matchedGroup ? matchedGroup.sidebar : [])
    .flatMap((group) => group.items || [])
    .filter((item) => {
      if (!item.role) return true;
      if (item.role !== role) return false;

      if (rbacEnabled && item.position && !item.position.includes(safePosition)) {
        console.warn(`🔒 RBAC: ไม่อนุญาตให้แสดงเมนู "${item.label}" เพราะตำแหน่ง "${safePosition}" ไม่อยู่ใน [${item.position.join(', ')}]`);
        return false;
      }
      return true;
    });

  return (
    <div>
      <Sidebar items={sidebarItems} />
    </div>
  );
}
