// src/config/sidebarSettingsItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [CLEANUP SUCCESS] ถอนเมนูโปรไฟล์พาร์ตเนอร์ออกเรียบร้อย เพื่อย้ายไปรวมศูนย์ผ่านหน้ารายการหลัก
 */
export const getSidebarSettingsItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'ตั้งค่าระบบ',
      items: [
        { label: 'หน้าหลักการตั้งค่า', to: `${prefix}/settings`, cap: P1_CAP.MANAGE_EMPLOYEES }, 
        { label: 'รายชื่อพนักงาน', to: `${prefix}/settings/employee`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'อนุมัติพนักงาน', to: `${prefix}/settings/approve`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'ตำแหน่งงาน', to: `${prefix}/settings/positions`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'จัดการร้าน/บริษัท', to: `${prefix}/settings/branches`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'ธนาคาร', to: `${prefix}/settings/bank`, cap: P1_CAP.VIEW_REPORTS },
      ],
    },
  ];
};