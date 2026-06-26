// src/config/sidebarReportsItem.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [DYNAMIC FIXED] แปลงเป็นฟังก์ชันรับค่า shopSlug เพื่อต่อท่อสัญญานศูนย์วิเคราะห์รายงานหลังบ้าน
 */
export const getSidebarReportsItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'รายงานทั้งหมด',
      items: [
        { label: 'รายงานภาพรวม', to: `${prefix}/reports`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'Dashboard การขาย', to: `${prefix}/reports/sales`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายการขาย', to: `${prefix}/reports/sales/list`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'วิเคราะห์สินค้า', to: `${prefix}/reports/sales/products`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานการจัดซื้อ', to: `${prefix}/reports/purchase`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานภาษีซื้อ', to: `${prefix}/reports/inputtax`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานภาษีขาย', to: `${prefix}/reports/salestax`, cap: P1_CAP.VIEW_REPORTS },
      ],
    },
  ];
};