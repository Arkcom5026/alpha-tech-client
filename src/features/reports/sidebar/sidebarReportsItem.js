// ✅ client/src/features/reports/sidebar/sidebarReportsItem.js

import { P1_CAP } from '@/features/auth/rbac/rbacClient';
export const sidebarReportsItems = [
  {
    label: 'รายงานทั้งหมด',
    items: [
      { label: 'รายงานภาพรวม', to: '/pos/reports', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายงานการจัดซื้อ', to: '/pos/reports/purchase', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายงานภาษีซื้อ', to: '/pos/reports/inputtax', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายงานภาษีขาย', to: '/pos/reports/salestax', cap: P1_CAP.VIEW_REPORTS },
      
      
    ],
  },
];


