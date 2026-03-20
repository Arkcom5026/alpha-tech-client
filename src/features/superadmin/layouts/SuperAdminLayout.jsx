import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarSuperAdmin from '../sidebar/SidebarSuperAdmin';

const SuperAdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:shrink-0">
          <SidebarSuperAdmin />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Platform Control
                </div>
                <h1 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">
                  SuperAdmin Workspace
                </h1>
              </div>

              <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                GLOBAL MODE
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
