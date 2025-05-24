import { Outlet } from 'react-router-dom';

import HeaderPos from '@/features/pos/components/header/HeaderPos';
import SidebarLoader from '@/features/pos/components/SidebarLoader';

const LayoutPos = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ย่อยสำหรับโมดูลสต๊อกสินค้า */}
      <aside className="flex h-screen bg-blue-600 text-white">
        <SidebarLoader />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <HeaderPos />
        <main className="p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutPos;
