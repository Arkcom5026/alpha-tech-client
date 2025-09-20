

// =============================
// FILE: src/features/productOnline/components/SidebarOnline.jsx
// (อัปเดตให้โหลด dropdowns และส่งค่าได้ถูกต้อง)
// =============================
import React, { useEffect } from 'react';
import haversine from 'haversine-distance';

import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import { useProductOnlineStore } from '@/features/online/productOnline/store/productOnlineStore';

const SidebarOnline = () => {

  const setFilters = useProductOnlineStore((s) => s.setFilters);
  const setSearchText = useProductOnlineStore((s) => s.setSearchText);
  const filters = useProductOnlineStore((s) => s.filters);
  const searchText = useProductOnlineStore((s) => s.searchText);
  const resetFilters = useProductOnlineStore((s) => s.resetFilters);

  // ✅ dropdowns delegated to productStore (single source of truth)
  const dropdowns = useProductStore((s) => s.dropdowns);
  const fetchDropdownsAction = useProductStore((s) => s.fetchDropdownsAction);
  const dropdownsLoaded = useProductStore((s) => s.dropdownsLoaded);
  const branches = useBranchStore((s) => s.branches);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const getBranchNameById = useBranchStore((s) => s.getBranchNameById);

  // 🔄 โหลด dropdowns เมื่อ mount (และเมื่อเปลี่ยนสาขา เผื่อมีนโยบายราคาเฉพาะสาขา)
  useEffect(() => {
    fetchDropdownsAction?.(false);
  }, [fetchDropdownsAction, selectedBranchId]);

  const handleSearchTextChange = (e) => {
    const text = e.target.value ?? '';
    setSearchText(text);
  };

  const handleReset = () => {
    resetFilters();
    // รีโหลดรายการสินค้า (ถ้าหน้าปัจจุบันเชื่อมกับ action นี้)
    useProductOnlineStore.getState().loadProductsAction?.();
  };

  const currentBranch = useBranchStore((s) => s.currentBranch);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  let distanceInKm = null;
  if (
    currentBranch?.latitude && currentBranch?.longitude &&
    selectedBranch?.latitude && selectedBranch?.longitude
  ) {
    const userLoc = { latitude: currentBranch.latitude, longitude: currentBranch.longitude };
    const branchLoc = { latitude: selectedBranch.latitude, longitude: selectedBranch.longitude };
    const distance = haversine(userLoc, branchLoc);
    distanceInKm = (distance / 1000).toFixed(2);
  }

  // ✅ Trigger persist manually when selectedBranchId changes
  useEffect(() => {
    const branch = useBranchStore.getState();
    localStorage.setItem('branch-storage', JSON.stringify({
      state: {
        currentBranch: branch.currentBranch,
        selectedBranchId: branch.selectedBranchId,
        version: branch.version,
      },
      version: 0,
    }));
  }, [selectedBranchId]);

  return (
    <div className="space-y-2 px-2 py-2">
      <div className="bg-green-50 border border-green-300 text-green-800 px-3 py-2 rounded text-sm">
        <div className="font-bold">สาขาที่ใกล้ที่สุด</div>
        {getBranchNameById(selectedBranchId)}
        <div className="mt-2">
          <select
            value={selectedBranchId || ''}
            onChange={(e) => {
              const newId = Number(e.target.value);
              const newBranch = branches.find((b) => b.id === newId);
              if (newBranch) {
                useBranchStore.setState({
                  selectedBranchId: newBranch.id,
                  currentBranch: newBranch,
                  version: useBranchStore.getState().version + 1,
                });
              }
            }}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">-- เลือกสาขาอื่น --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {distanceInKm && (
            <div className="text-xs text-gray-500 mt-1">ระยะห่าง {distanceInKm} กม.</div>
          )}
        </div>
      </div>

      <input
        type="text"
        value={searchText}
        onChange={handleSearchTextChange}
        placeholder="ค้นหาชื่อสินค้า..."
        className="border px-3 py-2 rounded w-full"
      />

      <CascadingFilterGroup
        variant="online"
        value={filters}
        onChange={setFilters}
        dropdowns={dropdowns}
        searchText={searchText}
        onSearchTextChange={handleSearchTextChange}
        showReset
        onReset={handleReset}
      />

      { !dropdownsLoaded && (
        <div className="text-xs text-gray-500">กำลังโหลดชุดตัวกรอง…</div>
      )}
    </div>
  );
};

export default SidebarOnline;
















