// ✅ client/src/features/reports/sidebar/sidebarReportsItem.js

import { P1_CAP } from '@/features/auth/rbac/rbacClient';

export const sidebarReportsItems = [
  {
    label: 'รายงานทั้งหมด',
    items: [
      { label: 'รายงานภาพรวม', to: '/pos/reports', cap: P1_CAP.VIEW_REPORTS },

      // ✅ Sales Report
      { label: 'Dashboard การขาย', to: '/pos/reports/sales', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายการขาย', to: '/pos/reports/sales/list', cap: P1_CAP.VIEW_REPORTS },
      { label: 'วิเคราะห์สินค้า', to: '/pos/reports/sales/products', cap: P1_CAP.VIEW_REPORTS },

      { label: 'รายงานการจัดซื้อ', to: '/pos/reports/purchase', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายงานภาษีซื้อ', to: '/pos/reports/inputtax', cap: P1_CAP.VIEW_REPORTS },
      { label: 'รายงานภาษีขาย', to: '/pos/reports/salestax', cap: P1_CAP.VIEW_REPORTS },
    ],
  },
];