// 6. sidebarSalesItems.js
const sidebarSalesItems = [
  {
    label: 'การขาย',
    items: [
      {
        label: 'หน้าหลักการขาย',
        to: '/pos/sales',
        exact: true,
        icon: 'layout-dashboard',
      },
      {
        label: 'ขายด่วน',
        to: '/pos/sales/quick-sale',
        icon: 'flash',
      },
      {
        label: 'ออเดอร์',
        to: '/pos/sales/orders',
        icon: 'list',
      },
    ],
  },
];

export default sidebarSalesItems;