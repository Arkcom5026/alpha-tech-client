
// =============================
// FILE: src/features/productOnline/components/SidebarOnline.jsx
// (อัปเดต: ปรับ Cascade Filter ให้เป็นลำดับขั้นจริงสำหรับ Online)
// =============================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import haversine from 'haversine-distance';

import { useBranchStore } from '@/features/branch/store/branchStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import { useProductOnlineStore } from '@/features/online/productOnline/store/productOnlineStore';

// =============================
// LocalStorage keys (Online)
// =============================
const LS_SELECTED_BRANCH_ID_KEY = 'alphaTech:online:selectedBranchId';

const SidebarOnline = () => {
  const setFilters = useProductOnlineStore((s) => s.setFilters);
  const setSearchText = useProductOnlineStore((s) => s.setSearchTextAction || s.setSearchText);
  const filters = useProductOnlineStore((s) => s.filters);
  const searchText = useProductOnlineStore((s) => s.filters?.searchText ?? s.searchText ?? '');
  const resetFilters = useProductOnlineStore((s) => s.resetFilters || s.resetFiltersAction);

  const dropdowns = useProductStore((s) => s.dropdowns);
  const fetchDropdownsAction = useProductStore((s) => s.fetchDropdownsAction);
  const dropdownsLoaded = useProductStore((s) => s.dropdownsLoaded);

  const branches = useBranchStore((s) => s.branches || []);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const getBranchNameById = useBranchStore((s) => s.getBranchNameById || (() => ''));
  // NOTE: ความตั้งใจเดิมของหน้า shop คือ “เลือกสาขาใกล้ที่สุดครั้งแรกเท่านั้น”
  // เราจึงเก็บตำแหน่งลูกค้าเป็น local state/ref และไม่เอา currentBranch มาใช้แทน
  const _unusedCurrentBranch = useBranchStore((s) => s.currentBranch);

  useEffect(() => {
    const hasData = Boolean(dropdowns && (
      (dropdowns.categories?.length || 0) > 0 ||
      (dropdowns.productTypes?.length || 0) > 0 ||
      (dropdowns.productProfiles?.length || 0) > 0 ||
      (dropdowns.productTemplates?.length || 0) > 0
    ));
    if (!hasData || !dropdownsLoaded) {
      fetchDropdownsAction?.(true);
    }
  }, [selectedBranchId, dropdownsLoaded]);

  const handleSearchTextChange = (e) => {
    const text = e?.target?.value ?? '';
    setSearchText(text);
  };

  const handleReset = () => {
    resetFilters?.();
  };

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId),
    [branches, selectedBranchId]
  );

  // =============================
  // Auto-select nearest branch (ครั้งแรกที่เข้า /shop เท่านั้น)
  // =============================
  const didAutoSelectRef = useRef(false);
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude }

  useEffect(() => {
    // รันแค่ครั้งแรกของการเปิดหน้า และไม่รันซ้ำเมื่อ user เปลี่ยนสาขาเอง
    if (didAutoSelectRef.current) return;

    // 1) ถ้ามีสาขาที่ลูกค้าเคยเลือกไว้ (persist) ให้ใช้สาขานั้นก่อนเสมอ
    try {
      if (!selectedBranchId) {
        const raw = localStorage.getItem(LS_SELECTED_BRANCH_ID_KEY);
        const persistedId = Number(raw);
        if (persistedId) {
          const persistedBranch = (branches || []).find((b) => Number(b?.id) === persistedId);
          if (persistedBranch?.id) {
            didAutoSelectRef.current = true;
            useBranchStore.setState({
              selectedBranchId: persistedBranch.id,
              version: (useBranchStore.getState().version || 0) + 1,
            });
            setFilters?.({ branchId: persistedBranch.id });
            return;
          }
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    if (!branches?.length) return;

    didAutoSelectRef.current = true;

    // ถ้ามี selectedBranchId อยู่แล้ว (เช่นเคยเลือกไว้) ก็ไม่ต้อง override
    if (selectedBranchId) return;

    // ขอ location จาก browser ครั้งเดียว
    if (!navigator?.geolocation) {
      // fallback: ถ้าไม่มี geolocation ให้ใช้สาขาแรก
      const first = branches[0];
      if (first?.id) {
        // ✅ persist fallback สาขาแรก
        try {
          localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(first.id));
        } catch (e) {
          // ignore storage errors
        }

        // ✅ persist fallback สาขาแรก
        try {
          localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(first.id));
        } catch (e) {
          // ignore storage errors
        }

        useBranchStore.setState({
          selectedBranchId: first.id,
          version: (useBranchStore.getState().version || 0) + 1,
        });
        setFilters?.({ branchId: first.id });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lon = Number(pos?.coords?.longitude);
        if (!lat || !lon) return;

        const loc = { latitude: lat, longitude: lon };
        setUserLocation(loc);

        // คัดเฉพาะสาขาที่มีพิกัด
        const candidates = (branches || []).filter((b) => b?.latitude && b?.longitude);
        if (!candidates.length) return;

        let nearest = candidates[0];
        let best = Infinity;
        for (const b of candidates) {
          const d = haversine(loc, { latitude: Number(b.latitude), longitude: Number(b.longitude) });
          if (d < best) {
            best = d;
            nearest = b;
          }
        }

        if (nearest?.id) {
          // ✅ persist สาขาที่ถูกเลือกอัตโนมัติ (ครั้งแรก)
          try {
            localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(nearest.id));
          } catch (e) {
            // ignore storage errors
          }

          useBranchStore.setState({
            selectedBranchId: nearest.id,
            version: (useBranchStore.getState().version || 0) + 1,
          });
          setFilters?.({ branchId: nearest.id });
        }
      },
      () => {
        // ถ้าผู้ใช้ไม่อนุญาต location → fallback เป็นสาขาแรก
        const first = branches[0];
        if (first?.id) {
          useBranchStore.setState({
            selectedBranchId: first.id,
            version: (useBranchStore.getState().version || 0) + 1,
          });
          setFilters?.({ branchId: first.id });
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60_000 }
    );
  }, [branches, selectedBranchId, setFilters]);

  // ระยะห่าง = ตำแหน่งลูกค้า → สาขาที่เลือก (ถ้ามี userLocation)
  let distanceInKm = null;
  if (userLocation?.latitude && userLocation?.longitude && selectedBranch?.latitude && selectedBranch?.longitude) {
    const distance = haversine(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: Number(selectedBranch.latitude), longitude: Number(selectedBranch.longitude) }
    );
    distanceInKm = (distance / 1000).toFixed(2);
  }

  // normalize dropdowns (เก็บ parent keys ไว้สำหรับ cascade)
  const normalizeList = (arr = [], type = '') =>
    (arr || [])
      .map((x) => {
        const id = Number(x?.id ?? x?.value ?? x?.key ?? x?.code ?? x?.Id ?? x?.ID ?? 0) || 0;
        const name = String(
          x?.name ?? x?.label ?? x?.text ?? x?.Name ?? x?.Label ?? x?.Text ?? ''
        ).trim();

        // เดา parent id ตามชนิดของรายการ + alias ยอดฮิต
        const categoryId = Number(
          x?.categoryId ?? x?.catalogId ?? x?.groupId ?? x?.CategoryId ?? x?.CatalogId
        ) || undefined;
        const productTypeId = Number(
          x?.productTypeId ?? x?.typeId ?? x?.subgroupId ?? x?.ProductTypeId ?? x?.TypeId
        ) || undefined;

        // template ปกติจะอ้างถึง productProfileId
        const templateProfileId = Number(
          x?.productProfileId ?? x?.profileId ?? x?.ProductProfileId ?? x?.ProfileId
        ) || undefined;

        const payload = { id, name };
        if (type === 'productTypes') Object.assign(payload, { categoryId });
        if (type === 'productProfiles') Object.assign(payload, { productTypeId });
        if (type === 'productTemplates') Object.assign(payload, { productProfileId: templateProfileId });
        if (type === 'categories') Object.assign(payload, {});
        return payload;
      })
      .filter((x) => x.id && x.name);

  const dropdownsSafe = useMemo(
    () => ({
      categories: normalizeList(
        dropdowns?.categories || dropdowns?.productCategories || dropdowns?.groups || dropdowns?.catalogs || [],
        'categories'
      ),
      productTypes: normalizeList(
        dropdowns?.productTypes || dropdowns?.types || dropdowns?.subgroups || [],
        'productTypes'
      ),
      productProfiles: normalizeList(
        dropdowns?.productProfiles || dropdowns?.profiles || dropdowns?.attributes || dropdowns?.characteristics || [],
        'productProfiles'
      ),
      productTemplates: normalizeList(
        dropdowns?.productTemplates || dropdowns?.templates || dropdowns?.models || [],
        'productTemplates'
      ),
    }),
    [dropdowns]
  );

  // ทำการกรองตามลำดับขั้น (category -> type -> profile -> template)
  const dropdownsFiltered = useMemo(() => {
    const catId = Number(filters?.categoryId) || undefined;
    const typeId = Number(filters?.productTypeId) || undefined;
    const profId = Number(filters?.productProfileId) || undefined;

    const productTypes = (dropdownsSafe.productTypes || []).filter((t) => !catId || t.categoryId === catId);
    const productProfiles = (dropdownsSafe.productProfiles || []).filter((p) => !typeId || p.productTypeId === typeId);
    const productTemplates = (dropdownsSafe.productTemplates || []).filter((t) => !profId || t.productProfileId === profId);

    return {
      categories: dropdownsSafe.categories || [],
      productTypes,
      productProfiles,
      productTemplates,
    };
  }, [dropdownsSafe, filters]);

  return (
    <div className="space-y-2 px-2 py-2">
      <div className="bg-green-50 border border-green-300 text-green-800 px-3 py-2 rounded text-sm">
        <div className="font-bold">สาขาที่เลือก</div>
        {getBranchNameById(selectedBranchId)}
        <div className="mt-2">
          <select
            value={selectedBranchId || ''}
            onChange={(e) => {
              const newId = Number(e.target.value);
              const newBranch = branches.find((b) => b.id === newId);
              if (newBranch) {
                // ✅ จำสาขาที่ลูกค้าเลือกไว้ เพื่อให้ใช้งานในสภาพแวดล้อมสาขานี้ต่อเนื่อง (persist)
                try {
                  localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(newBranch.id));
                } catch (e) {
                  // ignore storage errors
                }

                useBranchStore.setState({
                  selectedBranchId: newBranch.id,
                  // ✅ ผู้ใช้เลือกเปลี่ยนสาขาเองได้ แต่ไม่ override ตำแหน่งลูกค้า (userLocation)
                  version: (useBranchStore.getState().version || 0) + 1,
                });
                setFilters?.({ branchId: newBranch.id });
              }
            }}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">-- เลือกสาขาอื่น --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
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
        dropdowns={dropdownsFiltered}
        searchText={searchText}
        onSearchTextChange={handleSearchTextChange}
        showReset
        onReset={handleReset}
        isLoading={!dropdownsLoaded}
        onChange={(next) => {
          const curr = {
            categoryId: filters?.categoryId,
            productTypeId: filters?.productTypeId,
            productProfileId: filters?.productProfileId,
            productTemplateId: filters?.productTemplateId,
          };
          const merged = {
            categoryId: next.categoryId ?? curr.categoryId,
            productTypeId: next.productTypeId ?? curr.productTypeId,
            productProfileId: next.productProfileId ?? curr.productProfileId,
            productTemplateId: next.productTemplateId ?? curr.productTemplateId,
            branchId: selectedBranchId,
          };
          for (const k of Object.keys(merged)) { if (merged[k] === '') merged[k] = undefined; }
          if (merged.categoryId !== curr.categoryId) {
            merged.productTypeId = undefined;
            merged.productProfileId = undefined;
            merged.productTemplateId = undefined;
          } else if (merged.productTypeId !== curr.productTypeId) {
            merged.productProfileId = undefined;
            merged.productTemplateId = undefined;
          } else if (merged.productProfileId !== curr.productProfileId) {
            merged.productTemplateId = undefined;
          }
          setFilters?.(merged);
        }}
      />

      {!dropdownsLoaded && (
        <div className="text-xs text-gray-500">กำลังโหลดชุดตัวกรอง…</div>
      )}
    </div>
  );
};

export default SidebarOnline;

