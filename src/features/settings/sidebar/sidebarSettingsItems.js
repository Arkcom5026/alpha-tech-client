// 1 sidebarSettingsItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

// ✅ เปลี่ยน "หน้าหลักพนักงาน" → "หน้าหลักการตั้งค่า" และชี้ไปหน้า Dashboard หลักของ Settings
export const sidebarSettingsItems = [
  {
    label: 'ตั้งค่าระบบ',
    items: [
      { label: 'หน้าหลักการตั้งค่า', to: '/pos/settings', cap: P1_CAP.MANAGE_EMPLOYEES }, // ⬅️ Dashboard หลัก
      { label: 'รายชื่อพนักงาน', to: '/pos/settings/employee', cap: P1_CAP.MANAGE_EMPLOYEES },
      { label: 'อนุมัติพนักงาน', to: '/pos/settings/approve', cap: P1_CAP.MANAGE_EMPLOYEES },
      { label: 'ตำแหน่งงาน', to: '/pos/settings/positions', cap: P1_CAP.MANAGE_EMPLOYEES },
      { label: 'จัดการสาขา', to: '/pos/settings/branches', cap: P1_CAP.MANAGE_EMPLOYEES },
      { label: 'ธนาคาร', to: '/pos/settings/bank', cap: P1_CAP.VIEW_REPORTS },
    ],
  },
];
