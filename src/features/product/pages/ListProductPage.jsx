
  // ✅ src/features/product/pages/ListProductPage.jsx
  import { useEffect, useState } from 'react';
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
      categoryId: '',
      productTypeId: '',
      productProfileId: '',
      productTemplateId: '',
      mode: '', // '' | 'SIMPLE' | 'STRUCTURED'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [hasFiltered, setHasFiltered] = useState(false);
    const perPage = 10;

    const branchId = useBranchStore((state) => state.selectedBranchId);
    const navigate = useNavigate();
    const location = useLocation();

    const {
      products,
      fetchProductsAction,
      deleteProduct,
      dropdowns,
      ensureDropdownsAction,
      refreshProductList,
    } = useProductStore();

    // โหลด dropdowns ครั้งเดียวเมื่อเข้าหน้า
    useEffect(() => {
      ensureDropdownsAction();
    }, [ensureDropdownsAction]);

    // 📌 (1) อ่านค่าจาก URL มาตั้งค่าเริ่มต้น (Deep-linkable)
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      const s = params.get('sort') || 'name-asc';

      const nextFilter = {
        categoryId: params.get('categoryId') || '',
        productTypeId: params.get('productTypeId') || '',
        productProfileId: params.get('productProfileId') || '',
        productTemplateId: params.get('productTemplateId') || '',
        mode: params.get('mode') || '',
      };

      if (q) {
        setSearchText(q);
        setCommittedSearchText(q);
      }
      if (s) setSortOrder(s);
      // merge เฉพาะค่าที่มีใน URL
      setFilter((prev) => ({ ...prev, ...nextFilter }));

      if (q || Object.values(nextFilter).some(Boolean)) {
        setHasFiltered(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 📌 (2) ซิงก์ state → URL เมื่อเริ่มกรองแล้ว
    useEffect(() => {
      if (!hasFiltered) return;
      const params = new URLSearchParams();
      if (filter.categoryId) params.set('categoryId', String(filter.categoryId));
      if (filter.productTypeId) params.set('productTypeId', String(filter.productTypeId));
      if (filter.productProfileId) params.set('productProfileId', String(filter.productProfileId));
      if (filter.productTemplateId) params.set('productTemplateId', String(filter.productTemplateId));
      if (filter.mode) params.set('mode', String(filter.mode));
      if (committedSearchText) params.set('q', committedSearchText);
      if (sortOrder && sortOrder !== 'name-asc') params.set('sort', sortOrder);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }, [filter, committedSearchText, sortOrder, hasFiltered, navigate, location.pathname]);

    const confirmDelete = (prodId) => {
      const target = products.find(p => p.id === prodId);
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
    const toNum = (v) => (v === '' || v == null ? undefined : Number(v));
    const filtered = products.filter((p) => {
      const okCategory  = !filter.categoryId       || p.categoryId       === toNum(filter.categoryId);
      const okType      = !filter.productTypeId    || p.productTypeId    === toNum(filter.productTypeId);
      const okProfile   = !filter.productProfileId || p.productProfileId === toNum(filter.productProfileId);
      // BE ส่งกลับเป็น templateId เสมอ → map ให้เทียบกับ productTemplateId บน FE
      const okTemplate  = !filter.productTemplateId || p.templateId === toNum(filter.productTemplateId);
      const okMode      = !filter.mode || p.mode === filter.mode;
      const q = (committedSearchText || '').toLowerCase();
      const okSearch    = !q || (p.name?.toLowerCase().includes(q) || p.model?.toLowerCase().includes(q));
      return okCategory && okType && okProfile && okTemplate && okMode && okSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
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

    const paginated = sorted.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    );

    const totalPages = Math.ceil(filtered.length / perPage);

    // ✅ ตรวจ refresh=1 เพื่อ reload
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const refresh = params.get('refresh');
      if (refresh && branchId) {
        const filters = {
          categoryId: filter.categoryId || undefined,
          productTypeId: filter.productTypeId || undefined,
          productProfileId: filter.productProfileId || undefined,
          productTemplateId: filter.productTemplateId || undefined,
          mode: filter.mode || undefined,
          search: committedSearchText || undefined,
        };
        refreshProductList(filters);
        params.delete('refresh');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      }
    }, [location.search, location.pathname, branchId, filter, committedSearchText, refreshProductList, navigate]);

    useEffect(() => {
      if (!branchId || !hasFiltered) return;
      const filters = {
          categoryId: filter.categoryId || undefined,
          productTypeId: filter.productTypeId || undefined,
          productProfileId: filter.productProfileId || undefined,
          productTemplateId: filter.productTemplateId || undefined,
          mode: filter.mode || undefined,
          search: committedSearchText || undefined,
        };
      fetchProductsAction(filters);
    }, [branchId, filter, committedSearchText, hasFiltered, fetchProductsAction]);

    const handleSearchKeyDown = (e) => {
      if (e.key === 'Enter') {
        setCommittedSearchText(searchText);
        setHasFiltered(true);
        setCurrentPage(1);
      }
    };

    const handleFilterChange = (newFilter) => {
      setFilter(newFilter);
      setHasFiltered(true);
      setCurrentPage(1);
    };

    // 📌 (3) Debounce ช่องค้นหา 300ms
    useEffect(() => {
      if (!hasFiltered) return; // ยังไม่เริ่มกรอง ไม่ต้องยิง
      const t = setTimeout(() => {
        setCommittedSearchText(searchText.trim());
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(t);
    }, [searchText, hasFiltered]);

    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">รายการสินค้า</h1>
          <StandardActionButtons onAdd={() => navigate('/pos/stock/products/create')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="border px-3 py-2 rounded w-full"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="name-asc">ชื่อสินค้า A-Z</option>
            <option value="name-desc">ชื่อสินค้า Z-A</option>
            <option value="price-asc">ราคาน้อย → มาก</option>
            <option value="price-desc">ราคามาก → น้อย</option>
          </select>

          {/* ตัวกรองรูปแบบสินค้า (SIMPLE/STRUCTURED) */}
          <select
            value={filter.mode}
            onChange={(e) => handleFilterChange({ ...filter, mode: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- เลือกรูปแบบสินค้า --</option>
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
          itemLabel={deleteTarget?.name}
          name="ยืนยันการลบสินค้า"
          description={`คุณแน่ใจว่าต้องการลบ “${deleteTarget?.name}” หรือไม่?`}
        />
      </div>
    );
  }






