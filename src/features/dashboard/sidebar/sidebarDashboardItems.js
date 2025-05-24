// ✅ sidebarDashboardItems.js

export const sidebarDashboardItems = [
  {
    label: 'ภาพรวมระบบ',
    items: [
      { label: 'แดชบอร์ด', to: '/pos/dashboard' },
      { label: 'ยอดขายวันนี้', to: '/pos/dashboard/sales-summary' },
      { label: 'รายการที่ยังไม่ชำระ', to: '/pos/dashboard/pending-payments' },
      { label: 'ข้อมูลลูกค้า', to: '/pos/dashboard/customers' },
      { label: 'การแจ้งเตือน', to: '/pos/dashboard/notifications' },
    ],
  },
];
