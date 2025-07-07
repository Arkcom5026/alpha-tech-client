
import CreateCustomerDepositPage from "@/features/customerDeposit/pages/CreateCustomerDepositPage";
import ListCustomerDepositPage from "@/features/customerDeposit/pages/ListCustomerDepositPage";
import FinanceDashboardPage from "@/features/pos/pages/finance/FinanceDashboardPage";
import CreateRefundPage from "@/features/refund/pages/CreateRefundPage";
import ListReturnsPage from "@/features/refund/pages/ListReturnsPage";
import PrintRefundReceiptPage from "@/features/refund/pages/PrintRefundReceiptPage";
import AdvancePaymentsSupplierPage from "@/features/supplierPayment/pages/AdvancePaymentsSupplierPage";
import { CreateSupplierPaymentPage } from "@/features/supplierPayment/pages/CreateSupplierPaymentPage";

import ListSuppliersPaymentPage from "@/features/supplierPayment/pages/ListSuppliersPaymentPage";
import RePaymentsSupplierPage from "@/features/supplierPayment/pages/RePaymentsSupplierPage";
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
      path: 'payments',
      children: [
        { path: 'receipt', element: <RePaymentsSupplierPage />, }, // ✅ เส้นทางใหม่: รายการชำระหนี้ PO        
        { path: 'advance', element: <AdvancePaymentsSupplierPage /> },
        { path: 'list', element: <ListSuppliersPaymentPage /> },
        { path: 'detail/:supplierId', element: <SupplierPaymentDetailPage /> },
        { path: 'supplier/:supplierId/create', element: <CreateSupplierPaymentPage /> },


      ]
    },
    {
      path: 'deposit',
      children: [
        { index: true, element: <ListCustomerDepositPage />, }, // ✅ เส้นทางใหม่: รับเงินมัดจำ
        { path: 'create', element: <CreateCustomerDepositPage /> },
        


      ]
    },

    // เพิ่ม children routes เพิ่มเติมได้ที่นี่
  ],
};

export default financeRoutes;
