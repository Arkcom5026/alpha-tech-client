import { Outlet } from 'react-router-dom';
import SidebarFinance from '@/features/pos/components/sidebar/SidebarFinance';
import HeaderPos from '@/features/pos/components/header/HeaderPos';

const LayoutFinance = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ย่อยสำหรับโมดูลการเงิน */}
      <aside className="w-64 bg-blue-700 text-white p-4">
        <SidebarFinance />
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

export default LayoutFinance;
