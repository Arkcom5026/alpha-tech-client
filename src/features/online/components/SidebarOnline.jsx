// =============================
// FILE: src/features/productOnline/components/SidebarOnline.jsx
// (อัปเดต: Online ใช้ลำดับขั้น Category → ProductType → Product(optional))
// (และซ่อน dropdown “สินค้า” ไว้ก่อน เพื่อใช้ Search เป็นหลัก)
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

  const dropdowns = useProductStore((s) => s.dropdowns);
  const fetchDropdownsAction = useProductStore((s) => s.fetchDropdownsAction);
  const dropdownsLoaded = useProductStore((s) => s.dropdownsLoaded);

  const branches = useBranchStore((s) => s.branches || []);
  const loadBranchesAction = useBranchStore(
    (s) =>
      s.loadAllBranchesAction ||
      s.loadBranchesAction ||
      s.fetchBranchesAction ||
      s.loadBranches ||
      s.fetchBranches
  );

  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const getBranchNameById = useBranchStore((s) => s.getBranchNameById || (() => ''));

  // ✅ ensure branches are loaded for branch dropdown
  useEffect(() => {
    if (Array.isArray(branches) && branches.length > 0) return;
    loadBranchesAction?.();
  }, [branches?.length, loadBranchesAction]);

  // ✅ ensure dropdowns are loaded (only what Online needs)
  useEffect(() => {
    const hasData = Boolean(
      dropdowns &&
        ((dropdowns.categories?.length || 0) > 0 || (dropdowns.productTypes?.length || 0) > 0)
    );

    if (!hasData || !dropdownsLoaded) {
      fetchDropdownsAction?.(true);
    }
  }, [dropdowns, dropdownsLoaded, fetchDropdownsAction]);

  const handleSearchTextChange = (e) => {
    const text = e?.target?.value ?? '';
    setSearchText?.(text);
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

    // ถ้ามี selectedBranchId อยู่แล้ว ก็ไม่ต้อง override
    if (selectedBranchId) return;

    // fallback: ถ้าไม่มี geolocation ให้ใช้สาขาแรก
    if (!navigator?.geolocation) {
      const first = branches[0];
      if (first?.id) {
        try {
          localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(first.id));
        } catch (e) {}

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
          try {
            localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(nearest.id));
          } catch (e) {}

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
          try {
            localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(first.id));
          } catch (e) {}

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
  if (
    userLocation?.latitude &&
    userLocation?.longitude &&
    selectedBranch?.latitude &&
    selectedBranch?.longitude
  ) {
    const distance = haversine(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: Number(selectedBranch.latitude), longitude: Number(selectedBranch.longitude) }
    );
    distanceInKm = (distance / 1000).toFixed(2);
  }

  // normalize dropdowns (Online: Category → Type → Product(optional))
  const normalizeList = (arr = [], type = '') =>
    (arr || [])
      .map((x) => {
        const id = Number(x?.id ?? x?.value ?? x?.key ?? x?.code ?? x?.Id ?? x?.ID ?? 0) || 0;
        const name = String(x?.name ?? x?.label ?? x?.text ?? x?.Name ?? x?.Label ?? x?.Text ?? '').trim();

        // best-effort parent ids (minimal disruption)
        const categoryId =
          Number(x?.categoryId ?? x?.catalogId ?? x?.groupId ?? x?.CategoryId ?? x?.CatalogId) || undefined;

        const productTypeId =
          Number(x?.productTypeId ?? x?.typeId ?? x?.subgroupId ?? x?.ProductTypeId ?? x?.TypeId) || undefined;

        const payload = { id, name };
        if (type === 'productTypes') Object.assign(payload, { categoryId });
        if (type === 'products') Object.assign(payload, { categoryId, productTypeId });
        return payload;
      })
      .filter((x) => x.id && x.name);

  const dropdownsSafe = useMemo(
    () => ({
      categories: normalizeList(
        dropdowns?.categories || dropdowns?.productCategories || dropdowns?.groups || dropdowns?.catalogs || [],
        'categories'
      ),
      productTypes: normalizeList(dropdowns?.productTypes || dropdowns?.types || dropdowns?.subgroups || [], 'productTypes'),
      // products is optional for Online (we hide the dropdown by default)
      products: normalizeList(dropdowns?.products || dropdowns?.productList || dropdowns?.items || [], 'products'),
    }),
    [dropdowns]
  );

  // cascade filter: category -> type -> product
  const dropdownsFiltered = useMemo(() => {
    const catId = Number(filters?.categoryId) || undefined;
    const typeId = Number(filters?.productTypeId) || undefined;

    const productTypes = (dropdownsSafe.productTypes || []).filter((t) => !catId || t.categoryId === catId);
    const products = (dropdownsSafe.products || []).filter(
      (p) => (!catId || p.categoryId === catId) && (!typeId || p.productTypeId === typeId)
    );

    return {
      categories: dropdownsSafe.categories || [],
      productTypes,
      products,
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
                try {
                  localStorage.setItem(LS_SELECTED_BRANCH_ID_KEY, String(newBranch.id));
                } catch (e) {}

                useBranchStore.setState({
                  selectedBranchId: newBranch.id,
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

          {distanceInKm && <div className="text-xs text-gray-500 mt-1">ระยะห่าง {distanceInKm} กม.</div>}
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
        // ✅ Online: ซ่อน dropdown “สินค้า” ไว้ก่อน (ใช้ Search เป็นหลัก)
        hiddenFields={['product']}
        value={{
          categoryId: filters?.categoryId ?? '',
          productTypeId: filters?.productTypeId ?? '',
          productId: filters?.productId ?? '',
        }}
        dropdowns={{
          categories: dropdownsFiltered.categories,
          productTypes: dropdownsFiltered.productTypes,
          products: dropdownsFiltered.products,
        }}
        showReset
        onChange={(next) => {
          const curr = {
            categoryId: filters?.categoryId,
            productTypeId: filters?.productTypeId,
            productId: filters?.productId,
          };

          const merged = {
            categoryId: next.categoryId ?? curr.categoryId,
            productTypeId: next.productTypeId ?? curr.productTypeId,
            productId: next.productId ?? curr.productId,
            branchId: selectedBranchId,
          };

          for (const k of Object.keys(merged)) {
            if (merged[k] === '') merged[k] = undefined;
          }

          // cascade reset
          if (merged.categoryId !== curr.categoryId) {
            merged.productTypeId = undefined;
            merged.productId = undefined;
          } else if (merged.productTypeId !== curr.productTypeId) {
            merged.productId = undefined;
          }

          setFilters?.(merged);
        }}
      />

      {!dropdownsLoaded && <div className="text-xs text-gray-500">กำลังโหลดชุดตัวกรอง…</div>}
    </div>
  );
};

export default SidebarOnline;
