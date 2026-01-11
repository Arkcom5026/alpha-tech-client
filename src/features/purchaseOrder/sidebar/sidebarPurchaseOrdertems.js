
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

export const sidebarPurchaseOrdertems = [
  {
    label: 'การจัดซื้อ',
    items: [
      { label: 'ภาพรวมสต๊อก', to: '/pos/purchases', cap: P1_CAP.VIEW_REPORTS },
      { label: 'ใบสั่งซื้อสินค้า', to: '/pos/purchases/orders', exact: true, cap: P1_CAP.PURCHASING },
      { label: 'ตรวจรับสินค้า', to: '/pos/purchases/receipt', exact: true, cap: P1_CAP.RECEIVE_STOCK },
      { label: 'พิมพ์ Barcode', to: '/pos/purchases/barcodes', exact: true, cap: P1_CAP.RECEIVE_STOCK },
      { label: 'รับสินค้าเข้าสต๊อก', to: '/pos/purchases/receipt/items', exact: true, cap: P1_CAP.RECEIVE_STOCK },
      { label: 'รับสินค้าด่วน', to: '/pos/purchases/receipt/quick-receive', exact: true, cap: P1_CAP.RECEIVE_STOCK },
      { label: 'Supplier', to: '/pos/purchases/suppliers', exact: true, cap: P1_CAP.PURCHASING },
    ],
  },
];



