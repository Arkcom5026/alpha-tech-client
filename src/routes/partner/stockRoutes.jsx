// src/routes/partner/stockRoutes.jsx
import React from 'react';

// 🟢 [LIVE API CORE IMPORTS] นำเข้าคอมโพเนนต์คลังสินค้าของจริงทั้งหมดจากห้องเครื่อง
import StockDashboardPage from '@/features/stock/pages/StockDashboardPage';
import ListProductPage from '@/features/product/pages/ListProductPage';
import CreateProductPage from '@/features/product/create/pages/CreateProductPage';
import EditProductPage from '@/features/product/pages/EditProductPage';

import ListCategoryPage from '@/features/category/pages/ListCategoryPage';
import CreateCategoryPage from '@/features/category/pages/CreateCategoryPage';
import EditCategoryPage from '@/features/category/pages/EditCategoryPage';

import ListProductTypePage from '@/features/productType/pages/ListProductTypePage';
import CreateProductTypePage from '@/features/productType/pages/CreateProductTypePage';
import EditProductTypePage from '@/features/productType/pages/EditProductTypePage';

import ListProductProfilePage from '@/features/productProfile/pages/ListProductProfilePage';
import CreateProductProfilePage from '@/features/productProfile/pages/CreateProductProfilePage';
import EditProductProfilePage from '@/features/productProfile/pages/EditProductProfilePage';

import ListBrandPage from '@/features/brand/pages/ListBrandPage';
import CreateBrandPage from '@/features/brand/pages/CreateBrandPage';
import EditBrandPage from '@/features/brand/pages/EditBrandPage';

import ListProductTemplatePage from '@/features/productTemplate/pages/ListProductTemplatePage';
import CreateProductTemplatePage from '@/features/productTemplate/pages/CreateProductTemplatePage';
import EditProductTemplatePage from '@/features/productTemplate/pages/EditProductTemplatePage';

import ListUnitPage from '@/features/unit/pages/ListUnitPage';
import CreateUnitPage from '@/features/unit/pages/CreateUnitPage';
import EditUnitPage from '@/features/unit/pages/EditUnitPage';

import ManageBranchPricePage from '@/features/branchPrice/pages/ManageBranchPricePage';
import ReadyToSellAuditPage from '@/features/stockAudit/pages/ReadyToSellAuditPage';
import ReadyToSellListPage from '@/features/product/pages/ReadyToSellListPage';
import ReadyToSellStructuredDetailsPage from '@/features/product/pages/ReadyToSellStructuredDetailsPage';

/**
 * 🎛️ [MASTER FLAT STOCK ROUTE]
 * ยุบโครงสร้างซ้ำซ้อนให้แบนราบ 100% ตรงตามแนวทางขบวน POS สากล
 * ป้องกันอาการดีดเด้งกลับหน้าแรก และรองรับพารามิเตอร์ ID ทุกหน้าสร้าง/แก้ไขระบบสต๊อก
 */
const stockRoutes = {
  path: 'stock',
  children: [
    // 📌 1. ภาพรวมคลังสินค้า (Dashboard)
    {
      index: true,
      element: <StockDashboardPage />,
    },

    // 📌 2. เมนู: รายการสินค้า (Products)
    {
      path: 'products',
      element: <ListProductPage />,
    },
    {
      path: 'products/create',
      element: <CreateProductPage />,
    },
    {
      path: 'products/edit/:id',
      element: <EditProductPage />,
    },

    // 📌 3. เมนู: หมวดสินค้า (Categories)
    {
      path: 'categories',
      element: <ListCategoryPage />,
    },
    {
      path: 'categories/create',
      element: <CreateCategoryPage />,
    },
    {
      path: 'categories/edit/:id',
      element: <EditCategoryPage />,
    },

    // 📌 4. เมนู: ประเภทสินค้า (Product Types)
    {
      path: 'types',
      element: <ListProductTypePage />,
    },
    {
      path: 'types/create',
      element: <CreateProductTypePage />,
    },
    {
      path: 'types/edit/:id',
      element: <EditProductTypePage />,
    },

    // 📌 5. เมนู: แบรนด์สินค้า (Brands)
    {
      path: 'brands',
      element: <ListBrandPage />,
    },
    {
      path: 'brands/create',
      element: <CreateBrandPage />,
    },
    {
      path: 'brands/edit/:id',
      element: <EditBrandPage />,
    },

    // 📌 6. เมนู: โปรไฟล์สินค้า (Product Profiles)
    {
      path: 'profiles',
      element: <ListProductProfilePage />,
    },
    {
      path: 'profiles/create',
      element: <CreateProductProfilePage />,
    },
    {
      path: 'profiles/edit/:id',
      element: <EditProductProfilePage />,
    },

    // 📌 7. เมนู: เทมเพลตสินค้า (Templates)
    {
      path: 'templates',
      element: <ListProductTemplatePage />,
    },
    {
      path: 'templates/create',
      element: <CreateProductTemplatePage />,
    },
    {
      path: 'templates/edit/:id',
      element: <EditProductTemplatePage />,
    },

    // 📌 8. เมนู: กำหนดราคาขาย (Branch Pricing)
    {
      path: 'branch-prices',
      element: <ManageBranchPricePage />,
    },

    // 📌 9. เมนู: เช็คสต๊อกสินค้า (Stock Audit)
    {
      path: 'stock-audit',
      element: <ReadyToSellAuditPage />,
    },

    // 📌 10. เมนู: สินค้าพร้อมขาย (Ready to Sell)
    {
      path: 'ready-to-sell',
      element: <ReadyToSellListPage />,
    },
    {
      path: 'ready-to-sell/structured/:productId',
      element: <ReadyToSellStructuredDetailsPage />,
    },

    // 📌 11. เมนู: จัดการหน่วยนับ (Units)
    {
      path: 'units',
      element: <ListUnitPage />,
    },
    {
      path: 'units/create',
      element: <CreateUnitPage />,
    },
    {
      path: 'units/edit/:id',
      element: <EditUnitPage />,
    },
  ],
};

export default stockRoutes;