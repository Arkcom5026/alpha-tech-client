// ✅ src/features/product/pages/ListProductPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import ProductTable from '../components/ProductTable';
import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

export default function ListProductPage() {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const perPage = 10;

  const branchId = useBranchStore((state) => state.selectedBranchId);
  const navigate = useNavigate();

  const {
    products,
    isLoading,
    fetchProducts,
    deleteProduct,
  } = useProductStore();

  const confirmDelete = (prodId) => {
    const target = products.find(p => p.id === prodId);
    if (target) setDeleteTarget(target);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id || !branchId) return;
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error('❌ ลบสินค้าไม่สำเร็จ:', error);
    }
  };

  const getPrice = (p) => p.prices?.find(pr => pr.level === 1)?.price || 0;

  const filtered = products.filter(p => {
    const matchesBranch = p.branchId === branchId;
    const matchesSearch = (p.name || '').toLowerCase().includes((search || '').toLowerCase());
    const matchesCategory = filter.categoryId ? p.categoryId === parseInt(filter.categoryId) : true;
    const matchesType = filter.productTypeId ? p.productTypeId === parseInt(filter.productTypeId) : true;
    const matchesProfile = filter.productProfileId ? p.productProfileId === parseInt(filter.productProfileId) : true;
    const matchesTemplate = filter.templateId ? p.templateId === parseInt(filter.templateId) : true;
    return matchesBranch && matchesSearch && matchesCategory && matchesType && matchesProfile && matchesTemplate;
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

  useEffect(() => {
    if (!branchId) return;
    fetchProducts({ branchId }).then(() => {
      const state = useProductStore.getState();
      const filtered = state.products.filter(p => p.branchId === branchId);
      const pageItems = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
    });
  }, [branchId]);

  if (isLoading) return <p>กำลังโหลดรายการสินค้า...</p>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">รายการสินค้า</h1>
        <StandardActionButtons onAdd={() => navigate('/pos/stock/products/create')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      </div>

      <ProductTable
        products={paginated}
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
        name="ยืนยันการลบสินค้า"
        description={`คุณแน่ใจว่าต้องการลบ “${deleteTarget?.name}” หรือไม่?`}
      />
    </div>
  );
}
