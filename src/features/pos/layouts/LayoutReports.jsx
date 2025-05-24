import { Outlet } from 'react-router-dom';
import SidebarReports from '@/features/pos/components/sidebar/SidebarReport-s';
import HeaderPos from '@/features/pos/components/header/HeaderPos';

const LayoutReports = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ย่อยสำหรับโมดูลรายงาน */}
      <aside className="w-64 bg-blue-700 text-white p-4">
        <SidebarReports />
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

export default LayoutReports;
