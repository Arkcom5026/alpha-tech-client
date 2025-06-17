
// ✅ src/routes/onlineRoutes.js
import React from 'react';

import OnlineLayout from '@/features/online/layout/OnlineLayout';
import ProductOnlineListPage from '@/features/online/productOnline/pages/ProductOnlineListPage';
import ProductOnlineDetailPage from '@/features/online/productOnline/pages/ProductOnlineDetailPage';

const onlineRoutes = {
  path: 'shop',
  element: <OnlineLayout />,
  children: [
    { index: true, element: <ProductOnlineListPage /> },    
    { path: 'product/:id', element: <ProductOnlineDetailPage /> },
  ],
};


export default onlineRoutes;
