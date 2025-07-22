import ListInputTaxReportPage from '@/features/inputTaxReport/pages/ListInputTaxReportPage';
import PrintInputTaxReportPage from '@/features/inputTaxReport/pages/PrintInputTaxReportPage';
import ListPurchaseReportPage from '@/features/purchaseReport/pages/ListPurchaseReportPage';
import ReportsDashboardPage from '@/features/reports/pages/ReportsDashboardPage';
import ListSalesTaxReportPage from '@/features/salesTaxReport/pages/ListSalesTaxReportPage';
import PrintSalesTaxReportPage from '@/features/salesTaxReport/pages/PrintSalesTaxReportPage';



const reportsRoutes = {
  path: '/pos/reports/',
  children: [
    { index: true, element: <ReportsDashboardPage /> },
    
    { path: 'purchase', element: <ListPurchaseReportPage /> },
    { path: 'inputtax', element: <ListInputTaxReportPage /> },
    { path: 'salestax', element: <ListSalesTaxReportPage /> },

    { path: 'inputtax/print', element: <PrintInputTaxReportPage /> },
    { path: 'sales-tax/print', element: <PrintSalesTaxReportPage /> },
  ],
};

export default reportsRoutes;