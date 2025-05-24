import { Outlet } from 'react-router-dom';
import SidebarStock from '@/features/pos/components/sidebar/SidebarStock';
import HeaderPos from '@/features/pos/components/header/HeaderPos';

const LayoutStock = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ย่อยสำหรับโมดูลสต๊อกสินค้า */}
      <aside className="w-64 bg-blue-700 text-white p-4">
        <SidebarStock />
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

export default LayoutStock;
