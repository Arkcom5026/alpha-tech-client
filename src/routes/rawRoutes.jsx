// ✅ Canvas: ProductProfile:RoutesAndSidebar

// rawRoutes.jsx (ปรับให้ lean และ maintain ง่าย)
// src/routes/
import onlineRoutes from './onlineRoutes';

import posRoutes from './posRoutes';
import NotFound from '@/pages/NotFound';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NoLayout from '@/layouts/NoLayout';
import ProtectRoute from '@/components/ProtectedRoute';
import publicRoutes from './publicRoutes';


// ✅ rawRoutes.jsx — รวมเส้นทางทั้งหมดของระบบ
// ✅ Public, Online, POS, Admin
const rawRoutes = [
    // ✅ หน้าสาธารณะ
  {
    path: '/',
    element: <NoLayout />, // ✅ ไม่มี Header/Nav/Footer
    
    children: [
      
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      
    ]
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