import { Outlet } from 'react-router-dom';
import SidebarSales from '@/features/pos/components/sidebar/SidebarSales';
import HeaderPos from '@/features/pos/components/header/HeaderPos';

const LayoutSales = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ย่อยสำหรับโมดูลการขาย */}
      <aside className="w-64 bg-blue-700 text-white p-4">
        <SidebarSales />
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

export default LayoutSales;
