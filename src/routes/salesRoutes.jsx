import QuickSalePage from "@/features/pos/pages/sales/QuickSalePage";
import SalesDashboardPage from "@/features/pos/pages/sales/SalesDashboardPage";

const salesRoutes = {
  path: '/pos/sales',

  children: [
    {
      index: true,
      element: <SalesDashboardPage />, // ✅ หน้า Dashboard ของ Sales
    },
    {
      path: 'quick-sale',
      element: <QuickSalePage />,
    }
    // เพิ่ม children routes เพิ่มเติมได้ที่นี่
  ],
};

export default salesRoutes;
