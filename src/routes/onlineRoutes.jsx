// ✅ src/routes/onlineRoutes.js
import React from 'react';



import HomeOnline from '@/features/online/pages/HomeOnline';

import Checkout from '@/features/pos/purchase/pages/CheckoutPage';
import LayoutOnline from '@/layouts/online/LayoutOnline';

const onlineRoutes = {
  path: '/',
  element: <LayoutOnline />, // layout หลักของฝั่งลูกค้า
  children: [
    { index: true, element: <HomeOnline /> },

    { path: 'checkout', element: <Checkout /> },
    

  ],
};

export default onlineRoutes;
