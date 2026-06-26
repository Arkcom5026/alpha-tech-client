// src/routes/partner/onlinePartnerRoutes.jsx
import React from 'react';

// 💡 จำลองคอมโพเนนต์หน้าร้านออนไลน์ (กัปตันสามารถสลับ Import ไฟล์จริงในเครื่องมาลงพิกัดนี้ได้เลยครับ)
const PartnerShopHome = () => <div>🏪 หน้าแรกของพันธมิตรคู่ค้าออนไลน์ (E-Commerce Home)</div>;
const PartnerProductDetail = () => <div>📦 หน้ารายละเอียดผลิตภัณฑ์สินค้าประจำร้าน</div>;
const PartnerCart = () => <div>🛒 ตะกร้าสินค้าออนไลน์สำหรับสั่งซื้อของ</div>;

export const onlinePartnerRoutes = [
  {
    path: '', // ตกกระทบหน้าแรกหน้าร้าน: /:shopSlug
    element: <PartnerShopHome />
  },
  {
    path: 'products/:productId', // ดูสินค้าเฉพาะชิ้น: /:shopSlug/products/123
    element: <PartnerProductDetail />
  },
  {
    path: 'cart', // ตะกร้าสินค้าออนไลน์: /:shopSlug/cart
    element: <PartnerCart />
  }
];