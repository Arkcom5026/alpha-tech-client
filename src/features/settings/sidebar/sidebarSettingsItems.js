// 1 sidebarSettingsItems.js
// ✅ เปลี่ยน "หน้าหลักพนักงาน" → "หน้าหลักการตั้งค่า" และชี้ไปหน้า Dashboard หลักของ Settings
export const sidebarSettingsItems = [
  {
    label: 'ตั้งค่าระบบ',
    items: [
      { label: 'หน้าหลักการตั้งค่า', to: '/pos/settings' }, // ⬅️ Dashboard หลัก
      { label: 'รายชื่อพนักงาน', to: '/pos/settings/employee' },
      { label: 'อนุมัติพนักงาน', to: '/pos/settings/approve' },
      { label: 'ตำแหน่งงาน', to: '/pos/settings/positions' },
      { label: 'สาขา', to: '/pos/settings/branches' },
      { label: 'ธนาคาร', to: '/pos/settings/bank' },
    ],
  },
];