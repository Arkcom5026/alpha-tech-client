export const sidebarPurchaseOrdertems = [
  {
    label: 'การจัดซื้อ',
    items: [
      { label: 'ภาพรวมสต๊อก', to: '/pos/purchases',  },
      { label: 'ใบสั่งซื้อสินค้า', to: '/pos/purchases/orders', exact: true },
      { label: 'ตรวจรับสินค้า', to: '/pos/purchases/receipt', exact: true },
      { label: 'พิมพ์ Barcode', to: '/pos/purchases/barcodes', exact: true },
      { label: 'รับสินค้าเข้าสต๊อก', to: '/pos/purchases/receipt/items', exact: true },
      { label: 'รับสินค้าด่วน', to: '/pos/purchases/receipt/quick-receive', exact: true },
      { label: 'Supplier', to: '/pos/purchases/suppliers', exact: true },
    ],
  },
];
