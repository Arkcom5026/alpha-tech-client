import { Outlet } from 'react-router-dom'
import SidebarPurchases from '@/features/pos/components/sidebar/SidebarPurchases'
import HeaderPos from '@/features/pos/components/header/HeaderPos'

const LayoutPurchase = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar ย่อยเฉพาะโมดูลจัดซื้อ */}
      <aside className="w-64 bg-blue-700 text-white p-4">
        <SidebarPurchases />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header POS */}
        <HeaderPos />

        {/* Outlet for subpages */}
        <main className="p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LayoutPurchase
