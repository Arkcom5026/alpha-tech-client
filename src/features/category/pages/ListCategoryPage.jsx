// src/features/category/pages/ListCategoryPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import CategoryTable from '../components/CategoryTable';
import { useCategoryStore } from '../Store/CategoryStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  Button,
  Card,
  CardBody,
  CrudPage,
  CrudPagination,
  CrudPrimaryAction,
  CrudToolbar,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
} from '@/design-system';

const ListCategoryPage = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = isSuperAdmin || canManageProductOrdering;

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

  useEffect(() => {
    fetchListAction();
  }, [page, search, fetchListAction]);

  const handleEdit = (category) => {
    if (!canManage) return;
    navigate(`edit/${category.id}`);
  };

  const paginationText = (() => {
    if (!total) return 'ยังไม่มีรายการ';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `${start}–${end} / ${total}`;
  })();

  const totalPages = Math.max(1, Math.ceil(Number(total || 0) / Number(limit || 1)));

  return (
    <CrudPage
      title="รายการหมวดหมู่สินค้า"
      description="จัดการหมวดหมู่ที่ใช้จัดกลุ่มสินค้าในสาขาปัจจุบัน"
      maxWidth="4xl"
      actions={
        canManage ? (
          <CrudPrimaryAction onClick={() => navigate('create')}>เพิ่มหมวดหมู่</CrudPrimaryAction>
        ) : null
      }
    >
      <CrudToolbar
        columns="single"
        actions={
          <Button variant="secondary" onClick={refreshAction} disabled={loading}>
            รีเฟรช
          </Button>
        }
      >
        <Input
          type="search"
          placeholder="ค้นหาหมวดหมู่..."
          value={search}
          onChange={(event) => setSearchAction(event.target.value)}
          className="sm:max-w-md"
        />
      </CrudToolbar>

      {error ? (
        <ErrorState
          title="โหลดรายการหมวดหมู่ไม่สำเร็จ"
          description={String(error)}
          actionLabel="ลองใหม่"
          onAction={refreshAction}
        />
      ) : null}

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingState label="กำลังโหลดรายการหมวดหมู่…" />
        ) : items.length === 0 ? (
          <CardBody>
            <EmptyState
              title={search ? 'ไม่พบหมวดหมู่ที่ค้นหา' : 'ยังไม่มีหมวดหมู่สินค้า'}
              description={
                search
                  ? 'ลองเปลี่ยนคำค้นหา หรือรีเฟรชข้อมูลอีกครั้ง'
                  : 'เริ่มสร้างหมวดหมู่เพื่อใช้จัดกลุ่มสินค้าในระบบ'
              }
              actionLabel={!search && canManage ? 'เพิ่มหมวดหมู่' : undefined}
              onAction={!search && canManage ? () => navigate('create') : undefined}
            />
          </CardBody>
        ) : (
          <CategoryTable data={items} onEdit={canManage ? handleEdit : undefined} />
        )}
      </Card>

      <CrudPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPageAction}
        disabled={loading}
        summary={paginationText}
      />
    </CrudPage>
  );
};

export default ListCategoryPage;
