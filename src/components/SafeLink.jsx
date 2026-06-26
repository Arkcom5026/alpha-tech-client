// src/components/SafeLink.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';

export const SafeLink = ({ to, children, ...props }) => {
  const { shopSlug } = useParams();

  // 🚨 ระบบตรวจจับ: ถ้าลิงก์เริ่มต้นด้วย /pos/ โดยไม่มี shopSlug นำหน้า
  if (typeof to === 'string' && to.startsWith('/pos/')) {
    console.error(`❌ [TRAFFIC DETECTED]: พบลิงก์หลุดเลนไม่ได้ครอบชื่อร้านค้า -> Target: "${to}"`);
    
    // ซ่อมแซมสายสัญญาณออโต้ให้วิ่งกลับเข้าเลนร้านค้าปัจจุบันชั่วคราว
    const safePath = shopSlug ? `/${shopSlug}${to}` : to;
    return <Link to={safePath} {...props}>{children}</Link>;
  }

  return <Link to={to} {...props}>{children}</Link>;
};