// src/config/sidebarSettingsItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * Canonical employee settings navigation.
 * Partner-created employees are active immediately and do not use an approval workflow.
 */
export const getSidebarSettingsItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'ตั้งค่าระบบ',
      items: [
        { label: 'หน้าหลักการตั้งค่า', to: `${prefix}/settings`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'เพิ่มพนักงานใหม่', to: `${prefix}/settings/staff`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'จัดการพนักงาน', to: `${prefix}/settings/employee`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'ตำแหน่งงาน', to: `${prefix}/settings/positions`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'จัดการร้าน/บริษัท', to: `${prefix}/settings/branches`, cap: P1_CAP.MANAGE_EMPLOYEES },
        { label: 'ธนาคาร', to: `${prefix}/settings/bank`, cap: P1_CAP.VIEW_REPORTS },
      ],
    },
  ];
};