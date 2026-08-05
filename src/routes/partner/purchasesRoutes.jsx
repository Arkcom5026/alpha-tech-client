// src/routes/partner/purchasesRoutes.jsx

import React from 'react';

import PurchaseDashboardPage from '../../features/purchaseOrder/dashboard/pages/PurchaseDashboardPage';
import PurchaseOrderListPage from '../../features/purchaseOrder/list/pages/PurchaseOrderListPage';
import CreatePurchaseOrderPage from '../../features/purchaseOrder/create/pages/CreatePurchaseOrderPage';
import EditPurchaseOrderPage from '../../features/purchaseOrder/edit/pages/EditPurchaseOrderPage';
import PurchaseOrderDetailPage from '../../features/purchaseOrder/detail/pages/PurchaseOrderDetailPage';
import PrintPurchaseOrderPage from '../../features/purchaseOrder/print/pages/PrintPurchaseOrderPage';

import CreateSupplierPage from '@/features/supplier/pages/CreateSupplierPage';
import EditSupplierPage from '@/features/supplier/pages/EditSupplierPage';
import ListSupplierPage from '@/features/supplier/pages/ListSupplierPage';
import ViewSupplierPage from '@/features/supplier/pages/ViewSupplierPage';

import ListPurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/ListPurchaseOrderReceiptPage';
import CreatePurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/CreatePurchaseOrderReceiptPage';
import BarcodeReceiptListPage from '@/features/barcode/pages/BarcodeReceiptListPage';
import BarcodePreviewWorkspacePage from '@/features/barcode/pages/BarcodePreviewWorkspacePage';
import PrintBarcodeBatchPage from '@/features/barcode/pages/PrintBarcodeBatchPage';
import BarcodeRangePrintPage from '@/features/barcode/pages/BarcodeRangePrintPage';

import ListReceiptItemsToScanPage from '@/features/stockItem/pages/ListReceiptItemsToScanPage';
import ScanBarcodeListPage from '@/features/stockItem/pages/ScanBarcodeListPage';
import QuickStockPage from '@/features/receiving/quick-stock/pages/QuickStockPage';

const purchasesRoutes = {
  path: 'purchases',
  children: [
    {
      index: true,
      element: <PurchaseDashboardPage />,
    },
    {
      path: 'orders',
      children: [
        { index: true, element: <PurchaseOrderListPage /> },
        { path: 'create', element: <CreatePurchaseOrderPage /> },
        { path: 'edit/:id', element: <EditPurchaseOrderPage /> },
        { path: 'view/:id', element: <PurchaseOrderDetailPage /> },
        { path: 'print/:id', element: <PrintPurchaseOrderPage /> },
      ],
    },
    {
      path: 'receipt',
      children: [
        { index: true, element: <ListPurchaseOrderReceiptPage /> },
        { path: 'create/:id', element: <CreatePurchaseOrderReceiptPage /> },
        { path: 'view/:id', element: <ListPurchaseOrderReceiptPage /> },
        { path: 'print/:id', element: <ListPurchaseOrderReceiptPage /> },
        { path: 'items', element: <ListReceiptItemsToScanPage /> },
        { path: 'items/scan/:receiptId', element: <ScanBarcodeListPage /> },
        { path: 'quick-receive', element: <QuickStockPage /> },
      ],
    },
    {
      path: 'barcodes',
      children: [
        { index: true, element: <BarcodeReceiptListPage /> },
        { path: 'preview/:receiptId', element: <BarcodePreviewWorkspacePage /> },
        { path: 'print', element: <PrintBarcodeBatchPage /> },
        { path: 'range-print', element: <BarcodeRangePrintPage /> },
      ],
    },
    {
      path: 'suppliers',
      children: [
        { index: true, element: <ListSupplierPage /> },
        { path: 'create', element: <CreateSupplierPage /> },
        { path: 'edit/:id', element: <EditSupplierPage /> },
        { path: 'view/:id', element: <ViewSupplierPage /> },
      ],
    },
  ],
};

export default purchasesRoutes;
