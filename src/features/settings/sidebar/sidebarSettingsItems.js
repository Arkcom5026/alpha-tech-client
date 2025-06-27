
// 1 sidebarSettingsItems.js

export const sidebarSettingsItems = [
    {
      label: 'ตั้งค่าระบบ',
      items: [
        { label: 'หนัาหลักพนักงาน', to: ''  },
        { label: 'รายชื่อพนักงาน', to: '/pos/settings/employee' },
        { label: 'อนุมัติพนักงานใหม่', to: '/pos/settings/employee/approve' },
        { label: 'จัดการตำแหน่งงาน', to: '/pos/settings/positions' },
        { label: 'กำหนดสิทธิ์', to: '/pos/settings/roles' },
        { label: 'จัดการสาขา', to: '/pos/settings/branches' },
        { label: "ตั้งค่าภาษี/ใบเสร็จ", path: "/pos/settings/tax" }
      ],
    },
  ];
  

  