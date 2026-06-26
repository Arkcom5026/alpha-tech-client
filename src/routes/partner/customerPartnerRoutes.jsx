// src/routes/partner/customerPartnerRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

// 🟢 แก้ไข: นำป้ายกำกับข้อความแปลกปลอมออกเรียบร้อยแล้วครับ
import ListCustomersPage from '@/features/customer/pages/ListCustomersPage';
import CustomerDetailPage from '@/features/customer/pages/CustomerDetailPage';

export const customerPartnerRoutes = [
  { 
    index: true, 
    element: <ListCustomersPage /> 
  },
  { 
    path: ':customerId', 
    element: <CustomerDetailPage /> 
  },
  { 
    path: '*', 
    element: <Navigate to="." replace /> 
  }
];