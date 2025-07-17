import SalesDashboardPage from "@/features/pos/pages/sales/SalesDashboardPage";
import PrintBillListPage from "@/features/payment/pages/PrintBillListPage";
import PrintBillPageShortTax from "@/features/bill/pages/PrintBillPageShortTax";
import PrintBillPageFullTax from "@/features/bill/pages/PrintBillPageFullTax";


import ReturnSearchPage from "@/features/saleReturn/pages/ReturnSearchPage";
import CreateReturnPage from "@/features/saleReturn/pages/CreateReturnPage";
import SalePage from "@/features/sales/pages/SalePage";
import QuickSalePage from "@/features/sales/pages/QuickSalePage";
import PrintDeliveryNoteListPage from "@/features/payment/pages/PrintDeliveryNoteListPage";
import PrintDeliveryNotePage from "@/features/payment/pages/PrintDeliveryNotePage";
import CombinedBillingPage from "@/features/combinedBilling/pages/CombinedBillingPage";


// import ReturnListPage from "@/features/saleReturn/pages/ReturnListPage"; // ถ้ายังไม่สร้าง ให้ comment ไว้ก่อน

const salesRoutes = {
  path: '/pos/sales',
  children: [
    {
      index: true,
      element: <SalesDashboardPage />, // ✅ หน้า Dashboard ของ Sales

      
    },
    {
      path: 'sale',
      children: [
        { index: true, element: <SalePage /> },
        { path: 'layout', element: <QuickSalePage /> },
        
        
      ],
    },
    {
            
      path: 'sale-return',
      children: [
        { index: true, element: <ReturnSearchPage /> },        
        { path: 'create/:saleId', element: <CreateReturnPage /> },
        // { path: 'history', element: <ReturnListPage /> }, // หรือ comment ไว้หากยังไม่ได้สร้าง
      ],
    },
    {
      path: 'bill',
      children: [
        { index: true, element: <PrintBillListPage /> },
        { path: 'print-short/:saleId', element: <PrintBillPageShortTax /> },
        { path: 'print-full/:saleId', element: <PrintBillPageFullTax /> },        
        
      ],
    },
    
    {
      path: 'delivery-note',
      children: [
        { index: true, element: <PrintDeliveryNoteListPage /> },
        { path: 'print/:saleId', element: <PrintDeliveryNotePage /> },
        
      ],      
    },
    {
      path: 'combined-billing',
      children: [
        { index: true, element: <CombinedBillingPage /> },
       // { path: 'print/:saleId', element: <PrintDeliveryNotePage /> },
        
      ],      
    },


  ],
};

export default salesRoutes;
