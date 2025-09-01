// ✅ src/features/category/pages/ListCategoryPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryTable from '../components/CategoryTable';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { useCategoryStore } from '../Store/CategoryStore';

const roleIsAdminOrSuper = () => {
  const role = (localStorage.getItem('role') || '').toLowerCase();
  return role === 'admin' || role === 'supperadmin' || role === 'superadmin';
};

const ListCategoryPage = () => {
  const navigate = useNavigate();
  const isAdmin = roleIsAdminOrSuper();

  const {
    items,
    total,
    page,
    limit,
    loading,
    error,
    search,
    setSearchAction,
    setPageAction,
    fetchListAction,
    refreshAction,
  } = useCategoryStore();

  // โหลดรายการตาม page/search
  useEffect(() => {
    fetchListAction();
  }, [page, search, fetchListAction]);

  const handleEdit = (category) => {
    navigate(`edit/${category.id}`);
  };

  const paginationText = (() => {
    if (!total) return '';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `${start}–${end} / ${total}`;
  })();

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white">รายการหมวดหมู่สินค้า</h2>
          {isAdmin && (
            <StandardActionButtons onAdd={() => navigate('create')} />
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่..."
            value={search}
            onChange={(e) => setSearchAction(e.target.value)}
            className="border px-3 py-2 rounded min-w-[300px]"
          />
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={refreshAction}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {(error) && (
          <div className="mb-3 p-3 rounded border bg-rose-50 border-rose-200 text-sm text-rose-800">
            {error}
          </div>
        )}

        <CategoryTable data={items} onEdit={handleEdit} />

        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <span>{paginationText}</span>
          <div className="inline-flex border rounded overflow-hidden">
            <button
              className="px-3 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPageAction(page - 1)}
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-1 border-l border-r">หน้า {page}</span>
            <button
              className="px-3 py-1"
              onClick={() => setPageAction(page + 1)}
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCategoryPage;
