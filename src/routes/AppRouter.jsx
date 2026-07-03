// src/routes/AppRouter.jsx
// 🏢 Master Multi-Tenant Router (Clean & Professional Partner-Portal Routing)
// 🔒 [SECURITY PATCH] ป้องกันเมนูตกรางเตะออกจากระบบ — ตรึง Session ให้อยู่ใน POS เสมอ ไม่ต้อง Login ใหม่
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

// 🟢 Mission C — Local Product Evolution / Catalog Governance
import CandidateReviewPage from '@/features/templateCandidate/pages/CandidateReviewPage';
import CandidateDetailPage from '@/features/templateCandidate/pages/CandidateDetailPage';

/**
 * 🏛️ [THE PREMIUM UNIFIED LAYOUT CONTAINER]
 */
const PartnerPosMasterLayout = () => {
  const { shopSlug } = useParams();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <SidebarLoader shopSlug={shopSlug} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <HeaderPos shopSlug={shopSlug} />
        {/* ล็อกมาตรฐานสัดส่วนความกว้างและ Padding ให้เท่ากันทุกโมดูล สวยงามสมมาตร */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 min-w-0 animate-fadeIn bg-slate-50">
          <div className="mx-auto w-full max-w-[1680px]"> 
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const missionCTemplateCandidateRoutes = {
  path: 'template-candidates',
  children: [
    { index: true, element: <CandidateReviewPage /> },
    { path: ':id', element: <CandidateDetailPage /> },
  ],
};

/**
 * 🎛️ [CORE ROUTER CONFIGURATION]
 */
const AppRouter = [
  // 🟢 1. ดักจับทางเข้าแรกสุด (Root Path) เมื่อเรียกเว็บตัวเปล่า จะเปิดหน้าพอร์ทัลกลางสีขาว
  {
    path: '/',
    element: <MarketplacePortalPage />,
  },
  
  // 🟢 2. โซนหน้า Portal อิสระ
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

  // 🏛️ 3. โครงสร้างเส้นทางหลักฝั่ง POS หน้าร้าน
  {
    path: ':shopSlug/pos',
    element: <PartnerPosMasterLayout />,
    children: [
      ...posPartnerRoutes,
      missionCTemplateCandidateRoutes,
    ],
  },
  {
    path: ':shopSlug/shop',
    children: onlinePartnerRoutes,
  },

  // 🚨 [FIXED CATCH-ALL SAFETY NET]: เมื่อเจอพาธมั่วหรือลิงก์เปล่า บังคับให้ดีดกลับมาตั้งหลักที่หน้าแดชบอร์ด POS ของร้านค้าหลักเสมอ
  // วิธีนี้จะช่วยเซฟสิทธิ์พนักงานให้อยู่ใน Session ถาวร ไม่หลุดออกไปหน้า Login ด้านนอกอีกต่อไป
  {
    path: '*',
    element: <Navigate to="/advancetech/pos/dashboard" replace />,
  },
];

export default AppRouter;