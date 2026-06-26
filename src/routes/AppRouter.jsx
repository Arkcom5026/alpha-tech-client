// src/routes/AppRouter.jsx
// 🏢 Master Multi-Tenant Router (Clean & Professional Partner-Portal Routing)
import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { posPartnerRoutes } from './partner/posPartnerRoutes';
import { onlinePartnerRoutes } from './partner/onlinePartnerRoutes';

import MarketplacePortalPage from '@/features/online/pages/MarketplacePortalPage';
import PartnerWelcomePage from '@/features/auth/pages/PartnerWelcomePage';

import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

import HeaderPos from '@/features/pos/components/header/HeaderPos';
import SidebarLoader from '@/features/pos/components/sidebar/SidebarLoader';

/**
 * 🏛️ [THE PREMIUM UNIFIED LAYOUT CONTAINER]
 * เมนูด้านบนและด้านซ้ายอยู่ครบ ทำงานต่อเนื่องได้ 100%
 */
const PartnerPosMasterLayout = () => {
  const { shopSlug } = useParams();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* 🟢 แผงควบคุมเมนูด้านซ้าย (อยู่ประจำการตลอดเวลา) */}
      <SidebarLoader shopSlug={shopSlug} />
      
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* 🟢 แผงควบคุมเมนูด้านบน (อยู่ประจำการตลอดเวลา) */}
        <HeaderPos shopSlug={shopSlug} />
        
        <main className="flex-1 overflow-y-auto p-0 animate-fadeIn">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

/**
 * 🎛️ [CORE ROUTER CONFIGURATION]
 */
const AppRouter = [
  {
    path: '',
    element: <MarketplacePortalPage />,
  },
  {
    path: 'partner-portal',
    element: <PartnerWelcomePage />,
  },
  {
    path: 'partner-portal/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: 'partner-portal/reset-password',
    element: <ResetPasswordPage />,
  },

  // 🏛️ กลับมาใช้โครงสร้างปกติ เมนูไม่หายแน่นอนทำงานต่อได้ทันที
  {
    path: ':shopSlug/pos',
    element: <PartnerPosMasterLayout />,
    children: [
      ...posPartnerRoutes
    ],
  },
  {
    path: ':shopSlug/shop',
    children: onlinePartnerRoutes,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default AppRouter;