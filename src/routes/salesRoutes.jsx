import SalesDashboardPage from "@/features/pos/pages/sales/SalesDashboardPage";
import PrintBillListPage from "@/features/payment/pages/PrintBillListPage";
import QuickSalePage from "@/features/sales/pages/QuickSalePage";
import PrintBillPageQuick from "@/features/bill/pages/PrintBillPageQuick";
import PrintBillPageShortTax from "@/features/bill/pages/PrintBillPageShortTax";
import PrintBillPageFullTax from "@/features/bill/pages/PrintBillPageFullTax";




const salesRoutes = {
  path: '/pos/sales',

  children: [
    {
      index: true,
      element: <SalesDashboardPage />, // ✅ หน้า Dashboard ของ Sales
    },
    {
      path: 'quick-sale',
      children: [
        { index: true, element: <QuickSalePage />, },
 
       ]  
    },
    {
      path: 'bill',
      children: [
        { index: true, element: <PrintBillListPage />, },        
        { path: 'print/:saleId', element: <PrintBillPageQuick />, },
        { path: 'print-short/:saleId', element: <PrintBillPageShortTax />, },
        { path: 'print-full/:saleId', element: <PrintBillPageFullTax />, },
 
       ]  
    },
  ]
};

export default salesRoutes;



