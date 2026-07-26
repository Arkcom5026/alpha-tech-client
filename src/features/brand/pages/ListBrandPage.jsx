// src/features/brand/pages/ListBrandPage.jsx
// Brand List Page with ProductTypeBrand mapping management

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  ConfirmActionDialog,
  CrudPage,
  CrudPagination,
  CrudToolbar,
  EmptyState,
  Input,
  LoadingState,
  Select,
} from '@/design-system';
import { useBrandStore } from '../store/brandStore';

const normalizeActive = (brand) => brand?.isActive ?? brand?.active ?? true;
const getLinkBrand = (link) => link?.brand || link;

const ListBrandPage = () => {
  const navigate = useNavigate();

  const [productTypeId, setProductTypeId] = useState('');
  const [didAutoSelectProductType, setDidAutoSelectProductType] = useState(false);
  const [brandToAttachId, setBrandToAttachId] = useState('');
  const [linkToDetach, setLinkToDetach] = useState(null);

  const items = useBrandStore((state) => state.items) || [];
  const page = useBrandStore((state) => state.page) || 1;
  const pageSize = useBrandStore((state) => state.pageSize) || 20;
  const total = useBrandStore((state) => state.total) || 0;
  const q = useBrandStore((state) => state.q) || '';
  const includeInactive = useBrandStore((state) => state.includeInactive) || false;
  const loading = useBrandStore((state) => state.loading) || false;
  const saving = useBrandStore((state) => state.saving) || false;
  const error = useBrandStore((state) => state.error);

  const runtimeProductTypes = useBrandStore((state) => state.runtimeProductTypes) || [];
  const runtimeProductTypesLoading = useBrandStore((state) => state.runtimeProductTypesLoading) || false;
  const allBrandOptions = useBrandStore((state) => state.allBrandOptions) || [];
  const allBrandOptionsLoading = useBrandStore((state) => state.allBrandOptionsLoading) || false;
  const productTypeBrandLinks = useBrandStore((state) => state.productTypeBrandLinks) || [];
  const productTypeBrandLinksLoading = useBrandStore((state) => state.productTypeBrandLinksLoading) || false;

  const fetchRuntimeProductTypesAction = useBrandStore((state) => state.fetchRuntimeProductTypesAction);
  const fetchBrandsAction = useBrandStore((state) => state.fetchBrandsAction);
  const setQueryAction = useBrandStore((state) => state.setQueryAction);
  const setIncludeInactiveAction = useBrandStore((state) => state.setIncludeInactiveAction);
  const setPageAction = useBrandStore((state) => state.setPageAction);
  const setPageSizeAction = useBrandStore((state) => state.setPageSizeAction);
  const clearErrorAction = useBrandStore((state) => state.clearErrorAction);
  const toggleBrandActiveAction = useBrandStore((state) => state.toggleBrandActiveAction);
  const fetchAllBrandOptionsAction = useBrandStore((state) => state.fetchAllBrandOptionsAction);
  const fetchProductTypeBrandLinksAction = useBrandStore((state) => state.fetchProductTypeBrandLinksAction);
  const attachBrandToProductTypeAction = useBrandStore((state) => state.attachBrandToProductTypeAction);
  const detachBrandFromProductTypeAction = useBrandStore((state) => state.detachBrandFromProductTypeAction);

  const selectedProductTypeId = useMemo(() => {
    const n = Number(productTypeId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [productTypeId]);

  const selectedProductType = useMemo(
    () => runtimeProductTypes.find((type) => Number(type?.id) === Number(selectedProductTypeId)) || null,
    [runtimeProductTypes, selectedProductTypeId]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(Number(total || 0) / Number(pageSize || 20))),
    [total, pageSize]
  );

  const paginationSummary = useMemo(() => {
    if (!total) return 'ยังไม่มีรายการ';
    const start = (Number(page || 1) - 1) * Number(pageSize || 20) + 1;
    const end = Math.min(Number(page || 1) * Number(pageSize || 20), Number(total || 0));
    return `${start}–${end} / ${total}`;
  }, [page, pageSize, total]);

  const linkedBrandIds = useMemo(
    () =>
      new Set(
        productTypeBrandLinks
          .map((link) => Number(link?.brandId || link?.brand?.id))
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    [productTypeBrandLinks]
  );

  const attachableBrandOptions = useMemo(
    () =>
      allBrandOptions.filter((brand) => {
        const id = Number(brand?.id);
        if (!Number.isFinite(id) || id <= 0) return false;
        if (linkedBrandIds.has(id)) return false;
        return normalizeActive(brand);
      }),
    [allBrandOptions, linkedBrandIds]
  );

  useEffect(() => {
    clearErrorAction?.();
  }, [clearErrorAction]);

  useEffect(() => {
    fetchRuntimeProductTypesAction?.({ includeInactive: false, pageSize: 100 });
    fetchAllBrandOptionsAction?.({ includeInactive: false });
  }, [fetchAllBrandOptionsAction, fetchRuntimeProductTypesAction]);

  useEffect(() => {
    if (
      didAutoSelectProductType ||
      productTypeId ||
      !Array.isArray(runtimeProductTypes) ||
      runtimeProductTypes.length === 0
    ) {
      return;
    }

    setProductTypeId(String(runtimeProductTypes[0].id));
    setDidAutoSelectProductType(true);
    setPageAction?.(1);
  }, [didAutoSelectProductType, productTypeId, runtimeProductTypes, setPageAction]);

  useEffect(() => {
    fetchBrandsAction?.({ q, page, pageSize, includeInactive, productTypeId: selectedProductTypeId });
  }, [fetchBrandsAction, q, page, pageSize, includeInactive, selectedProductTypeId]);

  useEffect(() => {
    fetchProductTypeBrandLinksAction?.({
      productTypeId: selectedProductTypeId,
      includeInactive: true,
    });
    setBrandToAttachId('');
  }, [fetchProductTypeBrandLinksAction, selectedProductTypeId]);

  const onToggle = async (brand) => {
    if (!brand?.id || saving) return;
    await toggleBrandActiveAction?.({ id: brand.id, isActive: !normalizeActive(brand) });
    await fetchBrandsAction?.({ q, page, pageSize, includeInactive, productTypeId: selectedProductTypeId });
    await fetchAllBrandOptionsAction?.({ includeInactive: false });
  };

  const onAttachBrand = async () => {
    if (!selectedProductTypeId || !brandToAttachId || saving) return;

    const result = await attachBrandToProductTypeAction?.({
      productTypeId: selectedProductTypeId,
      brandId: brandToAttachId,
    });

    if (result?.ok) setBrandToAttachId('');
  };

  const onConfirmDetachBrand = async () => {
    if (!linkToDetach?.id || !selectedProductTypeId || saving) return;

    await detachBrandFromProductTypeAction?.({
      id: linkToDetach.id,
      productTypeId: selectedProductTypeId,
    });
    setLinkToDetach(null);
  };

  const detachBrandName = getLinkBrand(linkToDetach)?.name || 'แบรนด์นี้';

  return (
    <CrudPage
      title="จัดการแบรนด์"
      description="ผูกแบรนด์กับประเภทสินค้าของสาขาปัจจุบัน เพื่อให้หน้าสินค้าเลือกแบรนด์ได้ถูกต้อง"
      maxWidth="7xl"
      actions={
        <Button onClick={() => navigate('create')} disabled={saving}>
          + เพิ่มแบรนด์
        </Button>
      }
    >
      <CrudToolbar
        columns="auto"
        bodyClassName="lg:grid-cols-[280px_minmax(0,1fr)_auto_auto] lg:items-center"
      >
        <Select
          value={productTypeId}
          onChange={(event) => {
            setProductTypeId(event.target.value);
            setDidAutoSelectProductType(true);
            setPageAction?.(1);
          }}
          disabled={runtimeProductTypesLoading}
        >
          <option value="">-- เลือกประเภทสินค้า --</option>
          {runtimeProductTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>

        <Input
          value={q}
          onChange={(event) => setQueryAction?.(event.target.value)}
          placeholder="ค้นหาแบรนด์ที่ผูกกับประเภทสินค้านี้"
        />

        <label className="inline-flex items-center gap-2 text-sm text-[hsl(var(--ads-text-muted))]">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => setIncludeInactiveAction?.(event.target.checked)}
          />
          แสดงรายการที่ปิดใช้งานด้วย
        </label>

        <Select value={pageSize} onChange={(event) => setPageSizeAction?.(event.target.value)}>
          <option value={20}>20 / หน้า</option>
          <option value={50}>50 / หน้า</option>
          <option value={100}>100 / หน้า</option>
        </Select>
      </CrudToolbar>

      {selectedProductTypeId ? (
        <Card className="border-[hsl(var(--ads-info)/0.3)] bg-[hsl(var(--ads-info-subtle))]">
          <CardBody>
            <div className="mb-3">
              <div className="text-sm font-semibold text-[hsl(var(--ads-text-strong))]">
                ผูกแบรนด์กับประเภทสินค้า: {selectedProductType?.name || '-'}
              </div>
              <div className="mt-1 text-xs text-[hsl(var(--ads-text-muted))]">
                {productTypeBrandLinksLoading
                  ? 'กำลังโหลดรายการแบรนด์ที่ผูกอยู่...'
                  : `ผูกไว้แล้ว ${productTypeBrandLinks.length} แบรนด์`}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto]">
              <Select
                value={brandToAttachId}
                onChange={(event) => setBrandToAttachId(event.target.value)}
                disabled={saving || allBrandOptionsLoading}
              >
                <option value="">-- เลือกแบรนด์เพื่อผูกกับประเภทสินค้านี้ --</option>
                {attachableBrandOptions.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>

              <Button onClick={onAttachBrand} disabled={!brandToAttachId || saving} loading={saving}>
                ผูกแบรนด์
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {productTypeBrandLinks.map((link) => {
                const brand = getLinkBrand(link);
                return (
                  <Badge key={link.id || `${link.productTypeId}-${link.brandId}`} tone="info">
                    <span className="inline-flex items-center gap-2">
                      {brand?.name || `Brand #${link.brandId}`}
                      <button
                        type="button"
                        onClick={() => setLinkToDetach(link)}
                        disabled={saving}
                        className="rounded-full px-1 hover:bg-black/5 disabled:opacity-50"
                        title="ถอดแบรนด์"
                      >
                        ×
                      </button>
                    </span>
                  </Badge>
                );
              })}

              {!productTypeBrandLinksLoading && productTypeBrandLinks.length === 0 ? (
                <span className="text-xs text-[hsl(var(--ads-text-muted))]">
                  ยังไม่มีแบรนด์ที่ผูกกับประเภทสินค้านี้
                </span>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Alert tone="warning">กรุณาเลือกประเภทสินค้าก่อน เพื่อจัดการแบรนด์ที่อนุญาตให้ใช้</Alert>
      )}

      {error ? (
        <Alert title="เกิดข้อผิดพลาด" tone="danger">
          <span className="break-words">{error}</span>
        </Alert>
      ) : null}

      <Card>
        <div className="flex items-center justify-between border-b border-[hsl(var(--ads-border-default))] px-4 py-3 text-sm text-[hsl(var(--ads-text-muted))]">
          <span>รายการแบรนด์ที่ผูกกับประเภทสินค้านี้</span>
          <span>{loading ? 'กำลังโหลด...' : `ทั้งหมด ${total} รายการ`}</span>
        </div>

        {loading ? (
          <LoadingState label="กำลังโหลดรายการแบรนด์…" />
        ) : items.length === 0 ? (
          <CardBody>
            <EmptyState
              title={selectedProductTypeId ? 'ยังไม่มีแบรนด์ที่ผูกกับประเภทสินค้านี้' : 'กรุณาเลือกประเภทสินค้า'}
              description="เลือกประเภทสินค้าและผูกแบรนด์ที่อนุญาตให้ใช้งาน"
            />
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
                <tr>
                  <th className="w-16 px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">ชื่อแบรนด์</th>
                  <th className="w-36 px-4 py-3 text-center font-semibold">สถานะ</th>
                  <th className="w-44 px-4 py-3 text-center font-semibold">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((brand, index) => {
                  const active = normalizeActive(brand);
                  const rowNo = (Number(page || 1) - 1) * Number(pageSize || 20) + index + 1;

                  return (
                    <tr
                      key={brand.id}
                      className="border-t border-[hsl(var(--ads-border-default))] hover:bg-[hsl(var(--ads-surface-subtle))]"
                    >
                      <td className="px-4 py-3 text-[hsl(var(--ads-text-muted))]">{rowNo}</td>
                      <td className="px-4 py-3 font-medium text-[hsl(var(--ads-text-strong))]">
                        {brand.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge tone={active ? 'success' : 'neutral'}>{active ? 'ใช้งาน' : 'ปิดใช้งาน'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`edit/${brand.id}`)}>
                            แก้ไข
                          </Button>
                          <Button
                            size="sm"
                            variant={active ? 'danger' : 'primary'}
                            onClick={() => onToggle(brand)}
                            disabled={saving}
                          >
                            {active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CrudPagination
        page={page}
        totalPages={totalPages}
        summary={paginationSummary}
        disabled={loading}
        onPageChange={(nextPage) => setPageAction?.(nextPage)}
      />

      <ConfirmActionDialog
        open={Boolean(linkToDetach)}
        title="ถอดแบรนด์ออกจากประเภทสินค้า"
        description={`ต้องการถอด “${detachBrandName}” ออกจากประเภทสินค้า “${selectedProductType?.name || ''}” หรือไม่?`}
        confirmLabel="ถอดแบรนด์"
        confirmVariant="danger"
        loading={saving}
        loadingLabel="กำลังถอดแบรนด์..."
        onConfirm={onConfirmDetachBrand}
        onClose={() => setLinkToDetach(null)}
      />
    </CrudPage>
  );
};

export default ListBrandPage;
