//  src/features/product/pages/ListProductPage.jsx
import { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct } from '../api/productApi';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDeleteDialog from '@/components/shared/dialogs/ConfirmDeleteDialog';
import useEmployeeStore from '@/store/employeeStore';
import apiClient from '@/utils/apiClient';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import CascadingFilterGroup from '@/components/shared/form/CascadingFilterGroup';

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
  const perPage = 10;

  const branch = useEmployeeStore((state) => state.branch);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!branch?.id) return;
      try {
        const data = await getAllProducts(branch.id);
        setProducts(data);
      } catch (error) {
        console.error('❌ ไม่สามารถโหลดสินค้าได้:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [branch?.id]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await apiClient.get(`/products/dropdowns?branchId=${branch?.id}`);
        setDropdowns({
          categories: res.data.categories || [],
          productTypes: res.data.productTypes || [],
          productProfiles: res.data.productProfiles || [],
          templates: res.data.templates || [],
        });
      } catch (error) {
        console.error('❌ โหลด dropdown ไม่สำเร็จ:', error);
      }
    };
    if (branch?.id) fetchDropdowns();
  }, [branch?.id]);

  const confirmDelete = (prod) => setDeleteTarget(prod);

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id, branch.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('❌ ลบสินค้าไม่สำเร็จ:', error);
    }
  };

  const getPrice = (p) => p.prices?.find(pr => pr.level === 1)?.price || 0;

  const filtered = products.filter(p => {
    const matchesBranch = p.branchId === branch.id;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter.categoryId ? p.categoryId === parseInt(filter.categoryId) : true;
    const matchesType = filter.productTypeId ? p.productTypeId === parseInt(filter.productTypeId) : true;
    const matchesProfile = filter.productProfileId ? p.productProfileId === parseInt(filter.productProfileId) : true;
    const matchesTemplate = filter.templateId ? p.templateId === parseInt(filter.templateId) : true;
    return matchesBranch && matchesSearch && matchesCategory && matchesType && matchesProfile && matchesTemplate;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOrder) {
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
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

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-zinc-800">
            <th className="p-2 border">#</th>
            <th className="p-2 border">ชื่อสินค้า</th>
            <th className="p-2 border">ราคาขาย (ปลีก)</th>
            <th className="p-2 border">จำนวน</th>
            <th className="p-2 border">สถานะ</th>
            <th className="p-2 border">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((prod, index) => (
            <tr key={prod.id} className="border-t">
              <td className="p-2 border text-center">
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className="p-2 border">
                <Link
                  to={`/pos/products/${prod.id}`}
                  className="text-blue-700 hover:underline"
                >
                  {prod.title}
                </Link>
              </td>
              <td className="p-2 border text-right">
                ฿{getPrice(prod).toFixed(2)}
              </td>
              <td className="p-2 border text-center">
                {prod.quantity ?? '-'}
              </td>
              <td className="p-2 border text-center">
                {prod.active ? '✅ เปิดใช้งาน' : '❌ ปิดใช้งาน'}
              </td>
              <td className="p-2 border text-center space-x-2">
                <Link
                  to={`/pos/products/${prod.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  แก้ไข
                </Link>
                <button
                  onClick={() => confirmDelete(prod)}
                  className="text-red-600 hover:underline"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
