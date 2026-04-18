

// ✅ src/routes/rawRoutes.jsx

import onlineRoutes from './onlineRoutes';
import posRoutes from './posRoutes';
import superAdminRoutes from './superAdminRoutes';
import NotFound from '@/pages/NotFound';
import publicRoutes from './publicRoutes';


// ✅ rawRoutes.jsx — รวมเส้นทางทั้งหมดของระบบ
// ✅ Public, Online, POS, SuperAdmin
const toRouteArray = (routes) => {
  if (!routes) return [];
  return Array.isArray(routes) ? routes : [routes];
};

const rawRoutes = [
  // ✅ หน้าสาธารณะ
  ...toRouteArray(publicRoutes),
  ...toRouteArray(onlineRoutes),
  ...toRouteArray(posRoutes),
  ...toRouteArray(superAdminRoutes),

  {
    path: '*',
    element: <NotFound />,
  },
];

export default rawRoutes;




