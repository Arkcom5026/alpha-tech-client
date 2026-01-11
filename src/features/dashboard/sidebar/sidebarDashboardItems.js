// ✅ sidebarDashboardItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

export const sidebarDashboardItems = [
  {
    label: 'ภาพรวมระบบ',
    items: [
      { label: 'แดชบอร์ด', to: '/pos/dashboard', cap: P1_CAP.VIEW_REPORTS },
      { label: 'ยอดขายวันนี้', to: '/pos/dashboard/sales-summary', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายการที่ยังไม่ชำระ', to: '/pos/dashboard/pending-payments', cap: P1_CAP.VIEW_REPORTS },
      { label: 'ข้อมูลลูกค้า', to: '/pos/dashboard/customers', cap: P1_CAP.VIEW_REPORTS },
      { label: 'การแจ้งเตือน', to: '/pos/dashboard/notifications', cap: P1_CAP.VIEW_REPORTS },
    ],
  },
];


