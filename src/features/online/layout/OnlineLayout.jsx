import UnifiedMainNav from "@/components/common/UnifiedMainNav";
import { Outlet } from "react-router-dom";
import SidebarOnline from "../components/SidebarOnline";
import CartPanel from "../components/CartPanel";

const OnlineLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedMainNav />

      {/* Main Content: 3 Columns */}
      <main className="flex-1 bg-gray-50 px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_280px] gap-4">
          {/* Sidebar ซ้าย */}
          <aside>
            <SidebarOnline />
          </aside>

          {/* Content ตรงกลาง */}
          <section>
            <Outlet />
          </section>

          {/* ตะกร้าสินค้า ขวาสุด */}
          <aside>
            <CartPanel />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm py-3 text-gray-600">
        © 2025 AlphaTech Online. All rights reserved.
      </footer>
    </div>
  );
};

export default OnlineLayout;