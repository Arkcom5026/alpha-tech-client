// 📂 src/routes/pos/purchasesRoutes.jsx

import { Navigate } from 'react-router-dom';




import SupplierListPage from '@/features/supplier/pages/ListSupplierPage';
import PurchaseOrderListPage from '@/features/purchaseOrder/pages/PurchaseOrderListPage';
import PurchaseDashboardPage from '@/features/purchaseOrder/pages/PurchaseDashboardPage';
import CreatePurchaseOrderPage from '@/features/purchaseOrder/pages/CreatePurchaseOrderPage';
import EditPurchaseOrderPage from '@/features/purchaseOrder/pages/EditPurchaseOrderPage ';
import PurchaseOrderDetailPage from '@/features/purchaseOrder/pages/PurchaseOrderDetailPage';
import PrintPurchaseOrderPage from '@/features/purchaseOrder/pages/PrintPurchaseOrderPage';
import ListPurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/ListPurchaseOrderReceiptPage';
import CreatePurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/CreatePurchaseOrderReceiptPage';
import EditPurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/EditPurchaseOrderReceiptPage';
import ViewPurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/ViewPurchaseOrderReceiptPage';
import PrintPurchaseOrderReceiptTemplate from '@/features/purchaseOrderReceipt/pages/PrintPurchaseOrderReceiptTemplate';
import ListPrintReceiptsPage from '@/features/stockItem/pages/ListPrintReceiptsPage';
import BarcodeReceiptListPage from '@/features/stockItem/pages/BarcodeReceiptListPage';
import PreviewBarcodePage from '@/features/stockItem/pages/PreviewBarcodePage';
import PreviewBarcodeMultiPage from '@/features/stockItem/pages/PreviewBarcodeMultiPage';


const purchasesRoutes = {
  path: '/pos/purchases',
  children: [
    {
      index: true,
      element: <PurchaseDashboardPage />,
    },

    {
      path: 'orders',
      children: [
        { index: true, element: <PurchaseOrderListPage />, },
        { path: 'create', element: <CreatePurchaseOrderPage />, },
        { path: 'edit/:id', element: <EditPurchaseOrderPage />, },
        { path: 'view/:id', element: <PurchaseOrderDetailPage /> },
        { path: 'print/:id', element: <PrintPurchaseOrderPage /> }

      ]
    },
    {
      path: 'receipt',
      children: [
        { index: true, element: <ListPurchaseOrderReceiptPage />, },

        { path: 'create/:poId', element: <CreatePurchaseOrderReceiptPage />, },
        { path: 'edit/:id', element: <EditPurchaseOrderReceiptPage />, },
        { path: 'view/:id', element: <ViewPurchaseOrderReceiptPage /> },
        { path: 'print/:id', element: <PrintPurchaseOrderReceiptTemplate /> },

       
      ]
    },


    {
      path: 'barcodes',
      children: [
        { index: true, element: <BarcodeReceiptListPage /> }, // รายการใบรับ
        { path: 'items/:receiptId', element: <ListPrintReceiptsPage /> }, // รายการสินค้าแต่ละใบ        
        { path: 'preview-barcode/:receiptId', element: <PreviewBarcodePage /> }, // หน้าพรีวิวก่อนพิมพ์
        { path: 'print', element: <PreviewBarcodeMultiPage /> }, // หน้าพรีวิวก่อนพิมพ์
        
      ]
    }, 


    {
      path: 'suppliers',
      element: <SupplierListPage />,
    },

  ],
};

export default purchasesRoutes;
//  /pos/purchases/orders/create

