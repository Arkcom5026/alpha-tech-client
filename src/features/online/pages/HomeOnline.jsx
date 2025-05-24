// ✅ src/features/online/pages/HomeOnline.jsx
import React from 'react';


import BestSeller from '../components/BestSeller';
import NewProduct from '../components/NewProduct';
import ContentCarousel from '../components/ContentCarousel';

const HomeOnline = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <ContentCarousel />
        <p className="text-2xl text-center my-4">สินค้าขายดี</p>
        {/*<BestSeller /> */}
        <p className="text-2xl text-center my-4">สินค้ามาใหม่</p>
        {/*<NewProduct /> */}

      </div>

    </div>
  );
};

export default HomeOnline;
