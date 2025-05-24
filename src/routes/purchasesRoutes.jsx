// 📂 src/routes/pos/purchasesRoutes.jsx

import { Navigate } from 'react-router-dom';




import SupplierListPage from '@/features/supplier/pages/ListSupplierPage';
import PurchasesDashboardPage from '@/features/pos/purchase/pages/PurchasesDashboardPage';

const purchasesRoutes = {
  path: '/pos/purchases',
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: <PurchasesDashboardPage />,
    },


    {
      path: 'suppliers',
      element: <SupplierListPage />,
    },
  ],
};

export default purchasesRoutes;
