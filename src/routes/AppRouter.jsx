// src/routes/AppRouter.jsx
// 🏢 Master Multi-Tenant Router (Clean & Professional Partner-Portal Routing)
// 🔒 [SECURITY PATCH] ป้องกันเมนูตกรางเตะออกจากระบบ — ตรึง Session ให้อยู่ใน POS เสมอ ไม่ต้อง Login ใหม่
import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { posPartnerRoutes } from './partner/posPartnerRoutes';
import { onlinePartnerRoutes } from './partner/onlinePartnerRoutes';
import { superAdminRoutes } from './superadmin/superAdminRoutes';

import MarketplacePortalPage from '@/features/online/pages/MarketplacePortalPage';
import PartnerWelcomePage from '@/features/auth/pages/PartnerWelcomePage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

import HeaderPos from '@/features/pos/components/header/HeaderPos';
import SidebarLoader from '@/features/pos/components/sidebar/SidebarLoader';
import LayoutSuperAdmin from '@/features/pos/layouts/superadmin/LayoutSuperAdmin';

const PartnerPosMasterLayout = () => {
  const { shopSlug } = useParams();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <SidebarLoader shopSlug={shopSlug} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderPos shopSlug={shopSlug} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50 p-4 animate-fadeIn md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRouter = [
  {
    path: '/',
    element: <MarketplacePortalPage />,
  },
  {
    path: 'marketplace-portal',
    element: <Navigate to="/" replace />,
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
  {
    path: ':shopSlug/pos',
    element: <PartnerPosMasterLayout />,
    children: [...posPartnerRoutes],
  },
  {
    path: ':shopSlug/superadmin',
    element: <LayoutSuperAdmin />,
    children: superAdminRoutes,
  },
  {
    path: ':shopSlug/shop',
    children: onlinePartnerRoutes,
  },
  {
    path: '*',
    element: <Navigate to="/advancetech/pos/dashboard" replace />,
  },
];

export default AppRouter;
