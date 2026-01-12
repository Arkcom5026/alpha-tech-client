


// ✅ src/routes/stockRoutes.jsx
import StockDashboardPage from "@/features/pos/pages/stock/StockDashboardPage";
import ListProductPage from "@/features/product/pages/ListProductPage";
import ListProductTemplatePage from '@/features/productTemplate/pages/ListProductTemplatePage';
import CreateProductTemplatePage from '@/features/productTemplate/pages/CreateProductTemplatePage';
import EditProductTemplatePage from '@/features/productTemplate/pages/EditProductTemplatePage';

import ListProductProfilePage from '@/features/productProfile/pages/ListProductProfilePage';
import CreateProductProfilePage from '@/features/productProfile/pages/CreateProductProfilePage';
import EditProductProfilePage from '@/features/productProfile/pages/EditProductProfilePage';
import ListProductTypePage from "@/features/productType/pages/ListProductTypePage";
import CreateProductTypePage from "@/features/productType/pages/CreateProductTypePage";
import EditProductTypePage from "@/features/productType/pages/EditProductTypePage";
import CreateProductPage from "@/features/product/pages/CreateProductPage";
import EditProductPage from "@/features/product/pages/EditProductPage";
import ListUnitPage from "@/features/unit/pages/ListUnitPage";
import CreateUnitPage from "@/features/unit/pages/CreateUnitPage";
import EditUnitPage from "@/features/unit/pages/EditUnitPage";
import ListCategoryPage from "@/features/category/pages/ListCategoryPage";
import CreateCategoryPage from "@/features/category/pages/CreateCategoryPage";
import EditCategoryPage from "@/features/category/pages/EditCategoryPage";
import ManageBranchPricePage from "@/features/branchPrice/pages/ManageBranchPricePage";
import ReadyToSellAuditPage from "@/features/stockAudit/pages/ReadyToSellAuditPage";

const stockRoutes = {
  path: '/pos/stock',
  children: [
    {
      index: true,
      element: <StockDashboardPage />,
    },

    {
      path: 'products',
      children: [
        { index: true, element: <ListProductPage />, },
        { path: 'create', element: <CreateProductPage />, },
        { path: 'edit/:id', element: <EditProductPage />, },
      ]
    },
    {
      path: 'categories',
      children: [
        { index: true, element: <ListCategoryPage />, },
        { path: 'create', element: <CreateCategoryPage />, },
        { path: 'edit/:id', element: <EditCategoryPage />, },
      ]
    },

    {
      path: 'types',
      children: [
        { index: true, element: <ListProductTypePage />, },
        { path: 'create', element: <CreateProductTypePage />, },
        { path: 'edit/:id', element: <EditProductTypePage />, },
      ]
    },
    {
      path: 'profiles',      
      children: [
        { index: true, element: <ListProductProfilePage /> },
        { path: 'create', element: <CreateProductProfilePage /> },
        { path: 'edit/:id', element: <EditProductProfilePage /> },
      ]
    },
    {
      path: 'templates',
      children: [
        { index: true, element: <ListProductTemplatePage />, },
        { path: 'create', element: <CreateProductTemplatePage />, },
        { path: 'edit/:id', element: <EditProductTemplatePage />, },
      ]
    },
    {
      path: 'branch-prices',
      children: [
        { index: true, element: <ManageBranchPricePage />, },
      ]
    },

    {
      path: 'units',
      children: [
        { index: true, element: <ListUnitPage />, },
        { path: 'create', element: <CreateUnitPage />, },
        { path: 'edit/:id', element: <EditUnitPage />, },
      ]
    },

    {
      path: 'stock-audit',
      children: [
        { index: true, element: <ReadyToSellAuditPage />, },
      ]
    },

  ],
};

export default stockRoutes;


