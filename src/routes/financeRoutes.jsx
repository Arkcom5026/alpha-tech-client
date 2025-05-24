import FinanceDashboardPage from "@/features/pos/pages/finance/FinanceDashboardPage";


const financeRoutes = {
  path: '/pos/finance',
    children: [
    {
      index: true,
      element: <FinanceDashboardPage />, // ✅ หน้า Dashboard ของ Finance
    },
    // เพิ่ม children routes เพิ่มเติมได้ที่นี่
  ],
};

export default financeRoutes;
