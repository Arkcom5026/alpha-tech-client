import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import HeaderPos from '@/features/pos/components/header/HeaderPos';
import SidebarLoader from '@/features/pos/components/SidebarLoader';
import { useBranchStore } from '@/features/branch/store/branchStore';


const LayoutPos = () => {
  const {
    selectedBranchId,
    currentBranch,
    branches,
    setCurrentBranch,
  } = useBranchStore();

  useEffect(() => {
    if (!currentBranch && selectedBranchId && branches.length > 0) {
      const found = branches.find((b) => b.id === selectedBranchId);
      if (found) setCurrentBranch(found);
    }
  }, [currentBranch, selectedBranchId, branches, setCurrentBranch]);

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
