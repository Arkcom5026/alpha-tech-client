


// ✅ src/routes/posRoutes.jsx
import { Navigate, useLocation } from 'react-router-dom'


// ✅ Bill / Receipt print pages
import PrintBillPageShortTax from '@/features/bill/pages/PrintBillPageShortTax.jsx'
import PrintBillPageFullTax from '@/features/bill/pages/PrintBillPageFullTax.jsx'

import LayoutPos from '@/layouts/pos/LayoutPos';

// ✅ Route guard (minimal-disruption): SUPERADMIN without branch context = GLOBAL-only mode
// - Prevent accessing branch-scoped routes by URL typing
// - Redirect to global-safe product management page
const PosGlobalGuard = ({ children }) => {
  const location = useLocation();
  const role = useAuthStore((s) => s.role);
  const employee = useAuthStore((s) => s.employee);

  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';
  const hasBranch = Boolean(employee?.branchId);

  // ✅ Allow SUPERADMIN to operate without branch, but only on global-safe pages
  if (isSuperAdmin && !hasBranch) {
    // NOTE: whitelist can be expanded later; start with the critical global entrypoint
    const allow = location.pathname.includes('/pos/stock/products');

    if (!allow) {
      return (
        <Navigate
          to="/pos/stock/products"
          replace
          state={{
            notice: 'SUPERADMIN (Global) ไม่สามารถเข้าหน้านี้ได้เพราะต้องใช้บริบทสาขา (branchId)',
          }}
        />
      );
    }
  }

  return children;
};
import LogoutPos from '@/features/pos/pages/LogoutPos';

import dashboardRoutes from './dashboardRoutes';
import purchasesRoutes from './purchasesRoutes';
import salesRoutes from './salesRoutes';
import customerRoutes from './customerRoutes';
import stockRoutes from './stockRoutes';
import reportsRoutes from './reportsRoutes';
import servicesRoutes from './servicesRoutes';
import financeRoutes from './financeRoutes';
import settingsRoutes from './settingsRoutes';
import { useAuthStore } from '@/features/auth/store/authStore';

const posRoutes = {
  // ✅ Important: ทำให้ route นี้ nest ใต้ /app ได้จริง (ไม่เป็น absolute path)
  // ถ้า parent เป็น /app → จะกลายเป็น /app/pos
  path: 'pos',
  element: (
    <PosGlobalGuard>
      <LayoutPos />
    </PosGlobalGuard>
  ),
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    dashboardRoutes,
    purchasesRoutes,
    salesRoutes,
    customerRoutes,
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







