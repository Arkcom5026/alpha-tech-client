// ✅ src/features/online/pages/HomeOnline.jsx
import React from 'react';
import ContentCarousel from './ContentCarousel';



const HomeOnline = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      
      <div className="flex-1 min-w-0">
        <ContentCarousel />
      </div>

    </div>
  );
};

export default HomeOnline;
