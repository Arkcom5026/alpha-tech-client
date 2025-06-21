// ✅ src/routes/posRoutes.jsx
import { Navigate } from 'react-router-dom';

import LayoutPos from '@/layouts/pos/LayoutPos';
import LogoutPos from '@/features/pos/pages/LogoutPos';

import dashboardRoutes from './dashboardRoutes';
import purchasesRoutes from './purchasesRoutes';
import salesRoutes from './salesRoutes';
import stockRoutes from './stockRoutes';
import reportsRoutes from './reportsRoutes';
import servicesRoutes from './servicesRoutes';
import financeRoutes from './financeRoutes';
import settingsRoutes from './settingsRoutes';

const posRoutes = {
  path: '/pos',
  element: <LayoutPos />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    dashboardRoutes,
    purchasesRoutes,
    salesRoutes,
    stockRoutes,
    reportsRoutes,
    servicesRoutes,
    financeRoutes,
    settingsRoutes,

    {
      path: 'logout',
      element: <LogoutPos />,
    },
  ],
};

export default posRoutes;
