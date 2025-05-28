//  src/features/product/pages/ListProductPage.jsx
import { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct, getProductDropdowns } from '../api/productApi';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';
import useEmployeeStore from '@/store/employeeStore';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';
import ProductTable from '../components/ProductTable';

export default function ListProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [filter, setFilter] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  });
  const [dropdowns, setDropdowns] = useState({
    categories: [],
    productTypes: [],
    productProfiles: [],
    templates: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const perPage = 10;

  const branch = useEmployeeStore((state) => state.branch);
  const branchId = branch?.id;
  const navigate = useNavigate();

  const confirmDelete = (prodId) => {
    const target = products.find(p => p.id === prodId);
    if (target) setDeleteTarget(target);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id || !branch?.id) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id, branch.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('❌ ลบสินค้าไม่สำเร็จ:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getPrice = (p) => p.prices?.find(pr => pr.level === 1)?.price || 0;

  const filtered = products.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes((search || '').toLowerCase());
    const matchesCategory = filter.categoryId ? p.categoryId === parseInt(filter.categoryId) : true;
    const matchesType = filter.productTypeId ? p.productTypeId === parseInt(filter.productTypeId) : true;
    const matchesProfile = filter.productProfileId ? p.productProfileId === parseInt(filter.productProfileId) : true;
    const matchesTemplate = filter.templateId ? p.templateId === parseInt(filter.templateId) : true;
    return matchesSearch && matchesCategory && matchesType && matchesProfile && matchesTemplate;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOrder) {
      case 'name-asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'name-desc':
        return (b.title || '').localeCompare(a.title || '');
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

    const fetchData = async () => {
      try {
        const [productsData, dropdownData] = await Promise.all([
          getAllProducts(branchId),
          getProductDropdowns(branchId)
        ]);
        setProducts(productsData);
        setDropdowns(dropdownData);
      } catch (error) {
        console.error('❌ ไม่สามารถโหลดสินค้าได้:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branchId]);

  if (loading) return <p>กำลังโหลดรายการสินค้า...</p>;

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

      <CascadingFilterGroup
        value={filter}
        onChange={setFilter}
        dropdowns={dropdowns}
        className="mb-4"
        showReset
        placeholders={{
          category: 'เลือกหมวดหมู่',
          productType: 'เลือกประเภท',
          productProfile: 'เลือกลักษณะสินค้า',
          template: 'เลือกรูปแบบสินค้า',
        }}
      />

      <ProductTable
        products={paginated}
        onDelete={confirmDelete}
        deleting={deleting}
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
        title="ยืนยันการลบสินค้า"
        description={`คุณแน่ใจว่าต้องการลบ “${deleteTarget?.title}” หรือไม่?`}
      />
    </div>
  );
}
