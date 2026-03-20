// ✅ src/routes/rawRoutes.jsx

import onlineRoutes from './onlineRoutes';
import posRoutes from './posRoutes';
import superAdminRoutes from './superAdminRoutes';
import NotFound from '@/pages/NotFound';
import NoLayout from '@/layouts/NoLayout';
import publicRoutes from './publicRoutes';

// ✅ rawRoutes.jsx — รวมเส้นทางทั้งหมดของระบบ
// ✅ Public, Online, POS, SuperAdmin
const rawRoutes = [
  // ✅ หน้าสาธารณะ
  {
    path: '/',
    element: <NoLayout />, // ✅ ไม่มี Header/Nav/Footer
  },

  publicRoutes,
  onlineRoutes,
  posRoutes,
  superAdminRoutes,

  {
    path: '*',
    element: <NotFound />,
  },
];

export default rawRoutes;
