

// src/routes/superAdminRoutes.jsx

import SuperAdminLayout from "@/features/superadmin/layouts/SuperAdminLayout";
import SuperAdminDashboardPage from "@/features/superadmin/pages/SuperAdminDashboardPage";
import SuperAdminCategoriesPage from "@/features/superadmin/pages/SuperAdminCategoriesPage";

// Placeholder (ใช้ชั่วคราวจนกว่าจะมีหน้าแยกจริง)
const PlaceholderPage = ({ title }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    <p className="mt-2 text-sm text-slate-500">อยู่ระหว่างพัฒนา</p>
  </div>
);

const superAdminRoutes = {
  // ✅ mount ผ่าน rawRoutes (router หลัก)
  path: "/superadmin",
  element: <SuperAdminLayout />,
  children: [
    {
      index: true,
      element: <SuperAdminDashboardPage />, // default = /superadmin
    },
    {
      path: "dashboard",
      element: <SuperAdminDashboardPage />,
    },

    // ===== Global Master Data =====
    {
      path: "categories",
      element: <SuperAdminCategoriesPage />,
    },
    {
      path: "product-types",
      element: <PlaceholderPage title="จัดการประเภทสินค้า (Global)" />,
    },
    {
      path: "brands",
      element: <PlaceholderPage title="จัดการแบรนด์ (Global)" />,
    },
    {
      path: "products",
      element: <PlaceholderPage title="จัดการสินค้า Global" />,
    },

    // ===== Governance =====
    {
      path: "branches",
      element: <PlaceholderPage title="จัดการสาขา" />,
    },

    // ===== System =====
    {
      path: "settings",
      element: <PlaceholderPage title="ตั้งค่าระบบ (Platform)" />,
    },
  ],
};

export default superAdminRoutes;

