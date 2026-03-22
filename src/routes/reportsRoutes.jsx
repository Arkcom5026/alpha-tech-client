
// src/routes/reportsRoutes.jsx

import ListInputTaxReportPage from '@/features/inputTaxReport/pages/ListInputTaxReportPage';
import PrintInputTaxReportPage from '@/features/inputTaxReport/pages/PrintInputTaxReportPage';
import ListPurchaseReportPage from '@/features/purchaseReport/pages/ListPurchaseReportPage';
import PurchaseReceiptReportDetailPage from '@/features/purchaseReport/pages/PurchaseReceiptReportDetailPage';
import ReportsDashboardPage from '@/features/reports/pages/ReportsDashboardPage';
import SalesDashboardPage from '@/features/salesReport/pages/SalesDashboardPage';
import SalesDetailPage from '@/features/salesReport/pages/SalesDetailPage';
import SalesListPage from '@/features/salesReport/pages/SalesListPage';
import ProductPerformancePage from '@/features/salesReport/pages/ProductPerformancePage';
import ListSalesTaxReportPage from '@/features/salesTaxReport/pages/ListSalesTaxReportPage';
import PrintSalesTaxReportPage from '@/features/salesTaxReport/pages/PrintSalesTaxReportPage';

const reportsRoutes = {
  path: 'reports',
  children: [
    { index: true, element: <ReportsDashboardPage /> },

    { path: 'sales', element: <SalesDashboardPage /> },
    { path: 'sales/list', element: <SalesListPage /> },
    { path: 'sales/products', element: <ProductPerformancePage /> },
    { path: 'sales/:saleId', element: <SalesDetailPage /> },

    { path: 'purchase', element: <ListPurchaseReportPage /> },
    { path: 'purchase/receipts/:receiptId', element: <PurchaseReceiptReportDetailPage /> },
    { path: 'inputtax', element: <ListInputTaxReportPage /> },
    { path: 'salestax', element: <ListSalesTaxReportPage /> },

    { path: 'inputtax/print', element: <PrintInputTaxReportPage /> },
    { path: 'sales-tax/print', element: <PrintSalesTaxReportPage /> },
  ],
};

export default reportsRoutes;
