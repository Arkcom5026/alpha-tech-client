// src/routes/partner/salesRoutes.jsx
import React from 'react';

import SalesDashboardPage from '@/features/sales/history/pages/SalesDashboardPage';
import PrintBillListPage from '@/features/bill/pages/PrintBillListPage';
import PrintBillPageShortTax from '@/features/bill/pages/PrintBillPageShortTax';
import PrintBillPageFullTax from '@/features/bill/pages/PrintBillPageFullTax';
import ReturnSearchPage from '@/features/saleReturn/pages/ReturnSearchPage';
import CreateReturnPage from '@/features/saleReturn/pages/CreateReturnPage';
import CreateSalePage from '@/features/sales/create/pages/CreateSalePage';
import PrintDeliveryNotePage from '@/features/deliveryNote/pages/PrintDeliveryNotePage';
import CombinedBillingPage from '@/features/combinedBilling/pages/CombinedBillingPage';
import DeliveryNoteListPage from '@/features/deliveryNote/pages/DeliveryNoteListPage';
import ListOrderOnlinePosPage from '@/features/orderOnlinePos/pages/ListOrderOnlinePosPage';
import OrderOnlinePosDetailPage from '@/features/orderOnlinePos/pages/OrderOnlinePosDetailPage';
import OnlineConvertOrderPage from '@/features/orderOnlinePos/pages/OnlineConvertOrderPage';

const salesRoutes = {
  path: 'sales',
  children: [
    { index: true, element: <SalesDashboardPage /> },
    { path: 'dashboard', element: <SalesDashboardPage /> },
    { path: 'sale', element: <CreateSalePage /> },
    { path: 'bill', element: <PrintBillListPage /> },

    // 📌 ดึงกลับเข้าล็อกเมนูย่อยงานขาย เพื่อให้ปุ่มเมนูรอบข้างไม่หายไปไหน
    { path: 'bill/print-short/:saleId', element: <PrintBillPageShortTax /> },
    { path: 'bill/print-full/:saleId', element: <PrintBillPageFullTax /> },
    { path: 'print-short/:saleId', element: <PrintBillPageShortTax /> },
    { path: 'print-full/:saleId', element: <PrintBillPageFullTax /> },

    {
      path: 'delivery-note',
      children: [
        { index: true, element: <DeliveryNoteListPage /> },
        { path: 'print/:saleId', element: <PrintDeliveryNotePage /> }
      ]
    },
    { path: 'combined-billing', element: <CombinedBillingPage /> },
    { path: 'sale-return', element: <ReturnSearchPage /> },
    { path: 'sale-return/create/:saleId', element: <CreateReturnPage /> },
    { path: 'order-online', element: <ListOrderOnlinePosPage /> },
    { path: 'order-online/convert/:id', element: <OnlineConvertOrderPage /> },
    { path: 'order-online/:id', element: <OrderOnlinePosDetailPage /> }
  ]
};

export default salesRoutes;
