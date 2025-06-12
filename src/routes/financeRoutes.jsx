
import FinanceDashboardPage from "@/features/pos/pages/finance/FinanceDashboardPage";
import CreateRefundPage from "@/features/refund/pages/CreateRefundPage";
import ListReturnsPage from "@/features/refund/pages/ListReturnsPage";
import PrintRefundReceiptPage from "@/features/refund/pages/PrintRefundReceiptPage";
import { CreateSupplierPaymentPage } from "@/features/supplierPayment/pages/CreateSupplierPaymentPage";

import ListSuppliersForPaymentPage from "@/features/supplierPayment/pages/ListSuppliersForPaymentPage";
import SupplierPaymentDetailPage from "@/features/supplierPayment/pages/SupplierPaymentDetailPage";

const financeRoutes = {
  path: '/pos/finance',
  children: [
    {
      index: true,
      element: <FinanceDashboardPage />, // ✅ หน้า Dashboard ของ Finance
      
    },
    {
      path: 'refunds',
      children: [
        { index: true, element: <ListReturnsPage /> },
        { path: 'create/:saleReturnId', element: <CreateRefundPage /> },
        { path: 'print/:saleReturnId', element: <PrintRefundReceiptPage /> },                
      ],
    },

        {
      path: 'po-payments',
      children: [
        { index: true,element: <ListSuppliersForPaymentPage />, }, // ✅ เส้นทางใหม่: รายการชำระหนี้ PO
        { path: 'supplier/:supplierId', element: <SupplierPaymentDetailPage /> },   
        { path: 'supplier/:supplierId/create-payment', element: <CreateSupplierPaymentPage /> },   
      

      ]
    },
    
    // เพิ่ม children routes เพิ่มเติมได้ที่นี่
  ],
};

export default financeRoutes;
