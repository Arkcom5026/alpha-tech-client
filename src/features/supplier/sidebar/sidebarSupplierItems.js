// ✅ sidebarSupplierItems.js
import { P1_CAP } from '@/features/auth/rbac/rbacClient';

export const sidebarSupplierItems = [
  {
    label: 'Supplier',
    items: [
      { label: 'รายการ Supplier', to: '/pos/suppliers', cap: P1_CAP.PURCHASING },
      { label: 'เพิ่ม Supplier', to: '/pos/suppliers/create', cap: P1_CAP.PURCHASING },
    ],
  },
];


