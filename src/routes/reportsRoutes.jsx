
import ListInputTaxReportPage from '@/features/inputTaxReport/pages/ListInputTaxReportPage';
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
    {
      path: 'inputtax',
      children: [
        { index: true, element: <ListInputTaxReportPage /> },

      ],
    },

  ],
};

export default reportsRoutes;




