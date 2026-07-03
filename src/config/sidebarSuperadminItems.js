// src/config/sidebarSuperadminItems.js

const buildBasePath = (shopSlug) => (shopSlug ? `/${shopSlug}/superadmin` : '/superadmin');

export const getSidebarSuperadminItems = (shopSlug) => {
  const basePath = buildBasePath(shopSlug);

  return {
    superadminDashboard: [
      {
        label: 'Overview',
        items: [
          { label: 'Dashboard', to: basePath, end: true },
          { label: 'Catalog', to: `${basePath}/catalog` },
          { label: 'Governance', to: `${basePath}/governance` },
          { label: 'Analytics', to: `${basePath}/analytics` },
          { label: 'Settings', to: `${basePath}/settings` },
        ],
      },
    ],

    superadminCatalog: [
      {
        label: 'Template Catalog',
        items: [
          { label: 'Product Templates', to: `${basePath}/catalog/templates` },
          { label: 'Product Candidates', to: `${basePath}/catalog/candidates` },
        ],
      },
      {
        label: 'Catalog Master',
        items: [
          { label: 'Brands', to: `${basePath}/catalog/brands` },
          { label: 'Categories', to: `${basePath}/catalog/categories` },
          { label: 'Product Types', to: `${basePath}/catalog/product-types` },
          { label: 'Units', to: `${basePath}/catalog/units` },
        ],
      },
    ],

    superadminGovernance: [
      {
        label: 'Review',
        items: [
          { label: 'Review Queue', to: `${basePath}/governance/review-queue` },
          { label: 'Merge Queue', to: `${basePath}/governance/merge-queue` },
          { label: 'Promotion Queue', to: `${basePath}/governance/promotion-queue` },
          { label: 'Audit Log', to: `${basePath}/governance/audit-log` },
        ],
      },
    ],

    superadminAnalytics: [
      {
        label: 'Analytics',
        items: [
          { label: 'Candidate Statistics', to: `${basePath}/analytics/candidates` },
          { label: 'Catalog Growth', to: `${basePath}/analytics/catalog-growth` },
          { label: 'Branch Adoption', to: `${basePath}/analytics/branch-adoption` },
        ],
      },
    ],

    superadminSettings: [
      {
        label: 'Settings',
        items: [
          { label: 'General Settings', to: `${basePath}/settings` },
          { label: 'Permissions', to: `${basePath}/settings/permissions` },
          { label: 'System', to: `${basePath}/settings/system` },
          { label: 'API', to: `${basePath}/settings/api` },
        ],
      },
    ],
  };
};

export default getSidebarSuperadminItems;
