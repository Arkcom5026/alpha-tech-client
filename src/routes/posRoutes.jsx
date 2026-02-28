
// ✅ src/routes/posRoutes.jsx
import { Navigate } from 'react-router-dom'

// ✅ Bill / Receipt print pages
import PrintBillPageShortTax from '@/features/bill/pages/PrintBillPageShortTax.jsx'
import PrintBillPageFullTax from '@/features/bill/pages/PrintBillPageFullTax.jsx'

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
  // ✅ Important: ทำให้ route นี้ nest ใต้ /app ได้จริง (ไม่เป็น absolute path)
  // ถ้า parent เป็น /app → จะกลายเป็น /app/pos
  path: 'pos',
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

    // =============================
    // Bill / Receipt printing
    // =============================
    {
      path: 'sales/bill/print-short/:saleId',
      element: <PrintBillPageShortTax />,
    },
    {
      path: 'sales/bill/print-full/:saleId',
      element: <PrintBillPageFullTax />,
    },

    {
      path: 'logout',
      element: <LogoutPos />,
    },
  ],
};

export default posRoutes;



