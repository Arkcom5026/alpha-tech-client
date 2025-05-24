// ✅ src/layouts/pos/LayoutDashboard.jsx
import { Outlet } from 'react-router-dom';
import SidebarDashboard from '../components/sidebar/sidebarDashboard';
import HeaderPos from '../components/header/HeaderPos';


const LayoutDashboard = () => {
  return (
    <div className="flex h-screen">


      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <HeaderPos />
        
        {/* SidebarDashboard */}
        <aside className="w-64 bg-muted dark:bg-zinc-950 text-foreground border-r border-border p-4">
          <SidebarDashboard />
        </aside>

        <main className="p-4 overflow-y-auto bg-white dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>


    </div>
  );
};

export default LayoutDashboard;
