// ✅ src/routes/onlineRoutes.js
import React from 'react';

import OnlineLayout from '@/features/online/layout/OnlineLayout';
import ProductOnlineListPage from '@/features/online/productOnline/pages/ProductOnlineListPage';
import ProductOnlineDetailPage from '@/features/online/productOnline/pages/ProductOnlineDetailPage';

const onlineRoutes = {    
  path: 'shop',
  element: <OnlineLayout />, // ✅ layout สำหรับหน้า shop ทั้งหมด
  children: [    
    { index: true, element: <ProductOnlineListPage /> },    
    { path: 'product/:id', element: <ProductOnlineDetailPage /> }, // ✅ รองรับ query เช่น ?branchId=2
  ],
};

export default onlineRoutes;
