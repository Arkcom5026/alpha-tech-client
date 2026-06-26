// src/routes/partner/partnerRouter.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';

// นำเข้ากลุ่มเส้นทางพันธมิตรคู่ค้าที่แยกบริบทตามการใช้งาน
import { onlinePartnerRoutes } from './onlinePartnerRoutes';
import { posPartnerRoutes } from './posPartnerRoutes';

// Layout ควบคุมหน้ากาก E-Commerce ออนไลน์ (ลูกค้าภายนอกเข้าชมสินค้าของร้านพาร์ตเนอร์)
const PartnerOnlineLayout = () => {
  return (
    <div className="partner-online-marketplace-layout">
      {/* 💡 หน้ารวมนี้จะแกะค่า :shopSlug ผ่าน useParams() อัตโนมัติ เพื่อไปโหลดโลโก้และธีมสีของคู่ค้ารายนั้น */}
      <Outlet />
    </div>
  );
};

// Layout ควบคุมระบบหลังบ้าน POS (ดักตรวจสิทธิ์พนักงาน + เปิด-ปิดฟังก์ชันตามประเภทธุรกิจ เช่น ร้านไอที หรือวัสดุก่อสร้าง)
const PartnerPosLayout = () => {
  return (
    <div className="partner-internal-pos-layout">
      {/* 💡 ดักจับ Token พอร์ต 5000 ตรวจสอบค่า businessType เพื่อพ่นหน้าต่างทำงานให้ตรงล็อกประเภทธุรกิจ */}
      <Outlet />
    </div>
  );
};

const partnerRouter = createBrowserRouter([
  // ─────────────────────────────────────────────────────────────────
  // 🌐 ZONE A: PARTNER ONLINE MARKETPLACE (ฝั่งลูกค้าหน้าร้าน)
  // 🎯 พิกัด URL: https://saduaksabuy.com/:shopSlug
  // ─────────────────────────────────────────────────────────────────
  {
    path: '/:shopSlug',
    element: <PartnerOnlineLayout />,
    children: [
      ...onlinePartnerRoutes
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 🖥️ ZONE B: PARTNER INTERNAL POS SYSTEM (ฝั่งพนักงานหลังร้านบริหารคลัง)
  // 🎯 พิกัด URL: https://saduaksabuy.com/:shopSlug/pos
  // ─────────────────────────────────────────────────────────────────
  {
    path: '/:shopSlug/pos',
    element: <PartnerPosLayout />,
    children: [
      ...posPartnerRoutes
    ]
  },

  // มาตรการความปลอดภัยส่วนกลาง: หากพิมพ์ URL มั่ว พลัดหลง ให้ดีดกลับหน้าแรกหลักของแพลตฟอร์ม
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default function PartnerAppRouter() {
  return <RouterProvider router={partnerRouter} />;
}