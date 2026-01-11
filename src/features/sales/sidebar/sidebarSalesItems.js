// 6. sidebarSalesItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

export const sidebarSalesItems = [
  {
    label: 'การขาย',
    items: [
      { label: 'หน้าหลักการขาย', to: '/pos/sales', cap: P1_CAP.POS_SALE },
      { label: 'ขายสินค้า', to: '/pos/sales/sale', cap: P1_CAP.POS_SALE },      
      { label: 'พิมพ์ใบเสร็จ', to: '/pos/sales/bill', cap: P1_CAP.POS_SALE },
      { label: 'พิมพ์ใบส่งสินค้า', to: '/pos/sales/delivery-note', cap: P1_CAP.POS_SALE },
      { label: 'ออกบิลใบส่งของ', to: '/pos/sales/combined-billing', cap: P1_CAP.POS_SALE },
      { label: 'คืนสินค้า', to: '/pos/sales/sale-return/', cap: P1_CAP.POS_SALE },
      { label: 'คำสั่งซื้อออนไลน์', to: '/pos/sales/order-online/', cap: P1_CAP.POS_SALE },

    ],
  },
];





