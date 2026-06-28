// src/routes/AppRouter.jsx
// 🏢 Master Multi-Tenant Router (Clean & Professional Partner-Portal Routing)
// 🟢 [FIXED ROOT NAVIGATION] สับรางทางเข้าหลักให้วิ่งเข้าหน้า Portal กลางสีขาวเมื่อพิมพ์เว็บตัวเปล่าสำเร็จ 100%
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
 */
const PartnerPosMasterLayout = () => {
  const { shopSlug } = useParams();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <SidebarLoader shopSlug={shopSlug} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
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
  // 🟢 1. ดักจับทางเข้าแรกสุด (Root Path) เมื่อผู้ใช้เรียก http://localhost:5173/ ตัวเปล่า
  // บังคับให้เรนเดอร์หน้า Marketplace Portal สีขาวขึ้นมาฉายแสงทันที ไม่ดีดหนีไปหน้า POS อีกต่อไป
  {
    path: '/',
    element: <MarketplacePortalPage />,
  },
  
  // 🟢 2. ปรับตัวแปรพาธเดิมให้สลับรางวิ่งเข้าหา Root เพื่อป้องกันทราฟฟิกตกราง
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

  // 🏛️ 3. โครงสร้างเส้นทางหลักฝั่ง POS หน้าร้าน (ผูก Dynamic parameter รหัสร้านค้า)
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

  // 🛠️ 4. กรณีพิมพ์พาธมั่วหรือเกิดข้อผิดพลาดในการนำทาง ให้ดีดกลับมาตั้งหลักที่หน้าพอร์ทัลหลัก
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default AppRouter;