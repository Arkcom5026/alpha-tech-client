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
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Page,
  PageHeader,
  Stack,
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

  const canGoNext = Number(page || 1) * Number(limit || 1) < Number(total || 0);

  return (
    <Page>
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader
          title="รายการหมวดหมู่สินค้า"
          description="จัดการหมวดหมู่ที่ใช้จัดกลุ่มสินค้าในสาขาปัจจุบัน"
          actions={
            canManage ? (
              <Button onClick={() => navigate('create')}>เพิ่มหมวดหมู่</Button>
            ) : null
          }
        />

        <Stack gap={4}>
          <Card>
            <CardBody>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  type="search"
                  placeholder="ค้นหาหมวดหมู่..."
                  value={search}
                  onChange={(event) => setSearchAction(event.target.value)}
                  className="sm:max-w-md"
                />
                <Button variant="secondary" onClick={refreshAction} disabled={loading}>
                  รีเฟรช
                </Button>
              </div>
            </CardBody>
          </Card>

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

          <div className="flex flex-col gap-3 text-sm text-[hsl(var(--ads-text-muted))] sm:flex-row sm:items-center sm:justify-between">
            <span>{paginationText}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPageAction(page - 1)}
              >
                ก่อนหน้า
              </Button>
              <span className="min-w-20 text-center text-[hsl(var(--ads-text-default))]">
                หน้า {page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || !canGoNext}
                onClick={() => setPageAction(page + 1)}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </Stack>
      </div>
    </Page>
  );
};

export default ListCategoryPage;
