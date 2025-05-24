// ✅ src/routes/stockRoutes.jsx
import StockDashboardPage from "@/features/pos/pages/stock/StockDashboardPage";
import ListProductPage from "@/features/product/pages/ListProductPage";
import CategoryPage from "@/features/category/pages/CategoryPage"; // ✅ เพิ่มหมวดหมู่สินค้า
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
        { index: true, element: <CategoryPage />, },
        // { path: 'create', element: < />, },
        // { path: 'edit/:id', element: < />, },
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
      path: 'units',
      children: [
        { index: true, element: <ListUnitPage />, },
        { path: 'create', element: <CreateUnitPage />, },
        { path: 'edit/:id', element: <EditUnitPage />, },

        
      ]
    },
  ],
};

export default stockRoutes;


