// src/config/sidebarServicesItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [DYNAMIC FIXED] แปลงเป็นฟังก์ชันรับค่า shopSlug เพื่อรักษามิติพาธงานบริการไม่ให้หน้าจอขาว
 */
export const getSidebarServicesItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'บริการ',
      items: [
        { label: 'ภาพรวมบริการ', to: `${prefix}/services`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'งานซ่อม', to: `${prefix}/services/repairs`, cap: P1_CAP.POS_SALE },
        { label: 'ลูกค้า', to: `${prefix}/services/customers`, cap: P1_CAP.POS_SALE },
        { label: 'นัดหมาย', to: `${prefix}/services/appointments`, cap: P1_CAP.POS_SALE },
        { label: 'อะไหล่และวัสดุ', to: `${prefix}/services/parts`, cap: P1_CAP.MANAGE_PRODUCTS },
        { label: 'การเงินบริการ', to: `${prefix}/services/invoices`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายงานบริการ', to: `${prefix}/services/reports`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'ตั้งค่า', to: `${prefix}/services/settings`, cap: P1_CAP.MANAGE_PRODUCTS },
      ],
    },
  ];
};