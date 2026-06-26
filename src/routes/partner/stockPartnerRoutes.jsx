// src/routes/partner/stockPartnerRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

// 🟢 อัปเกรดเรียบร้อย: ดึงไฟล์รายการสินค้าจากฝั่งฟีเจอร์ออนไลน์ตรงพิกัดเป้าหมายของกัปตันครับ!
import ProductOnlineListPage from '@/features/online/productOnline/pages/ProductOnlineListPage';

// หน้ากากจำลองสแตนด์บายส่วนที่เหลือ (เพื่อความปลอดภัย ไม่ให้ Vite บ่นหาไฟล์ไม่เจอ)
const MockProductCreate = () => <div className="p-6">➕ หน้าฟอร์มเพิ่มสินค้าใหม่ (สแตนด์บายระบบ Advance Tech)</div>;
const MockProductEdit = () => <div className="p-6">📝 หน้าฟอร์มแก้ไขข้อมูลสินค้า (สแตนด์บายระบบ Advance Tech)</div>;
const MockStockAudit = () => <div className="p-6">📊 หน้าตรวจสอบคลังสินค้า/ตรวจนับสต็อก (สแตนด์บายระบบ Advance Tech)</div>;

export const stockPartnerRoutes = [
  {
    index: true, // วิ่งตกกระทบหน้าแรกสต็อก: /:shopSlug/pos/stock
    element: <Navigate to="products" replace />
  },
  {
    path: 'products', // 🚀 ลิงก์นี้จะทำการพ่นหน้า ProductOnlineListPage ตัวจริงของกัปตันทันที!
    element: <ProductOnlineListPage />
  },
  {
    path: 'products/create', 
    element: <MockProductCreate />
  },
  {
    path: 'products/edit/:id', 
    element: <MockProductEdit />
  },
  {
    path: 'audit', 
    element: <MockStockAudit />
  }
];