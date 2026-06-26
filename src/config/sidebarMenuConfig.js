// src/config/sidebarMenuConfig.js

// 🟢 [MASTER CLEAN IMPORTS] นำเข้าไฟล์ย่อยที่สะกดถูกต้องตรงพิกัด 100% ไร้คราบคอมเมนต์แปลกปลอม
import { getSidebarPurchaseOrderItems } from './sidebarPurchaseOrderItems';
import { getSidebarSalesItems } from './sidebarSalesItems';
import { getSidebarServicesItems } from './sidebarServicesItems';
import { getSidebarStockItems } from './sidebarStockItems';
import { getSidebarReportsItems } from './sidebarReportsItem';
import { getSidebarFinanceItems } from './sidebarFinanceItems';
import { getSidebarSettingsItems } from './sidebarSettingsItems';

/**
 * 🏢 [MASTER SWITCHBOARD FUNCTION]
 * รวมสัญญาณและกระจายชุดเมนูข้างสีฟ้าให้เหมาะสมตาม Module ปัจจุบันแบบ Dynamic Multi-Tenant 100%
 */
export const getSidebarMenuConfig = (shopSlug) => {
  return {
    purchases: getSidebarPurchaseOrderItems(shopSlug),
    sales: getSidebarSalesItems(shopSlug),
    services: getSidebarServicesItems(shopSlug),
    stock: getSidebarStockItems(shopSlug),
    reports: getSidebarReportsItems(shopSlug),
    finance: getSidebarFinanceItems(shopSlug),
    settings: getSidebarSettingsItems(shopSlug),
  };
};