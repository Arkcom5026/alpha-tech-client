// src/features/productType/pages/ListProductTypePage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductTypeTable from '../components/ProductTypeTable.jsx';

import {
  Button,
  Card,
  CardBody,
  EmptyState,
  ErrorState,
  Page,
  PageHeader,
  Select,
  Stack,
} from '@/design-system';
import useProductTypeStore from '../store/productTypeStore.js';
import { useAuthStore } from '@/features/auth/store/authStore.js';

const ListProductTypePage = () => {
  const [hasSearched, setHasSearched] = React.useState(false);
  const didFetchRef = React.useRef(false);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const { canManageProductOrdering, isSuperAdmin } = useAuthStore();
  const canManage = isSuperAdmin || canManageProductOrdering();

  const {
    items,
    page,
    limit,
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
    const p = Number(params.get('page') || 1);
    const s = params.get('search') || '';
    const inc = params.get('includeInactive') === 'true';

    setPageAction(p);
    setSearchAction(s);
    setIncludeInactiveAction(inc);
  }, [params, setPageAction, setSearchAction, setIncludeInactiveAction]);

  React.useEffect(() => {
    if (!hasSearched || didFetchRef.current) return;

    didFetchRef.current = true;
    fetchListAction();
  }, [hasSearched, fetchListAction]);

  React.useEffect(() => {
    if (!hasSearched) return;

    const next = new URLSearchParams(params);
    next.set('page', String(page));

    if (search) next.set('search', search);
    else next.delete('search');

    if (includeInactive) next.set('includeInactive', 'true');
    else next.delete('includeInactive');

    next.delete('categoryId');

    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [hasSearched, page, search, includeInactive, params, setParams]);

  const handleEdit = (row) => navigate(`edit/${row.id}`);
  const handleCreate = () => navigate('create');

  const filteredItems = React.useMemo(() => {
    if (!hasSearched) return [];

    const isRowActive = (row) => {
      const value = row?.isActive ?? row?.active ?? row?.enabled;
      return value === undefined ? true : value !== false;
    };

    return (items || [])
      .filter((row) => includeInactive || isRowActive(row))
      .filter((row) => {
        const query = (search || '').trim().toLowerCase();
        if (!query) return true;
        const name = String(row?.name ?? row?.typeName ?? '').toLowerCase();
        return name.includes(query);
      });
  }, [hasSearched, items, includeInactive, search]);

  const totalPagesClient = React.useMemo(() => {
    if (!hasSearched) return 1;
    return Math.max(Math.ceil(filteredItems.length / Math.max(limit || 1, 1)), 1);
  }, [hasSearched, filteredItems.length, limit]);

  const pageItems = React.useMemo(() => {
    if (!hasSearched) return [];
    const safePage = Math.min(Math.max(page || 1, 1), totalPagesClient);
    const start = (safePage - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [hasSearched, filteredItems, page, limit, totalPagesClient]);

  const handleInitialSearch = () => {
    if (hasSearched) return;

    didFetchRef.current = false;
    setHasSearched(true);
    setPageAction(1);

    const next = new URLSearchParams(params);
    next.set('page', '1');

    if (search) next.set('search', search);
    else next.delete('search');

    if (includeInactive) next.set('includeInactive', 'true');
    else next.delete('includeInactive');

    next.delete('categoryId');
    setParams(next, { replace: true });
  };

  return (
    <Page>
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="จัดการประเภทสินค้า"
          description="เรียกดูและจัดการประเภทสินค้าที่ใช้ในระบบสต็อก"
          actions={canManage ? <Button onClick={handleCreate}>เพิ่มประเภทสินค้า</Button> : null}
        />

        <Stack gap={4}>
          <Card>
            <CardBody>
              <Stack gap={4}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-[hsl(var(--ads-text-default))]">
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

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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

                    <Button loading={isLoading} disabled={hasSearched} onClick={handleInitialSearch}>
                      แสดงข้อมูล
                    </Button>
                  </div>
                </div>
              </Stack>
            </CardBody>
          </Card>

          {error ? (
            <ErrorState
              title="ไม่สามารถโหลดประเภทสินค้าได้"
              description={typeof error === 'string' ? error : 'กรุณาลองใหม่อีกครั้ง'}
              actionLabel="ลองใหม่"
              onAction={() => {
                didFetchRef.current = false;
                fetchListAction();
              }}
            />
          ) : !hasSearched ? (
            <EmptyState
              title="ยังไม่ได้แสดงข้อมูล"
              description="กดปุ่ม “แสดงข้อมูล” เพื่อโหลดรายการประเภทสินค้า"
              actionLabel="แสดงข้อมูล"
              onAction={handleInitialSearch}
            />
          ) : (
            <Card>
              <CardBody className="p-3">
                <ProductTypeTable
                  data={pageItems}
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

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[hsl(var(--ads-text-muted))]">
              หน้า {page} / {totalPagesClient}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => page > 1 && setPageAction(page - 1)}
                disabled={!hasSearched || page <= 1 || isLoading}
              >
                ก่อนหน้า
              </Button>
              <Button
                variant="secondary"
                onClick={() => page < totalPagesClient && setPageAction(page + 1)}
                disabled={!hasSearched || page >= totalPagesClient || isLoading}
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

export default ListProductTypePage;
