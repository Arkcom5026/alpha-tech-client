// src/routes/AppRouter.jsx
// 🏢 Master Multi-Tenant Router (Clean & Professional Partner-Portal Routing)
// 🔒 [SECURITY PATCH] ป้องกันเมนูตกรางเตะออกจากระบบ — ตรึง Session ให้อยู่ใน POS เสมอ ไม่ต้อง Login ใหม่
import React from 'react';
import { Navigate } from 'react-router-dom';

import { posPartnerRoutes } from './partner/posPartnerRoutes';
import { onlinePartnerRoutes } from './partner/onlinePartnerRoutes';
import { superAdminRoutes } from './superadmin/superAdminRoutes';

import MarketplacePortalPage from '@/features/online/pages/MarketplacePortalPage';
import PartnerWelcomePage from '@/features/auth/pages/PartnerWelcomePage';
import PartnerStoreApplicationPage from '@/features/partnerStoreApplication/pages/PartnerStoreApplicationPage';
import PartnerStoreActivationPage from '@/features/partnerStoreApplication/pages/PartnerStoreActivationPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import MerchantLoginShell from '@/features/auth/layouts/MerchantLoginShell';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import SuperAdminAuthorityGuard from '@/features/auth/guards/SuperAdminAuthorityGuard';
import { useAuthStore } from '@/features/auth/store/authStore';
import CustomerRepairTrackingPage from '@/features/repair/customer-tracking/pages/CustomerRepairTrackingPage';
import PublicStorefrontPage from '@/features/storefront/pages/PublicStorefrontPage';
import PublicStorefrontProductPage from '@/features/storefront/pages/PublicStorefrontProductPage';
import PublicStorefrontCartPage from '@/features/storefront/pages/PublicStorefrontCartPage';
import PublicStorefrontIdentityPage from '@/features/storefront/pages/PublicStorefrontIdentityPage';
import NotFound from '@/pages/NotFound';

import PosAdaptiveShell from '@/features/pos/layouts/PosAdaptiveShell';
import LayoutSuperAdmin from '@/features/pos/layouts/superadmin/LayoutSuperAdmin';

const SuperAdminEntryRedirect = () => {
  const branchSlug = useAuthStore((state) => state.employee?.branchSlug);

  if (!branchSlug) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${branchSlug}/superadmin`} replace />;
};

const AppRouter = [
  { path: '/', element: <MarketplacePortalPage /> },
  { path: 'marketplace-portal', element: <Navigate to="/" replace /> },
  { path: 'repair/track/:token', element: <CustomerRepairTrackingPage /> },
  { path: 'partner-portal', element: <PartnerWelcomePage /> },
  { path: 'partner-portal/apply', element: <PartnerStoreApplicationPage /> },
  { path: 'partner-portal/activate', element: <PartnerStoreActivationPage /> },
  { path: 'partner-portal/forgot-password', element: <ForgotPasswordPage /> },
  { path: 'partner-portal/reset-password', element: <ResetPasswordPage /> },
  { path: 'superadmin/dashboard', element: <SuperAdminEntryRedirect /> },
  { path: ':shopSlug/pos/storefront', element: <Navigate to="../settings/storefront" relative="path" replace /> },
  { path: ':shopSlug/pos', element: <PosAdaptiveShell />, children: [...posPartnerRoutes] },
  {
    path: ':shopSlug/superadmin',
    element: <SuperAdminAuthorityGuard />,
    children: [{ element: <LayoutSuperAdmin />, children: superAdminRoutes }],
  },
  { path: ':shopSlug/shop', element: <Navigate to="../" relative="path" replace /> },
  { path: ':shopSlug/cart', element: <PublicStorefrontCartPage /> },
  { path: ':shopSlug/checkout/identity', element: <PublicStorefrontIdentityPage /> },
  { path: ':shopSlug/products/:productId', element: <PublicStorefrontProductPage /> },
  { path: ':shopSlug', element: <PublicStorefrontPage /> },
  { element: <MerchantLoginShell />, children: [{ path: 'login', element: <LoginPage /> }] },
  { path: '*', element: <NotFound /> },
];

export default AppRouter;
