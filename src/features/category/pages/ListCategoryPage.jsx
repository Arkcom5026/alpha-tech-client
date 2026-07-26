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
  Select,
} from '@/design-system';

const ListCategoryPage = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = Boolean(isSuperAdmin || canManageProductOrdering);

  const {
    items,
    total,
    page,
    limit,
    loading,
    submitting,
    error,
    search,
    includeInactive,
    setSearchAction,
    setPageAction,
    setLimitAction,
    setIncludeInactiveAction,
    fetchListAction,
    refreshAction,
  } = useCategoryStore();

  useEffect(() => {
    fetchListAction();
  }, [page, limit, search, includeInactive, fetchListAction]);

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
  const hasFilters = Boolean(search) || !includeInactive;

  return (
    <CrudPage
      title="รายการหมวดหมู่สินค้า"
      description="จัดการหมวดหมู่ที่ใช้จัดกลุ่มสินค้าในสาขาปัจจุบัน"
      maxWidth="5xl"
      actions={
        canManage ? (
          <CrudPrimaryAction onClick={() => navigate('create')} disabled={submitting}>
            เพิ่มหมวดหมู่
          </CrudPrimaryAction>
        ) : null
      }
    >
      <CrudToolbar
        columns="auto"
        bodyClassName="md:grid-cols-[minmax(0,1fr)_240px_160px_auto] md:items-center"
      >
        <Input
          type="search"
          placeholder="ค้นหาหมวดหมู่..."
          value={search}
          onChange={(event) => setSearchAction(event.target.value)}
        />

        <Select
          value={includeInactive ? 'all' : 'active'}
          onChange={(event) => setIncludeInactiveAction(event.target.value === 'all')}
        >
          <option value="all">แสดงทั้งหมด</option>
          <option value="active">เฉพาะที่ใช้งานอยู่</option>
        </Select>

        <Select value={limit} onChange={(event) => setLimitAction(Number(event.target.value))}>
          <option value={10}>10 / หน้า</option>
          <option value={20}>20 / หน้า</option>
          <option value={50}>50 / หน้า</option>
          <option value={100}>100 / หน้า</option>
        </Select>

        <Button variant="secondary" onClick={refreshAction} disabled={loading || submitting}>
          รีเฟรช
        </Button>
      </CrudToolbar>

      {error ? (
        <ErrorState
          title="โหลดรายการหมวดหมู่ไม่สำเร็จ"
          description={String(error)}
          actionLabel="ลองใหม่"
          onAction={refreshAction}
        />
      ) : (
        <Card className="overflow-hidden">
          {loading && items.length === 0 ? (
            <LoadingState label="กำลังโหลดรายการหมวดหมู่…" />
          ) : items.length === 0 ? (
            <CardBody>
              <EmptyState
                title={hasFilters ? 'ไม่พบหมวดหมู่ที่ตรงกับเงื่อนไข' : 'ยังไม่มีหมวดหมู่สินค้า'}
                description={
                  hasFilters
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ แล้วรีเฟรชข้อมูลอีกครั้ง'
                    : 'เริ่มสร้างหมวดหมู่เพื่อใช้จัดกลุ่มสินค้าในระบบ'
                }
                actionLabel={!hasFilters && canManage ? 'เพิ่มหมวดหมู่' : undefined}
                onAction={!hasFilters && canManage ? () => navigate('create') : undefined}
              />
            </CardBody>
          ) : (
            <CategoryTable
              data={items}
              page={page}
              limit={limit}
              total={total}
              canManage={canManage}
              disabled={loading || submitting}
              onEdit={handleEdit}
            />
          )}
        </Card>
      )}

      {!error ? (
        <CrudPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPageAction}
          disabled={loading || submitting}
          summary={paginationText}
        />
      ) : null}
    </CrudPage>
  );
};

export default ListCategoryPage;
