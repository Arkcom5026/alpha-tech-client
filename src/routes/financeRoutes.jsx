
import CreateCustomerDepositPage from "@/features/customerDeposit/pages/CreateCustomerDepositPage";
import ListCustomerDepositPage from "@/features/customerDeposit/pages/ListCustomerDepositPage";
import FinanceDashboardPage from "@/features/pos/pages/finance/FinanceDashboardPage";
import CreateRefundPage from "@/features/refund/pages/CreateRefundPage";
import ListReturnsPage from "@/features/refund/pages/ListReturnsPage";
import PrintRefundReceiptPage from "@/features/refund/pages/PrintRefundReceiptPage";

import ListAdvancePaymentsSupplierPage from "@/features/supplierPayment/pages/ListAdvancePaymentsSupplierPage";
import ListReceiptPaymentsSupplierPage from "@/features/supplierPayment/pages/ListReceiptPaymentsSupplierPage";

import { CreateAdvanceSupplierPaymentPage } from "@/features/supplierPayment/pages/CreateAdvanceSupplierPaymentPage";
import { CreateReceiptSupplierPaymentPage } from "@/features/supplierPayment/pages/CreateReceiptSupplierPaymentPage";


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
        { path: 'advance', element: <ListAdvancePaymentsSupplierPage /> },     
        { path: 'receipt', element: <ListReceiptPaymentsSupplierPage />, },   
        { path: 'detail/:supplierId', element: <SupplierPaymentDetailPage /> },        
        { path: 'advance/supplier/:supplierId', element: <CreateAdvanceSupplierPaymentPage /> },
        { path: 'receipt/supplier/:supplierId', element: <CreateReceiptSupplierPaymentPage />, },


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
