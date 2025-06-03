// 4. sidebarPurchaseOrdertems.js
export const sidebarPurchaseOrdertems = [
  {
    label: 'การจัดซื้อ',
    items: [
      { label: 'ภาพรวมสต๊อก', to: '/pos/purchases' },

      { label: 'ใบสั่งซื้อสินค้า', to: '/pos/purchases/orders', },
      { label: 'ตรวจรับสินค้า', to: '/pos/purchases/receipt', },
      { label: 'พิมพ์ Barcode', to: '/pos/purchases/barcodes', },
      { label: 'รับสินค้าเข้าสต๊อก', to: '/pos/purchases/receipt/items', },
      { label: 'Supplier', to: '/pos/purchases/suppliers', },
    ],
  },
];


