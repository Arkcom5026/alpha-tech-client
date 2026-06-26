// src/config/sidebarSalesItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🟢 [DYNAMIC FIXED & LINK ALIGNED] แปลงเป็นฟังก์ชันรับค่า shopSlug 
 * และเชื่อมท่อพาธให้ตรงตามโครงสร้างที่มีสแลชปิดท้ายของกัปตัน 100% ป้องกันอาการหลงมิติ
 */
export const getSidebarSalesItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'การขาย',
      items: [
        { label: 'หน้าหลักการขาย', to: `${prefix}/sales`, cap: P1_CAP.POS_SALE },
        { label: 'ขายสินค้า', to: `${prefix}/sales/sale`, cap: P1_CAP.POS_SALE },      
        { label: 'พิมพ์ใบเสร็จ', to: `${prefix}/sales/bill`, cap: P1_CAP.POS_SALE },
        { label: 'พิมพ์ใบส่งสินค้า', to: `${prefix}/sales/delivery-note`, cap: P1_CAP.POS_SALE },
        { label: 'ออกบิลใบส่งของ', to: `${prefix}/sales/combined-billing`, cap: P1_CAP.POS_SALE },
        
        // 📌 รักษาเครื่องหมาย / ปิดท้ายตามโครงสร้างเดิมของกัปตันเป๊ะๆ
        { label: 'คืนสินค้า', to: `${prefix}/sales/sale-return/`, cap: P1_CAP.POS_SALE },
        { label: 'คำสั่งซื้อออนไลน์', to: `${prefix}/sales/order-online/`, cap: P1_CAP.POS_SALE },
      ],
    },
  ];
};