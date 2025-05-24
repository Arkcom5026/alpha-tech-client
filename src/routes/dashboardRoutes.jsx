import ChartsPage from "@/features/pos/pages/ChartsPage";
import DailyReportPage from "@/features/pos/pages/DailyReportPage";
import DashboardPage from "@/features/pos/pages/DashboardPage";
import MonthlyReportPage from "@/features/pos/pages/MonthlyReportPage";
import SalesSummaryPage from "@/features/pos/pages/SalesSummaryPage";

const dashboardRoutes = {
  path: '/pos/dashboard',
  children: [
    {
      index: true,
      element: <DashboardPage />,
    },
    {
      path: 'sales-summary',
      element: <SalesSummaryPage />,
    },
    {
      path: 'charts',
      element: <ChartsPage />,
    },
    {
      path: 'daily-report',
      element: <DailyReportPage />,
    },
    {
      path: 'monthly-report',
      element: <MonthlyReportPage />,
    },
  ],
};

export default dashboardRoutes;
