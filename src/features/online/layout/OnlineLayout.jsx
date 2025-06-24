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
      {/* Navbar ด้านบน */}
      <UnifiedMainNav />

      {/* Layout ปรับตามหน้าปัจจุบัน */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] min-h-[calc(100vh-64px)]">
        {/* Sidebar ซ้าย */}
        <aside className="bg-white border-r border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">ค้นหาสินค้า</h2>
          <SidebarOnline />
        </aside>

        {/* เนื้อหาหลัก แสดงสินค้า */}
        <main className="px-2 sm:px-4 py-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* ตะกร้าสินค้า / หรือ sidebar ขวา */}
        <aside className="bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 md:p-6">
          <CartPanel />
        </aside>
      </div>
    </div>
  );
};

export default OnlineLayout;
