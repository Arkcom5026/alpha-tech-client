// src/layouts/superadmin/LayoutSuperAdmin.jsx

import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

import HeaderPos from '@/features/pos/components/header/HeaderPos';
import SidebarLoader from '@/features/pos/components/sidebar/SidebarLoader';

const LayoutSuperAdmin = () => {
  const { shopSlug } = useParams();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <SidebarLoader shopSlug={shopSlug} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderPos shopSlug={shopSlug} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50 p-4 animate-fadeIn md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutSuperAdmin;
