
// ✅ src/routes/stockRoutes.jsx

import StockDashboardPage from '@/features/stock/pages/StockDashboardPage';
import ListProductPage from '@/features/product/pages/ListProductPage';
import CreateProductPage from '@/features/product/pages/CreateProductPage';
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

// ===== Brand =====
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

// 🔎 DEBUG: log when stockRoutes file is evaluated
// - ต้องอยู่นอก object/array ไม่งั้นจะเป็น syntax error
// - ถ้าไม่เห็น log นี้ แปลว่าไฟล์นี้ยังไม่ได้ถูก import/mount ใน posRoutes

  // eslint-disable-next-line no-console
  console.log('[ROUTER] stockRoutes loaded');


const stockRoutes = {
  // ✅ IMPORTANT: This route is mounted under `/pos` in posRoutes, so keep it RELATIVE.
  path: 'stock',
  children: [
    {
      index: true,
      element: <StockDashboardPage />,
    },

    {
      path: 'products',
      children: [
        { index: true, element: <ListProductPage /> },
        { path: 'create', element: <CreateProductPage /> },
        { path: 'edit/:id', element: <EditProductPage /> },
      ],
    },

    {
      path: 'categories',
      children: [
        { index: true, element: <ListCategoryPage /> },
        { path: 'create', element: <CreateCategoryPage /> },
        { path: 'edit/:id', element: <EditCategoryPage /> },
      ],
    },

    {
      path: 'types',
      children: [
        { index: true, element: <ListProductTypePage /> },
        { path: 'create', element: <CreateProductTypePage /> },
        { path: 'edit/:id', element: <EditProductTypePage /> },
      ],
    },

    {
      path: 'profiles',
      children: [
        { index: true, element: <ListProductProfilePage /> },
        { path: 'create', element: <CreateProductProfilePage /> },
        { path: 'edit/:id', element: <EditProductProfilePage /> },
      ],
    },

    {
      path: 'brands',
      children: [
        { index: true, element: <ListBrandPage /> },
        { path: 'create', element: <CreateBrandPage /> },
        // ✅ Standard route (aligned with other modules)
        { path: 'edit/:id', element: <EditBrandPage /> },
        // ✅ Backward-compat (ถ้ามีลิงก์เดิมใช้อยู่)
        { path: ':id/edit', element: <EditBrandPage /> },
      ],
    },

    {
      path: 'templates',
      children: [
        { index: true, element: <ListProductTemplatePage /> },
        { path: 'create', element: <CreateProductTemplatePage /> },
        { path: 'edit/:id', element: <EditProductTemplatePage /> },
      ],
    },

    {
      path: 'branch-prices',
      children: [{ index: true, element: <ManageBranchPricePage /> }],
    },

    {
      path: 'units',
      children: [
        { index: true, element: <ListUnitPage /> },
        { path: 'create', element: <CreateUnitPage /> },
        { path: 'edit/:id', element: <EditUnitPage /> },
      ],
    },

    {
      path: 'stock-audit',
      children: [{ index: true, element: <ReadyToSellAuditPage /> }],
    },

    // =============================
    // Ready-to-sell (สินค้าพร้อมขาย)
    // =============================
    // ✅ Leaf route (สำคัญ): ห้ามใส่ children แบบไม่มี element เพราะจะไม่ render Outlet
    {
      path: 'ready-to-sell',
      children: [
        { index: true, element: <ReadyToSellListPage /> },
        // ✅ STRUCTURED details page
        { path: 'structured/:productId', element: <ReadyToSellStructuredDetailsPage /> },
      ],
      //  element: <ReadyToSellListPage />,
    },
  ],
};

export default stockRoutes;

