import { P1_CAP } from '@/features/auth/rbac/rbacClient';

/**
 * RBAC-aware sidebar schema (Minimal Disruption)
 * - `cap` is optional. If omitted → always visible.
 * - Use `filterSidebarGroupsByCap()` in the sidebar renderer.
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

export const sidebarStockItems = [
  {
    label: 'สต๊อก',
    items: [
      { label: 'ภาพรวมสต๊อก', to: '/pos/stock', cap: P1_CAP.VIEW_REPORTS },
      
      { label: 'รายการสินค้า', to: '/pos/stock/products', cap: P1_CAP.MANAGE_PRODUCTS },                   
      { label: 'หมวดสินค้า', to: '/pos/stock/categories', cap: P1_CAP.MANAGE_PRODUCTS },
      { label: 'ประเภทสินค้า', to: '/pos/stock/types', cap: P1_CAP.MANAGE_PRODUCTS },
      { label: 'แบรนด์', to: '/pos/stock/profiles', cap: P1_CAP.MANAGE_PRODUCTS },    
      { label: 'สเปกสินค้า (SKU)', to: '/pos/stock/templates', cap: P1_CAP.MANAGE_PRODUCTS },           
      { label: 'กำหนดราคา', to: '/pos/stock/branch-prices', cap: P1_CAP.EDIT_PRICING },  
      { label: 'เช็คสต๊อก', to: '/pos/stock/stock-audit', cap: P1_CAP.STOCK_AUDIT },
      { label: 'จัดการหน่วยนับ', to: '/pos/stock/units', cap: P1_CAP.MANAGE_PRODUCTS },
      

      
    ],
  },
];







