// =============================
// FILE: src/features/productOnline/components/SidebarOnline.jsx
// (เสริมความปลอดภัย: บังคับโหลด dropdowns หลัง deploy, กันค่า null, และไม่ยิงซ้ำ)
// =============================
import React, { useEffect, useMemo } from 'react';
import haversine from 'haversine-distance';

import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import { useProductOnlineStore } from '@/features/online/productOnline/store/productOnlineStore';

const SidebarOnline = () => {
  // ─────────── Online Store (FE only) ───────────
  const setFilters = useProductOnlineStore((s) => s.setFilters);
  const setSearchText = useProductOnlineStore((s) => s.setSearchTextAction || s.setSearchText);
  const filters = useProductOnlineStore((s) => s.filters);
  const searchText = useProductOnlineStore((s) => s.filters?.searchText ?? s.searchText ?? '');
  const resetFilters = useProductOnlineStore((s) => s.resetFilters || s.resetFiltersAction);

  // ─────────── Product dropdowns (SSOT) ───────────
  const dropdowns = useProductStore((s) => s.dropdowns);
  const fetchDropdownsAction = useProductStore((s) => s.fetchDropdownsAction);
  const dropdownsLoaded = useProductStore((s) => s.dropdownsLoaded);

  // ─────────── Branch ───────────
  const branches = useBranchStore((s) => s.branches || []);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const getBranchNameById = useBranchStore((s) => s.getBranchNameById || (() => ''));
  const currentBranch = useBranchStore((s) => s.currentBranch);

  // ✅ บังคับโหลด dropdowns เคสหลัง Deploy / เคส cache ว่าง
  useEffect(() => {
    const hasData = Boolean(dropdowns && (
      (dropdowns.categories?.length || 0) > 0 ||
      (dropdowns.productTypes?.length || 0) > 0 ||
      (dropdowns.productProfiles?.length || 0) > 0 ||
      (dropdowns.productTemplates?.length || 0) > 0
    ));
    if (!hasData || !dropdownsLoaded) {
      // force=true เพื่อข้าม persist cache หลัง deploy
      fetchDropdownsAction?.(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, dropdownsLoaded]);

  const handleSearchTextChange = (e) => {
    const text = e?.target?.value ?? '';
    setSearchText(text);
  };

  const handleReset = () => {
    resetFilters?.();
    // ปล่อยให้ store debounce โหลดให้เอง
  };

  const selectedBranch = useMemo(() => branches.find((b) => b.id === selectedBranchId), [branches, selectedBranchId]);

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

  // ✅ dropdowns ปลอดภัยเสมอ (กัน undefined)
  const dropdownsSafe = useMemo(() => ({
    categories: dropdowns?.categories ?? [],
    productTypes: dropdowns?.productTypes ?? [],
    productProfiles: dropdowns?.productProfiles ?? [],
    productTemplates: dropdowns?.productTemplates ?? [],
  }), [dropdowns]);

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
                  version: (useBranchStore.getState().version || 0) + 1,
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
        value={{
          categoryId: filters?.categoryId ?? '',
          productTypeId: filters?.productTypeId ?? '',
          productProfileId: filters?.productProfileId ?? '',
          productTemplateId: filters?.productTemplateId ?? '',
        }}
        onChange={(next) => setFilters?.(next)}
        dropdowns={dropdownsSafe}
        searchText={searchText}
        onSearchTextChange={handleSearchTextChange}
        showReset
        onReset={handleReset}
        isLoading={!dropdownsLoaded}
      />

      { !dropdownsLoaded && (
        <div className="text-xs text-gray-500">กำลังโหลดชุดตัวกรอง…</div>
      )}
    </div>
  );
};

export default SidebarOnline;
