// src/features/productType/pages/ListProductTypePage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductTypeTable from '../components/ProductTypeTable.jsx';

import {
  Card,
  CardBody,
  CrudPage,
  CrudPagination,
  CrudPrimaryAction,
  CrudToolbar,
  ErrorState,
  Input,
  Select,
} from '@/design-system';
import useProductTypeStore from '../store/productTypeStore.js';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const ListProductTypePage = () => {
  const [isHydratedFromUrl, setIsHydratedFromUrl] = React.useState(false);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const { canManageProductOrdering, isSuperAdmin } = useAuthStore();
  const canManage = isSuperAdmin || canManageProductOrdering();

  const {
    items,
    page,
    limit,
    total,
    totalPages,
    search,
    includeInactive,
    isLoading,
    error,
    setPageAction,
    setLimitAction,
    setSearchAction,
    setIncludeInactiveAction,
    fetchListAction,
  } = useProductTypeStore();

  React.useEffect(() => {
    const nextPage = Math.max(Number(params.get('page') || 1), 1);
    const nextLimit = Math.max(Number(params.get('limit') || 20), 1);
    const nextSearch = params.get('search') || '';
    const nextIncludeInactive = params.get('includeInactive') === 'true';

    setPageAction(nextPage);
    setLimitAction(nextLimit);
    setSearchAction(nextSearch);
    setIncludeInactiveAction(nextIncludeInactive);
    setIsHydratedFromUrl(true);
    // URL parameters are intentionally read once when entering the page.
    // Subsequent changes are driven by the store and synchronized below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isHydratedFromUrl) return;
    fetchListAction();
  }, [isHydratedFromUrl, page, limit, search, includeInactive, fetchListAction]);

  React.useEffect(() => {
    if (!isHydratedFromUrl) return;

    const next = new URLSearchParams(params);
    next.set('page', String(page));
    next.set('limit', String(limit));

    if (search) next.set('search', search);
    else next.delete('search');

    if (includeInactive) next.set('includeInactive', 'true');
    else next.delete('includeInactive');

    next.delete('categoryId');

    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [isHydratedFromUrl, page, limit, search, includeInactive, params, setParams]);

  const handleEdit = (row) => navigate(`edit/${row.id}`);
  const handleCreate = () => navigate('create');

  return (
    <CrudPage
      title="จัดการประเภทสินค้า"
      description="เรียกดูและจัดการประเภทสินค้าที่ใช้ในระบบสต็อก"
      actions={
        canManage ? (
          <CrudPrimaryAction onClick={handleCreate}>เพิ่มประเภทสินค้า</CrudPrimaryAction>
        ) : null
      }
      maxWidth="6xl"
    >
      <CrudToolbar columns="auto" bodyClassName="lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
        <label className="flex min-w-0 flex-col gap-1 text-sm text-[hsl(var(--ads-text-muted))]">
          <span>ค้นหา</span>
          <Input
            value={search}
            onChange={(event) => {
              setSearchAction(event.target.value);
              setPageAction(1);
            }}
            placeholder="ค้นหาชื่อประเภทสินค้า"
          />
        </label>

        <label className="inline-flex min-h-10 items-center gap-2 text-sm text-[hsl(var(--ads-text-default))]">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[hsl(var(--ads-border-default))] accent-[hsl(var(--ads-brand))]"
            checked={Boolean(includeInactive)}
            onChange={(event) => {
              setIncludeInactiveAction(event.target.checked);
              setPageAction(1);
            }}
          />
          แสดงข้อมูลที่ถูกปิดใช้งานด้วย
        </label>

        <label className="flex flex-col gap-1 text-sm text-[hsl(var(--ads-text-muted))]">
          <span>แถวต่อหน้า</span>
          <Select
            value={limit}
            onChange={(event) => {
              setLimitAction(Number(event.target.value));
              setPageAction(1);
            }}
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>
      </CrudToolbar>

      {error ? (
        <ErrorState
          title="ไม่สามารถโหลดประเภทสินค้าได้"
          description={typeof error === 'string' ? error : 'กรุณาลองใหม่อีกครั้ง'}
          actionLabel="ลองใหม่"
          onAction={fetchListAction}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <ProductTypeTable
              data={items || []}
              loading={isLoading}
              error={null}
              page={page}
              limit={limit}
              canManage={canManage}
              onEdit={canManage ? handleEdit : undefined}
            />
          </CardBody>
        </Card>
      )}

      <CrudPagination
        page={page}
        totalPages={Math.max(Number(totalPages || 1), 1)}
        onPageChange={setPageAction}
        disabled={isLoading}
        summary={`${Number(total || 0)} รายการ`}
      />
    </CrudPage>
  );
};

export default ListProductTypePage;
