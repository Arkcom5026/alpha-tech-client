// src/config/sidebarStockItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * 🔐 [RBAC FILTER ENGINE]
 * คัดกรองการมองเห็นเมนูตามระดับสิทธิ์ตำแหน่งพนักงานในสาขาพาร์ตเนอร์
 */
export const filterSidebarGroupsByCap = (groups, canFn) => {
  const can = typeof canFn === 'function' ? canFn : () => true;
  return (groups || [])
    .map((g) => ({
      ...g,
      items: (g.items || []).filter((item) => !item.cap || can(item.cap)),
    }))
    .filter((g) => (g.items || []).length > 0);
};

/**
 * 🟢 [DYNAMIC CORE CONFIG] 
 * สับรางพ่วงชื่อร้านค้าพาร์ตเนอร์ Dynamic Multi-Tenant และล้างเครื่องหมาย / ท้ายคำทิ้งถาวร
 */
export const getSidebarStockItems = (shopSlug) => {
  const prefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return [
    {
      label: 'สต๊อก',
      items: [
        { label: 'ภาพรวมสต๊อก', to: `${prefix}/stock`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายการสินค้า', to: `${prefix}/stock/products`, cap: P1_CAP.MANAGE_PRODUCTS },                   
        { label: 'หมวดสินค้า', to: `${prefix}/stock/categories`, cap: P1_CAP.MANAGE_PRODUCTS },
        { label: 'ประเภทสินค้า', to: `${prefix}/stock/types`, cap: P1_CAP.MANAGE_PRODUCTS },
        { label: 'แบรนด์', to: `${prefix}/stock/brands`, cap: P1_CAP.MANAGE_PRODUCTS },    
        { label: 'โปรไฟล์สินค้า', to: `${prefix}/stock/profiles`, cap: P1_CAP.MANAGE_PRODUCTS },      
        { label: 'เทมเพลตสินค้า', to: `${prefix}/stock/templates`, cap: P1_CAP.MANAGE_PRODUCTS },           
        { label: 'กำหนดราคา', to: `${prefix}/stock/branch-prices`, cap: P1_CAP.EDIT_PRICING },  
        { label: 'เช็คสต๊อก', to: `${prefix}/stock/stock-audit`, cap: P1_CAP.STOCK_AUDIT },
        { label: 'สินค้าพร้อมขาย', to: `${prefix}/stock/ready-to-sell`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'จัดการหน่วยนับ', to: `${prefix}/stock/units`, cap: P1_CAP.MANAGE_PRODUCTS },
      ],
    },
  ];
};