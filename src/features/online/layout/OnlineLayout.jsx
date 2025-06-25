// src/layouts/OnlineLayout.jsx

import UnifiedMainNav from "@/components/common/UnifiedMainNav";
import SidebarOnline from "../components/SidebarOnline";
import { Outlet, useLocation } from "react-router-dom";
import CartPanel from "../cart/components/CartPanel";

const OnlineLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar ด้านบน - sticky */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <UnifiedMainNav />
      </div>

      {/* Layout ปรับตามหน้าปัจจุบัน */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:grid-flow-col min-h-[calc(100vh-64px)]">
        {/* Sidebar ซ้าย */}        
        <aside className="sticky top-6 self-start bg-white border border-gray-200 p-4 md:p-6 w-full lg:w-[280px] rounded-md shadow-sm h-fit">          
          <SidebarOnline />
        </aside>

        {/* เนื้อหาหลัก + ตะกร้าสินค้า */}
        <div className="flex flex-col lg:flex-row w-full gap-6 px-4 py-6">
          <main className="flex-1 px-2 sm:px-4 py-6 overflow-y-auto">            
            <Outlet />
          </main>

          {/* ตะกร้าสินค้า */}
          <aside className="sticky top-6 self-start bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 md:p-6 w-full lg:w-[320px] xl:w-[330px] max-h-[90vh] overflow-auto rounded-md shadow-sm">
            <CartPanel />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OnlineLayout;
