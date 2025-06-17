import React from 'react';
import UnifiedMainNav from '@/components/common/UnifiedMainNav';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div>
      <UnifiedMainNav />
      <Outlet />
    </div>
  );
};

export default PublicLayout;
