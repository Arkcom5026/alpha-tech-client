// ✅ Canvas: ProductProfile:RoutesAndSidebar

// rawRoutes.jsx (ปรับให้ lean และ maintain ง่าย)
// src/routes/
import onlineRoutes from './onlineRoutes';

import posRoutes from './posRoutes';
import NotFound from '@/pages/NotFound';
import NoLayout from '@/layouts/NoLayout';
import publicRoutes from './publicRoutes';


// ✅ rawRoutes.jsx — รวมเส้นทางทั้งหมดของระบบ
// ✅ Public, Online, POS, Admin
const rawRoutes = [
    // ✅ หน้าสาธารณะ
  {
    path: '/',
    element: <NoLayout />, // ✅ ไม่มี Header/Nav/Footer    
  },

  publicRoutes,
  onlineRoutes,
  posRoutes,
  

  {
    path: '*',
    element: <NotFound />,
  }
];

export default rawRoutes;