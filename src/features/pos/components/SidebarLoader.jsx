// ✅ สำรอง Sidebar ทั้งหมดจากระบบ ณ เวลานี้ เพื่อความปลอดภัยและเรียกคืนได้

// src/features/pos/components/SidebarLoader.jsx

import { useLocation } from 'react-router-dom';
import useEmployeeStore from '@/store/employeeStore';
import Sidebar from './Sidebar';
import { sidebarDashboardItems } from '@/features/dashboard/sidebar/sidebarDashboardItems';


import { sidebarServicesItems } from '@/features/services/sidebar/sidebarServicesItems';

import sidebarEmployeeItems from '@/features/employee/sidebar/sidebarEmployeeItems';
import { sidebarSupplierItems } from '@/features/supplier/sidebar/sidebarSupplierItems';
import { sidebarFinanceItems } from '@/features/Finance/sidebar/sidebarFinanceItems';
import { sidebarReportsItems } from '@/features/reports/sidebar/sidebarReportsItem';
import sidebarSalesItems from '@/features/sales/sidebar/sidebarSalesItems';
import { sidebarStockItems } from '@/features/stock/sidebar/sidebarStockItems';
import { sidebarPurchaseOrdertems } from '@/features/purchaseOrder/sidebar/sidebarPurchaseOrdertems';


const pathMap = {
  '/pos/stock/templates': sidebarStockItems,
  '/pos/stock/profiles': sidebarStockItems,
  '/pos/stock/categories': sidebarStockItems,
  '/pos/stock/units': sidebarStockItems,
  '/pos/stock': sidebarStockItems,
  '/pos/stock/create': sidebarStockItems,
  '/pos/stock/barcodes': sidebarStockItems,  
  '/pos/stock/dashboard': sidebarStockItems,
  '/pos/stock/stock-report': sidebarStockItems,
  
  '/pos/dashboard': sidebarDashboardItems,
  '/pos/dashboard/sales-summary': sidebarDashboardItems,
  '/pos/dashboard/pending-payments': sidebarDashboardItems,
  '/pos/dashboard/customers': sidebarDashboardItems,
  '/pos/dashboard/notifications': sidebarDashboardItems,
  
  '/pos/sales': sidebarSalesItems,
  '/pos/sales/quick-sale': sidebarSalesItems,
  
  '/pos/purchases': sidebarPurchaseOrdertems,
  '/pos/purchases/dashboard': sidebarPurchaseOrdertems,
  '/pos/purchases/po': sidebarPurchaseOrdertems,
  '/pos/purchases/receiving': sidebarPurchaseOrdertems,
  '/pos/purchases/suppliers': sidebarPurchaseOrdertems,
  
  '/pos/services': sidebarServicesItems,
  
  '/pos/reports': sidebarReportsItems,
  
  '/pos/finance': sidebarFinanceItems,
  
  '/pos/employees': sidebarEmployeeItems,
  '/pos/employees/positions': sidebarEmployeeItems,
  '/pos/employees/roles': sidebarEmployeeItems,
  
  '/pos/suppliers': sidebarSupplierItems,
};

export default function SidebarLoader() {
  const { pathname } = useLocation();
  const role = useEmployeeStore((s) => s.role);
  const position = useEmployeeStore((s) => s.position);
  const rbacEnabled = useEmployeeStore((s) => s.branch?.RBACEnabled ?? true);

  const sortedEntries = Object.entries(pathMap).sort((a, b) => b[0].length - a[0].length);
  const items = sortedEntries.find(([key]) => pathname.startsWith(key));

  const safePosition = position || '__NO_POSITION__';

  const sidebarItems = (items ? items[1] : [])
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

