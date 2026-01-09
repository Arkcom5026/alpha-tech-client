

// ✅ src/features/product/pages/ListProductPage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import ProductTable from '../components/ProductTable';
import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';

export default function ListProductPage() {
  const [searchText, setSearchText] = useState('');
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [filter, setFilter] = useState({
    // ✅ Restore-only: keep filter ids as null|number to avoid "12" !== 12 issues
    categoryId: null,
    productTypeId: null,
    productProfileId: null,
    productTemplateId: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  
  const [disableTarget, setDisableTarget] = useState(null);
  const [enablingId, setEnablingId] = useState(null);

  // ใช้เรียกจากตาราง (แทน confirmDelete เดิม)
  const confirmDisable = (prodId) => {
    const target = allProducts.find((p) => p.id === prodId);
    if (target) setDisableTarget(target);
  };

    const confirmEnable = async (prodId) => {
    console.log('🧪 [Enable] confirmEnable clicked', { prodId });

    const target = allProducts.find((p) => p.id === prodId);
    if (!target) return;

    // ✅ No dialog for enable: perform immediately
    setEnablingId(prodId);

    try {
      console.log('🧪 [Enable] calling enableProductAction', { id: prodId });
      const res = await enableProductAction(prodId);
      console.log('🧪 [Enable] enableProductAction result', res);

      // sync UI ทันที
      setAllProducts((prev) =>
        Array.isArray(prev)
          ? prev.map((p) => (p?.id === prodId ? { ...p, active: true } : p))
          : prev
      );

      // reload กันข้อมูลค้าง
      await loadAllProductsOnce();
    } catch (error) {
      console.error('❌ เปิดใช้งานสินค้าไม่สำเร็จ:', error);
    } finally {
      setEnablingId(null);
    }
  };


  // ✅ View options (รองรับข้อมูลเยอะ)
  const [pageSize, setPageSize] = useState(25); // 10 | 25 | 50
  const [density, setDensity] = useState('normal'); // 'normal' | 'compact'
  const [showAllPrices, setShowAllPrices] = useState(false); // toggle: แสดงราคาทั้งหมด
  const [showInactive, setShowInactive] = useState(false); // toggle: แสดงสินค้าที่ปิดใช้งาน

  const perPage = pageSize;

  // ✅ Step 1: โหลดสินค้าทั้งหมดให้ “นิ่ง” ก่อน แล้วค่อยกรองที่ FE
  const [allProducts, setAllProducts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadAllError, setLoadAllError] = useState(null);
  const loadingAllRef = useRef(false);

  // ปรับได้ตามระบบคุณ (200-500)
  const TAKE = 200;
  const MAX_PAGES_SAFETY = 500;


  const branchId = useBranchStore((state) => state.selectedBranchId);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products,
    fetchProductsAction,
    disableProductAction,
    enableProductAction,
    dropdowns,
    dropdownsLoaded,
    ensureDropdownsAction,
  } = useProductStore();
  

  // ✅ Step 1: เราใช้ allProducts เป็นแหล่งข้อมูลหลักในหน้านี้ (products ใน store จะถูก overwrite ทีละหน้า)
  // eslint-disable-next-line no-unused-vars
  const _storeProducts = products;

  // โหลด dropdowns ครั้งเดียวเมื่อเข้าหน้า
  useEffect(() => {
    ensureDropdownsAction();
  }, [ensureDropdownsAction]);

  // 📌 (1) อ่านค่าจาก URL มาตั้งค่าเริ่มต้น (Deep-linkable)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const s = params.get('sort') || 'name-asc';

    const cat = params.get('categoryId');
    const type = params.get('productTypeId');
    const prof = params.get('productProfileId');
    const tpl = params.get('productTemplateId');

    setSearchText(q);
    setCommittedSearchText(q);
    setSortOrder(s);

    setFilter((prev) => ({
      ...prev,
      categoryId: cat != null ? Number(cat) : null,
      productTypeId: type != null ? Number(type) : null,
      productProfileId: prof != null ? Number(prof) : null,
      productTemplateId: tpl != null ? Number(tpl) : null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 📌 (2) ซิงก์ state → URL (restore-only, prevent loops)
  useEffect(() => {
    const params = new URLSearchParams();

    if (filter.categoryId != null) params.set('categoryId', String(filter.categoryId));
    if (filter.productTypeId != null) params.set('productTypeId', String(filter.productTypeId));
    if (filter.productProfileId != null) params.set('productProfileId', String(filter.productProfileId));
    if (filter.productTemplateId != null) params.set('productTemplateId', String(filter.productTemplateId));
    
    if (committedSearchText) params.set('q', committedSearchText);
    if (sortOrder && sortOrder !== 'name-asc') params.set('sort', sortOrder);

    const nextSearch = params.toString();
    const currSearch = new URLSearchParams(location.search).toString();
    if (nextSearch !== currSearch) {
      navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
    }
  }, [filter, committedSearchText, sortOrder, navigate, location.pathname, location.search]);


  const handleDisable = async () => {
    console.log('🧪 [Disable] handleDisable start', { disableTarget });
    if (!disableTarget?.id) return;
    try {
      // ✅ No delete: ใช้ disable action เท่านั้น
      console.log('🧪 [Disable] calling disableProductAction', { id: disableTarget.id });
      const res = await disableProductAction(disableTarget.id);
      console.log('🧪 [Disable] disableProductAction result', res);

      const targetId = disableTarget.id;
      setAllProducts((prev) =>
        Array.isArray(prev)
          ? prev.map((p) => (p?.id === targetId ? { ...p, active: false } : p))
          : prev
      );

      setDisableTarget(null);
      await loadAllProductsOnce();
    } catch (error) {
      console.error('❌ ปิดใช้งานสินค้าไม่สำเร็จ:', error);
    }
  };

  

  const getPrice = (p) => p.prices?.find(pr => pr.level === 1)?.price || 0;

  // ✅ กรองในฝั่ง FE เพื่อกันกรณี BE ไม่ได้กรองหรือชื่อคีย์ไม่ตรง
  // ✅ Restore-only: บังคับเทียบ id แบบตัวเลขทั้งสองฝั่ง เพื่อกันเคส "12" !== 12

  // ✅ Restore-only: ช่วย resolve id จากชื่อ (กรณี BE ส่งมาเป็น name แต่ไม่มี id/relation)
  const resolveCategoryId = (p) => {
    const direct = p?.categoryId ?? p?.category?.id;
    if (direct != null) return direct;

    // ✅ Restore-only: ถ้ามีชื่อหมวดหมู่ใน record ให้พยายาม resolve จากชื่อก่อน
    // (กันเคสที่ productType relation ชี้ผิดหมวด / legacy data)
    const name = p?.categoryName ?? p?.category?.name ?? p?.category_name;
    if (name && Array.isArray(dropdowns?.categories)) {
      const hit = dropdowns.categories.find(
        (c) => String(c?.name || '').trim() === String(name).trim()
      );
      if (hit?.id != null) return hit.id;
    }

    // ผ่าน productType relation (หลายระบบผูก category ผ่าน type)
    const viaType = p?.productType?.categoryId ?? p?.productType?.category?.id;
    if (viaType != null) return viaType;

    return undefined;
  };

  const resolveTypeId = (p) => {
    const direct = p?.productTypeId ?? p?.productType?.id ?? p?.product_type_id;
    if (direct != null) return direct;

    // fallback: resolve by name → dropdowns.productTypes
    const name = p?.productTypeName ?? p?.typeName ?? p?.productType?.name ?? p?.product_type_name;
    if (!name || !Array.isArray(dropdowns?.productTypes)) return undefined;
    const hit = dropdowns.productTypes.find((t) => String(t?.name || '').trim() === String(name).trim());
    return hit?.id;
  };

  const resolveProfileId = (p) => {
    const direct = p?.productProfileId ?? p?.productProfile?.id ?? p?.profileId ?? p?.product_profile_id;
    if (direct != null) return direct;

    // fallback: resolve by name → dropdowns.profiles/productProfiles
    const name = p?.productProfileName ?? p?.profileName ?? p?.productProfile?.name ?? p?.product_profile_name;
    const arr = dropdowns?.productProfiles ?? dropdowns?.profiles;
    if (!name || !Array.isArray(arr)) return undefined;
    const hit = arr.find((x) => String(x?.name || '').trim() === String(name).trim());
    return hit?.id;
  };

  const resolveTemplateId = (p) => {
    const direct = p?.templateId ?? p?.productTemplateId ?? p?.productTemplate?.id ?? p?.product_template_id;
    if (direct != null) return direct;

    // fallback: resolve by name → dropdowns.templates/productTemplates
    const name = p?.productTemplateName ?? p?.templateName ?? p?.productTemplate?.name ?? p?.product_template_name;
    const arr = dropdowns?.productTemplates ?? dropdowns?.templates;
    if (!name || !Array.isArray(arr)) return undefined;
    const hit = arr.find((x) => String(x?.name || '').trim() === String(name).trim());
    return hit?.id;
  };
  const toNum = (v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const matchesId = (filterVal, resolvedVal) => {
    const f = toNum(filterVal);
    // ✅ ถ้ายังไม่เลือก filter → ผ่าน
    if (f === undefined) return true;

    const r = toNum(resolvedVal);

    // ✅ Restore-only UX guard:
    // ถ้าเลือกแล้วแต่ยัง resolve ไม่ได้ *เพราะ dropdowns ยังโหลดไม่เสร็จ* → อย่าเพิ่งตัดทิ้ง (กันรายการหายวูบ)
    if (r === undefined && dropdownsLoaded !== true) return true;

    // ✅ Scoped fix (strict): ถ้าเลือกแล้ว และ resolve ไม่ได้จริง → ตัดทิ้ง
    if (r === undefined) return false;

    return r === f;
  };

  const resolveActive = (p) => {
    // ✅ normalize boolean / 0-1 / string
    const raw = p?.active ?? p?.isActive ?? p?.enabled;

    if (typeof raw === 'boolean') return raw;
    if (raw === 0 || raw === '0') return false;
    if (raw === 1 || raw === '1') return true;

    if (p?.deletedAt) return false;
    return true;
  };

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      // ✅ Restore-only: รองรับกรณี product ไม่มี categoryId ตรง แต่ผูกผ่าน type/relation หรือส่งมาเป็น name
      const resolvedCategoryId = resolveCategoryId(p);
      const okCategory = matchesId(filter.categoryId, resolvedCategoryId);

      // ✅ Restore-only: รองรับกรณี product ไม่มี productTypeId ตรง แต่ผูกผ่าน relation หรือส่งมาเป็น name
      const resolvedTypeId = resolveTypeId(p);
      const okType = matchesId(filter.productTypeId, resolvedTypeId);

      // ✅ Restore-only: บาง record อาจไม่ได้มี productProfileId ตรง แต่ผูกผ่าน relation / legacy key / name
      const resolvedProfileId = resolveProfileId(p);
      const okProfile = matchesId(filter.productProfileId, resolvedProfileId);

      // ✅ Restore-only: รองรับ key หลายแบบ (templateId / productTemplateId / productTemplate.id / name)
      const resolvedTemplateId = resolveTemplateId(p);
      const okTemplate = matchesId(filter.productTemplateId, resolvedTemplateId);

      const okMode = true; // mode filter removed

      // ✅ Active filter (default: ซ่อนของปิดใช้งาน)
      const okActive = showInactive ? true : resolveActive(p) !== false;

      const q = (committedSearchText || '').toLowerCase();
      const okSearch =
        !q ||
        (p.name?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q) ||
          // ✅ รองรับค้นหา "แบรนด์" จากชื่อ profile/brand ที่ BE ส่งมา
          (p.productProfileName || p.profileName || p.productProfile?.name || '')
            .toLowerCase()
            .includes(q));
      return okCategory && okType && okProfile && okTemplate && okMode && okActive && okSearch;
    });
  }, [allProducts, filter, committedSearchText, dropdowns, dropdownsLoaded, showInactive]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return getPrice(a) - getPrice(b);
        case 'price-desc':
          return getPrice(b) - getPrice(a);
        default:
          return 0;
      }
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    return sorted.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [sorted, currentPage, perPage]);

  // 🧪 Debug (restore-only): ดูว่าข้อมูลหายที่ขั้นไหน (products → filtered → sorted)
  useEffect(() => {
    // ✅ Step 1.5: จำกัด debug log เฉพาะ DEV เพื่อไม่ให้รบกวน Production และไม่ทำให้ browser หน่วง
    // (Vite) import.meta.env.DEV
    if (!(import.meta && import.meta.env && import.meta.env.DEV)) return;

    console.log('🧪 [ListProductPage] counts', {
      branchId,
      products: Array.isArray(allProducts) ? allProducts.length : 'not-array',
      filtered: Array.isArray(filtered) ? filtered.length : 'not-array',
      sorted: Array.isArray(sorted) ? sorted.length : 'not-array',
      paginated: Array.isArray(paginated) ? paginated.length : 'not-array',
      filter,
      committedSearchText,
    });

    // ✅ เพิ่มสรุปว่า resolve id ไม่ได้กี่รายการ (ช่วยชี้ว่า data/include relation ขาดตรงไหน)
    if (Array.isArray(allProducts) && allProducts.length > 0) {
      const stats = allProducts.reduce(
        (acc, p) => {
          const rc = toNum(resolveCategoryId(p));
          const rt = toNum(resolveTypeId(p));
          const rp = toNum(resolveProfileId(p));
          const rtp = toNum(resolveTemplateId(p));
          if (rc === undefined) acc.noResolvedCategory += 1;
          if (rt === undefined) acc.noResolvedType += 1;
          if (rp === undefined) acc.noResolvedProfile += 1;
          if (rtp === undefined) acc.noResolvedTemplate += 1;
          return acc;
        },
        { noResolvedCategory: 0, noResolvedType: 0, noResolvedProfile: 0, noResolvedTemplate: 0 }
      );
      console.log('🧪 [ListProductPage] resolveStats', stats);

      // ✅ เพิ่ม distribution ของ id ที่ resolve ได้ (ช่วยดูว่าทุกสินค้าถูก resolve ไปกองที่ id เดียวหรือไม่)
      try {
        const dist = allProducts.reduce(
          (acc, p) => {
            const rc = toNum(resolveCategoryId(p));
            const rt = toNum(resolveTypeId(p));
            const rp = toNum(resolveProfileId(p));
            const rtp = toNum(resolveTemplateId(p));
            if (rc !== undefined) acc.category[rc] = (acc.category[rc] || 0) + 1;
            if (rt !== undefined) acc.type[rt] = (acc.type[rt] || 0) + 1;
            if (rp !== undefined) acc.profile[rp] = (acc.profile[rp] || 0) + 1;
            if (rtp !== undefined) acc.template[rtp] = (acc.template[rtp] || 0) + 1;
            return acc;
          },
          { category: {}, type: {}, profile: {}, template: {} }
        );
        console.log('🧪 [ListProductPage] resolvedIdDistribution', {
          category: Object.entries(dist.category).sort((a, b) => Number(a[0]) - Number(b[0])).slice(0, 30),
          type: Object.entries(dist.type).sort((a, b) => Number(a[0]) - Number(b[0])).slice(0, 30),
          profile: Object.entries(dist.profile).sort((a, b) => Number(a[0]) - Number(b[0])).slice(0, 30),
          template: Object.entries(dist.template).sort((a, b) => Number(a[0]) - Number(b[0])).slice(0, 30),
        });
      } catch (e) {
        console.log('🧪 [ListProductPage] resolvedIdDistribution error', e);
      }
    }

    // ถ้ามีของจาก BE แต่กรองแล้วเหลือ 0 → dump ตัวอย่าง 3 ชิ้นแรกให้ดู id ที่เอามาเทียบ
    if (Array.isArray(allProducts) && allProducts.length > 0 && Array.isArray(filtered) && filtered.length === 0) {
      const sample = allProducts.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        mode: p.mode,
        // raw hints
        categoryId: p.categoryId,
        categoryName: p.categoryName ?? p.category?.name ?? p.category_name,
        productTypeId: p.productTypeId,
        productTypeName: p.productTypeName ?? p.typeName ?? p.productType?.name ?? p.product_type_name,
        productProfileId: p.productProfileId,
        productProfileName: p.productProfileName ?? p.profileName ?? p.productProfile?.name ?? p.product_profile_name,
        templateId: p.templateId,
        productTemplateId: p.productTemplateId,
        productTemplateName: p.productTemplateName ?? p.templateName ?? p.productTemplate?.name ?? p.product_template_name,
        // resolved for filtering
        resolvedCategoryId: resolveCategoryId(p),
        resolvedTypeId: resolveTypeId(p),
        resolvedProfileId: resolveProfileId(p),
        resolvedTemplateId: resolveTemplateId(p),
        // keys snapshot (ช่วยตามหาชื่อ field จริงจาก BE)
        keys: Object.keys(p || {}).slice(0, 30),
      }));
      console.log('🧪 [ListProductPage] filtered=0 sample', sample);
    }
  }, [branchId, allProducts, filtered, sorted, paginated, filter, committedSearchText]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / perPage), [filtered.length, perPage]);

  // ✅ Stats: จำนวนสินค้าที่ปิดใช้งาน (ไว้ยืนยันว่า toggle ทำงาน)
  const inactiveCount = useMemo(() => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) return 0;
    return allProducts.reduce((acc, p) => acc + (resolveActive(p) === false ? 1 : 0), 0);
  }, [allProducts]);

  // ✅ Step 1: โหลดสินค้าทั้งหมด (วนทีละหน้า) แล้วเก็บไว้ที่ allProducts
  // IMPORTANT: ต้องประกาศก่อน useEffect ที่อ้างถึง เพื่อกัน TDZ (Temporal Dead Zone)
  const loadAllProductsOnce = useCallback(async () => {
    if (!branchId) return;
    if (loadingAllRef.current) return;

    loadingAllRef.current = true;
    setLoadingAll(true);
    setLoadAllError(null);

    try {
      let page = 1;
      let acc = [];

      console.log('✅ [ListProductPage] loadAllProducts start', { branchId, TAKE, showInactive });

      while (page <= MAX_PAGES_SAFETY) {
        const pageFilters = {
          page,
          take: TAKE,
          pageSize: TAKE,
          limit: TAKE,
          // ✅ include inactive when toggle on
          includeInactive: showInactive ? 1 : 0,
          // ✅ Step 1: ไม่ส่งตัวกรอง dropdown ไป BE
          // เพื่อให้ได้รายการครบ แล้วไปกรองที่ FE
        };

        console.log('➡️ [ListProductPage] fetch page', { page, TAKE });
        await fetchProductsAction(pageFilters);

        // ✅ อ่านค่าล่าสุดจาก store หลัง fetch
        const list = useProductStore.getState().products || [];
        console.log('✅ [ListProductPage] got', { page, count: list.length });

                // ✅ Normalize: ensure `active` exists even if BE uses isActive/enabled
        const normalized = Array.isArray(list)
          ? list.map((p) => {
              const raw = p?.active ?? p?.isActive ?? p?.enabled;
              const active = typeof raw === 'boolean'
                ? raw
                : raw === 0 || raw === '0'
                  ? false
                  : raw === 1 || raw === '1'
                    ? true
                    : p?.deletedAt
                      ? false
                      : p?.status
                        ? String(p.status).toUpperCase() !== 'INACTIVE'
                        : undefined;
              return active === undefined ? p : { ...p, active };
            })
          : [];

        acc = acc.concat(normalized);
        if (list.length < TAKE) break;
        page += 1;
      }

      console.log('🏁 [ListProductPage] loadAllProducts done', { total: acc.length });
      setAllProducts(acc);
    } catch (err) {
      console.error('❌ [ListProductPage] loadAllProducts error', err);
      setAllProducts([]);
      setLoadAllError(err);
    } finally {
      setLoadingAll(false);
      loadingAllRef.current = false;
    }
  }, [branchId, fetchProductsAction, showInactive]);

  // ✅ โหลดเมื่อ branchId เปลี่ยน หรือ toggle แสดงของปิดใช้งานเปลี่ยน
  useEffect(() => {
    if (!branchId) return;
    loadAllProductsOnce();
  }, [branchId, loadAllProductsOnce]);

  // ✅ ตรวจ refresh=1 เพื่อ reload (Step 1: reload all products)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refresh = params.get('refresh');
    if (refresh && branchId) {
      loadAllProductsOnce();
      params.delete('refresh');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search, location.pathname, branchId, loadAllProductsOnce, navigate]);

  const handleFilterChange = (next) => {
    // ✅ Restore-only: CascadingFilterGroup emits partial updates; merge to avoid wiping other filters
    // ✅ Normalize ids to number|null when possible
    const normalize = (obj) => {
      const out = { ...obj };
      if ('categoryId' in out) out.categoryId = out.categoryId === '' || out.categoryId == null ? null : Number(out.categoryId);
      if ('productTypeId' in out) out.productTypeId = out.productTypeId === '' || out.productTypeId == null ? null : Number(out.productTypeId);
      if ('productProfileId' in out) out.productProfileId = out.productProfileId === '' || out.productProfileId == null ? null : Number(out.productProfileId);
      if ('productTemplateId' in out) out.productTemplateId = out.productTemplateId === '' || out.productTemplateId == null ? null : Number(out.productTemplateId);
      return out;
    };

    setFilter((prev) => ({ ...prev, ...normalize(next) }));
    setCurrentPage(1);
  };

  // 📌 (3) Debounce ช่องค้นหา 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setCommittedSearchText(searchText.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-[1400px]">
        {/* Header (โทนเดียวกับ ListProductTemplatePage) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">รายการสินค้า</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              จัดการสินค้าในระบบสต๊อก • เปลี่ยนตัวกรองแล้วแสดงผลทันทีโดยไม่เรียก API ซ้ำ
            </p>
          </div>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/products/create')} />
        </div>
        <div className="mt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800" />

        {/* Filters (Sticky สำหรับข้อมูลเยอะ) */}
        <div className="mt-4">
          <div className="sticky top-0 z-20 rounded-xl border border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="p-3 sm:p-4 flex flex-col gap-3">
              {/* ✅ Controls row: จัดให้อยู่บรรทัดเดียวบนจอใหญ่ (เหมือนภาพที่ต้องการ) */}
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:flex-wrap xl:flex-nowrap">
                {/* search */}
                <div className="w-full xl:flex-1 xl:min-w-[360px]">
                  <input
                    type="text"
                    placeholder="ค้นหาคำเรียก / แบรนด์"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>

                {/* sort */}
                <div className="w-full lg:w-[180px]">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value="name-asc">คำเรียก A-Z</option>
                    <option value="name-desc">คำเรียก Z-A</option>
                    <option value="price-asc">ราคาน้อย → มาก</option>
                    <option value="price-desc">ราคามาก → น้อย</option>
                  </select>
                </div>

                

                {/* per page */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">แสดงต่อหน้า</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border px-3 py-2 rounded"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* density */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">ความหนาแน่น</label>
                  <select
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="border px-3 py-2 rounded"
                  >
                    <option value="normal">ปกติ</option>
                    <option value="compact">กะทัดรัด</option>
                  </select>
                </div>

                {/* show all prices */}
                <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 select-none w-full lg:w-auto whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showAllPrices}
                    onChange={(e) => setShowAllPrices(e.target.checked)}
                  />
                  แสดงราคาทั้งหมด
                </label>

                {/* show inactive */}
                <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 select-none w-full lg:w-auto whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => {
                      setShowInactive(e.target.checked);
                      setCurrentPage(1);
                    }}
                  />
                  แสดงสินค้าที่ปิดใช้งาน
                </label>

                {/* hint */}
                
              </div>

              <CascadingFilterGroup value={filter} onChange={handleFilterChange} dropdowns={dropdowns} showReset />

              {/* ✅ Step 1.5: Loading/Error แบบ UI-based (ห้าม toast/alert) */}
              {loadingAll && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
                  <div className="font-semibold">กำลังโหลดรายการสินค้า…</div>
                  <div className="text-sm opacity-90">โปรดรอสักครู่ ระบบกำลังดึงข้อมูลทั้งหมดเพื่อกรองในหน้านี้</div>
                </div>
              )}

              {loadAllError && !loadingAll && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                  <div className="font-semibold">โหลดรายการสินค้าไม่สำเร็จ</div>
                  <div className="text-sm opacity-90">กรุณาลองใหม่อีกครั้ง (ระบบยังไม่เรียก API ซ้ำจาก dropdown)</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline" onClick={() => loadAllProductsOnce()}>
                      ลองใหม่
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        navigate(
                          {
                            pathname: location.pathname,
                            search: new URLSearchParams({
                              ...Object.fromEntries(new URLSearchParams(location.search)),
                              refresh: '1',
                            }).toString(),
                          },
                          { replace: true }
                        )
                      }
                    >
                      รีโหลด (refresh=1)
                    </button>
                  </div>
                </div>
              )}

              {!loadingAll && !loadAllError && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  แสดงผลจากข้อมูลที่โหลดแล้ว{' '}
                  <span className="font-medium">{allProducts.length.toLocaleString('th-TH')}</span> รายการ • พบตามเงื่อนไข{' '}
                  <span className="font-medium">{filtered.length.toLocaleString('th-TH')}</span> รายการ
                  {showInactive && (
                    <>
                      {' '}• ปิดใช้งาน{' '}
                      <span className="font-medium">{inactiveCount.toLocaleString('th-TH')}</span> รายการ
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table wrapper (โทนเดียวกับ ListProductTemplatePage) */}
        <div className="mt-4 border rounded-xl p-3 shadow-sm bg-white dark:bg-zinc-900">
          <ProductTable
            products={paginated}
            items={paginated}
            data={paginated}
            onDisable={confirmDisable}
            onEnable={confirmEnable}
            disabling={false}            enabling={!!enablingId}
            density={density}
            showAllPrices={showAllPrices}
          />

        </div>

        {/* Pagination (ก่อนหน้า/ถัดไป) */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {currentPage} / {Math.max(totalPages || 1, 1)}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              ก่อนหน้า
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage >= (totalPages || 1)}
            >
              ถัดไป
            </button>
          </div>
        </div>

        <ConfirmDeleteDialog
          open={!!disableTarget}
          onClose={() => setDisableTarget(null)}
          onConfirm={handleDisable}
          itemLabel={disableTarget?.name || 'ไม่พบคำเรียกสินค้า'}
          name="ยืนยันการปิดใช้งานสินค้า"
          description={`คุณแน่ใจว่าต้องการปิดใช้งาน “${disableTarget?.name || 'ไม่พบคำเรียกสินค้า'}” หรือไม่?\n\nหมายเหตุ: การปิดใช้งานจะไม่ลบข้อมูลถาวร และสามารถเปิดใช้งานกลับได้ในอนาคต`}
        />

      </div>
    </div>
  );
}













