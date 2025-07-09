
import ListPurchaseReportPage from '@/features/purchaseReport/pages/ListPurchaseReportPage';
import ReportsDashboardPage from '@/features/reports/pages/ReportsDashboardPage';

const reportsRoutes = {
  path: '/pos/reports',
  children: [
    { index: true, element: <ReportsDashboardPage /> },
    
    {
      path: 'purchase',
      children: [
        { index: true, element: <ListPurchaseReportPage /> },

      ],
    },

  ],
};

export default reportsRoutes;




