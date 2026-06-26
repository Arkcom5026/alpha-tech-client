// src/config/sidebarPurchaseOrderItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [CLEAN ENGINE] ฟังก์ชันดึงไอเทมเมนูฝั่งจัดซื้อ สะกดถูกต้องตามสากล 100%
 */
export const getSidebarPurchaseOrderItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'การจัดซื้อ',
      items: [
        { label: 'ภาพรวมจัดซื้อ', to: `${prefix}/purchases`, exact: true, cap: P1_CAP.VIEW_REPORTS },
        { label: 'ใบสั่งซื้อสินค้า', to: `${prefix}/purchases/orders`, exact: true, cap: P1_CAP.PURCHASING },
        { label: 'ตรวจรับสินค้า', to: `${prefix}/purchases/receipt`, exact: true, cap: P1_CAP.RECEIVE_STOCK },
        { label: 'พิมพ์ Barcode', to: `${prefix}/purchases/barcodes`, exact: true, cap: P1_CAP.RECEIVE_STOCK },
        { label: 'รับสินค้าเข้าสต๊อก', to: `${prefix}/purchases/receipt/items`, exact: true, cap: P1_CAP.RECEIVE_STOCK },
        { label: 'รับสินค้าด่วน', to: `${prefix}/purchases/receipt/quick-receive`, exact: true, cap: P1_CAP.RECEIVE_STOCK },
        { label: 'Supplier', to: `${prefix}/purchases/suppliers`, exact: true, cap: P1_CAP.PURCHASING },
      ],
    },
  ];
};