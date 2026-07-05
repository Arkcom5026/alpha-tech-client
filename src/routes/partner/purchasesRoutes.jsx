// src/routes/partner/purchasesRoutes.jsx
// 🏛️ Clean Architecture Routing: Unified Premium Integration (Safe Circular-Free Edition)

import React from 'react';

// 🟢 นำเข้ากลุ่มหน้าเพจโมดูลจัดซื้อด้วยระดับพาธสัมพัทธ์ที่เสถียร
import PurchaseDashboardPage from '../../features/purchaseOrder/pages/PurchaseDashboardPage';
import PurchaseOrderListPage from '../../features/purchaseOrder/pages/PurchaseOrderListPage';
import CreatePurchaseOrderPage from '../../features/purchaseOrder/pages/CreatePurchaseOrderPage';

// 🟢 นำเข้ากลุ่มหน้าเพจโมดูล Supplier ตัวจริง ปราบสลับเลน
import CreateSupplierPage from '@/features/supplier/pages/CreateSupplierPage';
import EditSupplierPage from '@/features/supplier/pages/EditSupplierPage';
import ListSupplierPage from '@/features/supplier/pages/ListSupplierPage';
import ViewSupplierPage from '@/features/supplier/pages/ViewSupplierPage';

// 🟢 นำเข้ากลุ่มหน้าเพจการตรวจรับสินค้า
import ListPurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/ListPurchaseOrderReceiptPage';
import CreatePurchaseOrderReceiptPage from '@/features/purchaseOrderReceipt/pages/CreatePurchaseOrderReceiptPage';
import BarcodeReceiptListPage from '@/features/barcode/pages/BarcodeReceiptListPage';
import PreviewBarcodePage from '@/features/barcode/pages/PreviewBarcodePage';
import PrintBarcodeBatchPage from '@/features/barcode/pages/PrintBarcodeBatchPage';
import BarcodeRangePrintPage from '@/features/barcode/pages/BarcodeRangePrintPage';

// 🟢 ปรับแต่งพาธให้ชี้ตรงดิ่งไปที่โฟลเดอร์ stockItem ตามพิกัดจริงในเครื่อง
import ListReceiptItemsToScanPage from '@/features/stockItem/pages/ListReceiptItemsToScanPage';
import ScanBarcodeListPage from '@/features/stockItem/pages/ScanBarcodeListPage';

// 🟢 FIXED PORT: อิมพอร์ตหน้าจอควิกสต๊อกตัวจริงเข้าสับรางแทนที่คอมโพเนนต์เก่าฝั่งจัดซื้อ
import QuickStockPage from '@/features/product/quick-stock/pages/QuickStockPage';

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
        { path: 'edit/:id', element: <PurchaseOrderListPage /> },
        { path: 'view/:id', element: <PurchaseOrderListPage /> },
        { path: 'print/:id', element: <PurchaseOrderListPage /> }
      ]
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
        
        // 🟢 FIXED INTERCEPTOR: สับรางเปลี่ยนจากหน้าตรวจรับ PO เดิม ให้เปิดหน้าจอควิกสต๊อกตัวจริงทันที!
        { path: 'quick-receive', element: <QuickStockPage /> }
      ]
    },
    {
      path: 'barcodes',
      children: [
        { index: true, element: <BarcodeReceiptListPage /> },
        { path: 'preview/:receiptId', element: <PreviewBarcodePage /> },
        { path: 'print', element: <PrintBarcodeBatchPage /> },
        { path: 'range-print', element: <BarcodeRangePrintPage /> }
      ]
    },
    {
      path: 'suppliers',
      children: [
        { index: true, element: <ListSupplierPage /> },
        { path: 'create', element: <CreateSupplierPage /> },
        { path: 'edit/:id', element: <EditSupplierPage /> },
        { path: 'view/:id', element: <ViewSupplierPage /> }
      ]
    }
  ]
};

export default purchasesRoutes;