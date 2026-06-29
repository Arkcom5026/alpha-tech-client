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
        // 📦 กลุ่มที่ 1: การจัดการสินค้าและคลังสินค้าหลัก
        { label: 'ภาพรวมสต๊อก', to: `${prefix}/stock`, cap: P1_CAP.VIEW_REPORTS },
        { label: 'รายการสินค้า', to: `${prefix}/stock/products`, cap: P1_CAP.MANAGE_PRODUCTS },                   
        { label: 'เช็คสต๊อก', to: `${prefix}/stock/stock-audit`, cap: P1_CAP.STOCK_AUDIT },
        { label: 'สินค้าพร้อมขาย', to: `${prefix}/stock/ready-to-sell`, cap: P1_CAP.VIEW_REPORTS },
        
        // 🟢 FIXED PORT: เพิ่มปุ่มกดนำเข้าสินค้าด่วน ล็อกสิทธิ์เฉพาะผู้มีอำนาจตรวจนับและคัดกรองคลัง (STOCK_AUDIT)
        { label: 'นำเข้าสินค้าด่วน', to: `${prefix}/stock/quick-input`, cap: P1_CAP.STOCK_AUDIT },
        
        // 🏷️ กลุ่มที่ 2: โครงสร้างสินค้าภายในร้าน (หมวดสินค้ากลางถูกถอดออกจากระดับร้านค้าแล้ว 🟢)
        { label: 'ประเภทสินค้า', to: `${prefix}/stock/types`, cap: P1_CAP.MANAGE_PRODUCTS },
        { label: 'แบรนด์', to: `${prefix}/stock/brands`, cap: P1_CAP.MANAGE_PRODUCTS },    
        { label: 'จัดการหน่วยนับ', to: `${prefix}/stock/units`, cap: P1_CAP.MANAGE_PRODUCTS },

        // 💰 กลุ่มที่ 3: การตั้งราคาและคุณสมบัติทางการเงิน
        { label: 'กำหนดราคา', to: `${prefix}/stock/branch-prices`, cap: P1_CAP.EDIT_PRICING },  
      ],
    },
  ];
};