// ✅ src/routes/onlineRoutes.js
import React from 'react';


//import ProductOnlineListPage from '@/features/online/productOnline/pages/ProductOnlineListPage';
import OnlineLayout from '@/features/online/layout/OnlineLayout';
import HomeOnline from '@/features/online/pages/HomeOnline';
import ProductOnlineListPage from '@/features/online/productOnline/pages/ProductOnlineListPage';
import ProductOnlineDetailPage from '@/features/online/productOnline/pages/ProductOnlineDetailPage';


const onlineRoutes = {

  path: '/',
  element: <OnlineLayout />,
  children: [
    { index: true, element: <HomeOnline /> },

     { path: 'shop', element: <ProductOnlineListPage /> },   
     { path: 'shop/product/:id', element: <ProductOnlineDetailPage /> },
              
     
  ],
};

export default onlineRoutes;


