// src/config/sidebarReportsItem.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [DYNAMIC FIXED] แกะรหัสพิกัดร้านค้าพาร์ตเนอร์เชื่อมสายรายงานรายวัน-รายเดือน ตรงตาม URL สากล
 */
export const getSidebarReportsItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'รายงานทั้งหมด',
      items: [
        { label: 'รายงานภาพรวม', to: `${prefix}/reports`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'Dashboard การขาย', to: `${prefix}/reports/sales`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายการขาย', to: `${prefix}/reports/sales/list`, cap: P1_CAP.VIEW_REPORTS }, // ✅ ตรึงพิกัดให้ตรงแถบ URL หน้าจอหลัก
        { label: 'วิเคราะห์สินค้า', to: `${prefix}/reports/sales/products`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานการจัดซื้อ', to: `${prefix}/reports/purchase`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานภาษีซื้อ', to: `${prefix}/reports/inputtax`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานภาษีขาย', to: `${prefix}/reports/salestax`, cap: P1_CAP.VIEW_REPORTS },
      ],
    },
  ];
};