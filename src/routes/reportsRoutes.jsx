
import ListInputTaxReportPage from '@/features/inputTaxReport/pages/ListInputTaxReportPage';
import PrintInputTaxReportPage from '@/features/inputTaxReport/pages/PrintInputTaxReportPage';
import ListPurchaseReportPage from '@/features/purchaseReport/pages/ListPurchaseReportPage';
import ReportsDashboardPage from '@/features/reports/pages/ReportsDashboardPage';
import SalesTaxReportPage from '@/features/salesTaxReport/pages/SalesTaxReportPage';


const reportsRoutes = {
  path: '/pos/reports',
  children: [
    { index: true, element: <ReportsDashboardPage /> },
    { path: 'purchase', element: <ListPurchaseReportPage /> },
    { path: 'inputtax', element: <ListInputTaxReportPage /> },
    { path: 'salestax', element: <SalesTaxReportPage /> },
    { path: 'taxprint', element: <PrintInputTaxReportPage /> },
    

  ],
};

export default reportsRoutes;




