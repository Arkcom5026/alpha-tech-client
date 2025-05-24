// 4. sidebarPurchaseItems.js
const sidebarPurchaseItems = [
  {
    label: 'การจัดซื้อ',
    items: [
      {
        label: 'หน้าหลักจัดซื้อ',
        to: '/pos/purchases/dashboard',
        exact: true,
        icon: 'layout-dashboard',
      },
      {
        label: 'ใบสั่งซื้อสินค้า',
        to: '/pos/purchases/orders',
        icon: 'file-text',
      },
      {
        label: 'Supplier',
        to: '/pos/purchases/suppliers',
        icon: 'truck',
      },
    ],
  },
];

export default sidebarPurchaseItems;

