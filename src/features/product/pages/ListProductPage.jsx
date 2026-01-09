

  // ✅ src/features/product/pages/ListProductPage.jsx
  import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

  import { useLocation } from 'react-router-dom';
  import { useNavigate } from 'react-router-dom';
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
      mode: '', // '' | 'SIMPLE' | 'STRUCTURED'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const perPage = 10;

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
      deleteProduct,
      dropdowns,
      dropdownsLoaded,
      ensureDropdownsAction,
      refreshProductList,
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
      const mode = params.get('mode') || '';

      if (q) {
        setSearchText(q);
        setCommittedSearchText(q);
      }
      if (s) setSortOrder(s);

      // ✅ Store ids as numbers/null
      setFilter((prev) => ({
        ...prev,
        categoryId: cat ? Number(cat) : null,
        productTypeId: type ? Number(type) : null,
        productProfileId: prof ? Number(prof) : null,
        productTemplateId: tpl ? Number(tpl) : null,
        mode,
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
      if (filter.mode) params.set('mode', String(filter.mode));
      if (committedSearchText) params.set('q', committedSearchText);
      if (sortOrder && sortOrder !== 'name-asc') params.set('sort', sortOrder);

      const nextSearch = params.toString();
      const currSearch = new URLSearchParams(location.search).toString();
      if (nextSearch !== currSearch) {
        navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
      }
    }, [filter, committedSearchText, sortOrder, navigate, location.pathname, location.search]);


    const confirmDelete = (prodId) => {
      const target = allProducts.find((p) => p.id === prodId);
      if (target) setDeleteTarget(target);
    };

    const handleDelete = async () => {
      if (!deleteTarget?.id) return; // 🧹 ตัดการเช็ค branch ตามที่ตกลง
      try {
        await deleteProduct(deleteTarget.id);
        setDeleteTarget(null);
      } catch (error) {
        console.error('❌ ลบสินค้าไม่สำเร็จ:', error);
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

        const okMode = !filter.mode || p.mode === filter.mode;
        const q = (committedSearchText || '').toLowerCase();
        const okSearch = !q || (p.name?.toLowerCase().includes(q) || p.model?.toLowerCase().includes(q));
        return okCategory && okType && okProfile && okTemplate && okMode && okSearch;
      });
    }, [allProducts, filter, committedSearchText, dropdowns, dropdownsLoaded]);

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

        console.log('✅ [ListProductPage] loadAllProducts start', { branchId, TAKE });

        while (page <= MAX_PAGES_SAFETY) {
          const pageFilters = {
            page,
            take: TAKE,
            pageSize: TAKE,
            limit: TAKE,
            // ✅ Step 1: ไม่ส่งตัวกรอง dropdown ไป BE
            // เพื่อให้ได้รายการครบ แล้วไปกรองที่ FE
          };

          console.log('➡️ [ListProductPage] fetch page', { page, TAKE });
          await fetchProductsAction(pageFilters);

          // ✅ อ่านค่าล่าสุดจาก store หลัง fetch
          const list = useProductStore.getState().products || [];
          console.log('✅ [ListProductPage] got', { page, count: list.length });

          acc = acc.concat(list);
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
    }, [branchId, fetchProductsAction]);

    // ✅ โหลดครั้งเดียวต่อ branchId
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
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">รายการสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/products/create')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            type="text"
            placeholder="ค้นหาคำเรียก / แบรนด์ / SKU"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />

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

          {/* ตัวกรองโหมดสินค้า (SIMPLE/STRUCTURED) */}
          <select
            value={filter.mode}
            onChange={(e) => handleFilterChange({ mode: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- เลือกโหมดสินค้า --</option>
            <option value="SIMPLE">นับตามจำนวน (SIMPLE)</option>
            <option value="STRUCTURED">มี SN รายชิ้น (STRUCTURED)</option>
          </select>
        </div>

        <CascadingFilterGroup
          value={filter}
          onChange={handleFilterChange}
          dropdowns={dropdowns}
          showReset
        />

        {/* ✅ Step 1.5: Loading/Error แบบ UI-based (ห้าม toast/alert) */}
        {loadingAll && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
            <div className="font-semibold">กำลังโหลดรายการสินค้า…</div>
            <div className="text-sm opacity-90">โปรดรอสักครู่ ระบบกำลังดึงข้อมูลทั้งหมดเพื่อกรองในหน้านี้</div>
          </div>
        )}

        {loadAllError && !loadingAll && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <div className="font-semibold">โหลดรายการสินค้าไม่สำเร็จ</div>
            <div className="text-sm opacity-90">กรุณาลองใหม่อีกครั้ง (ระบบยังไม่เรียก API ซ้ำจาก dropdown)</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                onClick={() => loadAllProductsOnce()}
              >
                ลองใหม่
              </button>
              <button
                type="button"
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                onClick={() => navigate({ pathname: location.pathname, search: new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(location.search)), refresh: '1' }).toString() }, { replace: true })}
              >
                รีโหลด (refresh=1)
              </button>
            </div>
          </div>
        )}

        {!loadingAll && !loadAllError && (
          <div className="mt-4 text-sm text-zinc-600">
            แสดงผลจากข้อมูลที่โหลดแล้ว{' '}
            <span className="font-medium">{allProducts.length.toLocaleString('th-TH')}</span> รายการ • พบตามเงื่อนไข{' '}
            <span className="font-medium">{filtered.length.toLocaleString('th-TH')}</span> รายการ
          </div>
        )}

        <ProductTable
          products={paginated}
          items={paginated} // compat: เผื่อ component ใช้ prop ชื่อ items
          data={paginated}  // compat: เผื่อ component ใช้ prop ชื่อ data
          onDelete={confirmDelete}
          deleting={false}
        />

        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1 ? 'bg-blue-600 text-white' : ''
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          itemLabel={deleteTarget?.name || 'ไม่พบคำเรียกสินค้า'}
          name="ยืนยันการลบสินค้า"
          description={`คุณแน่ใจว่าต้องการลบ “${deleteTarget?.name || 'ไม่พบคำเรียกสินค้า'}” หรือไม่?`}
        />
      </div>
    );
  }



  