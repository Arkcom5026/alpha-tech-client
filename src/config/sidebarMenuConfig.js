// src/config/sidebarMenuConfig.js

import { getSidebarPurchaseOrderItems } from './sidebarPurchaseOrderItems';
import { getSidebarSalesItems } from './sidebarSalesItems';
import { getSidebarServicesItems } from './sidebarServicesItems';
import { getSidebarStockItems } from './sidebarStockItems';
import { getSidebarReportsItems } from './sidebarReportsItem';
import { getSidebarFinanceItems } from './sidebarFinanceItems';
import { getSidebarSettingsItems } from './sidebarSettingsItems';
import { getSidebarSuperadminItems } from './sidebarSuperadminItems';

export const getSidebarMenuConfig = (shopSlug) => {
  const superadminItems = getSidebarSuperadminItems(shopSlug);

  return {
    purchases: getSidebarPurchaseOrderItems(shopSlug),
    sales: getSidebarSalesItems(shopSlug),
    services: getSidebarServicesItems(shopSlug),
    stock: getSidebarStockItems(shopSlug),
    reports: getSidebarReportsItems(shopSlug),
    finance: getSidebarFinanceItems(shopSlug),
    settings: getSidebarSettingsItems(shopSlug),
    ...superadminItems,
    superadmin: superadminItems.superadminDashboard,
  };
};
