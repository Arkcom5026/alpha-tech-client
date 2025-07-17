// 6. sidebarSalesItems.js
export const sidebarSalesItems = [
  {
    label: 'การขาย',
    items: [
      { label: 'หน้าหลักการขาย', to: '/pos/sales'  },
      { label: 'ขายสินค้า', to: '/pos/sales/sale', },      
      { label: 'พิมพ์ใบเสร็จ', to: '/pos/sales/bill', },
      { label: 'พิมพ์ใบส่งสินค้า', to: '/pos/sales/delivery-note', },
      { label: 'ออกบิลใบส่งของ', to: '/pos/sales/combined-billing', },
      { label: 'คืนสินค้า', to: '/pos/sales/sale-return/', },

    ],
  },
];


