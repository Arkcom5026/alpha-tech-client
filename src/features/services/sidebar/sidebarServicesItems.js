

import { P1_CAP } from '@/features/auth/rbac/rbacClient';

export const sidebarServicesItems = [
  {
    label: 'บริการ',
    items: [
      { label: 'ภาพรวมบริการ', to: '/pos/services', cap: P1_CAP.VIEW_REPORTS },
      { label: 'งานซ่อม',  to: '/pos/services/repairs', cap: P1_CAP.POS_SALE },
      { label: 'ลูกค้า',   to: '/pos/services/customers', cap: P1_CAP.POS_SALE },
      { label: 'นัดหมาย',  to: '/pos/services/appointments', cap: P1_CAP.POS_SALE },
      { label: 'อะไหล่และวัสดุ', to: '/pos/services/parts', cap: P1_CAP.MANAGE_PRODUCTS },
      { label: 'การเงินบริการ',  to: '/pos/services/invoices', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายงานบริการ',to: '/pos/services/reports', cap: P1_CAP.VIEW_REPORTS },
      { label: 'ตั้งค่า', to: '/pos/services/settings', cap: P1_CAP.MANAGE_PRODUCTS },
    ],
  },
];
