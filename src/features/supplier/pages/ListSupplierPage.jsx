// src/features/supplier/pages/ListSupplierPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';

import {
  Alert,
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
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import SupplierTable from '../components/SupplierTable';
import useSupplierStore from '../store/supplierStore';

const ListSupplierPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const token = useAuthStore((state) => state.token);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const {
    suppliers,
    supplierError,
    isSupplierLoading,
    isSupplierSaving,
    search,
    page,
    limit,
    setSearchAction,
    setPageAction,
    setLimitAction,
    fetchSuppliersAction,
    refreshAction,
  } = useSupplierStore();

  const targetSlug = shopSlug || 'advancetech';
  const createSupplierPath = `/${targetSlug}/pos/purchases/suppliers/create`;

  useEffect(() => {
    if (token && selectedBranchId) fetchSuppliersAction(selectedBranchId);
  }, [token, selectedBranchId, fetchSuppliersAction]);

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th-TH');
    if (!keyword) return suppliers;

    return suppliers.filter((supplier) =>
      [supplier?.name, supplier?.phone, supplier?.email]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('th-TH').includes(keyword))
    );
  }, [suppliers, search]);

  const total = filteredSuppliers.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const visibleSuppliers = filteredSuppliers.slice(startIndex, startIndex + limit);

  useEffect(() => {
    if (page > totalPages) setPageAction(totalPages);
  }, [page, totalPages, setPageAction]);

  const summary = total
    ? `${startIndex + 1}–${Math.min(startIndex + limit, total)} / ${total}`
    : 'ยังไม่มีรายการ';

  const hasBranch = Boolean(selectedBranchId);
  const disabled = isSupplierLoading || isSupplierSaving;

  return (
    <CrudPage
      title="บัญชีรายชื่อผู้ขาย"
      description="จัดการบริษัทคู่ค้าและซัพพลายเออร์สำหรับใบสั่งซื้อและใบรับสินค้า"
      actions={
        hasBranch ? (
          <CrudPrimaryAction onClick={() => navigate(createSupplierPath)} disabled={disabled}>
            เพิ่มผู้ขาย
          </CrudPrimaryAction>
        ) : null
      }
      notices={
        !hasBranch ? (
          <Alert tone="warning" title="ยังไม่ได้เลือกสาขา">
            กรุณาเลือกสาขาของร้านค้าก่อนเรียกดูบัญชีรายชื่อผู้ขาย
          </Alert>
        ) : null
      }
      maxWidth="full"
      contentClassName="max-w-[1600px]"
    >
      {hasBranch ? (
        <>
          <CrudToolbar
            columns="search-filter"
            bodyClassName="md:grid-cols-[minmax(0,1fr)_180px]"
            actions={
              <Button variant="secondary" onClick={refreshAction} disabled={disabled}>
                รีเฟรช
              </Button>
            }
          >
            <Input
              type="search"
              placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมลผู้ขาย..."
              value={search}
              onChange={(event) => setSearchAction(event.target.value)}
            />
            <Select
              value={limit}
              onChange={(event) => setLimitAction(Number(event.target.value))}
              disabled={disabled}
              aria-label="จำนวนรายการต่อหน้า"
            >
              <option value={10}>10 รายการต่อหน้า</option>
              <option value={20}>20 รายการต่อหน้า</option>
              <option value={50}>50 รายการต่อหน้า</option>
              <option value={100}>100 รายการต่อหน้า</option>
            </Select>
          </CrudToolbar>

          {supplierError ? (
            <ErrorState
              title="โหลดบัญชีรายชื่อผู้ขายไม่สำเร็จ"
              description={String(supplierError)}
              actionLabel="ลองใหม่"
              onAction={refreshAction}
            />
          ) : (
            <Card className="overflow-hidden">
              {isSupplierLoading ? (
                <CardBody>
                  <LoadingState label="กำลังโหลดบัญชีรายชื่อผู้ขาย…" />
                </CardBody>
              ) : visibleSuppliers.length === 0 ? (
                <CardBody>
                  <EmptyState
                    icon={<Building2 className="h-7 w-7" aria-hidden="true" />}
                    title={search ? 'ไม่พบผู้ขายที่ค้นหา' : 'ยังไม่มีข้อมูลผู้ขายในสาขานี้'}
                    description={
                      search
                        ? 'ลองเปลี่ยนชื่อ เบอร์โทร หรืออีเมลที่ใช้ค้นหา'
                        : 'ลงทะเบียนบริษัทคู่ค้าหรือซัพพลายเออร์ เพื่อใช้กับใบสั่งซื้อและใบรับสินค้า'
                    }
                    actionLabel={!search ? 'เพิ่มผู้ขายรายแรก' : undefined}
                    onAction={!search ? () => navigate(createSupplierPath) : undefined}
                  />
                </CardBody>
              ) : (
                <SupplierTable suppliers={visibleSuppliers} startIndex={startIndex} disabled={disabled} />
              )}
            </Card>
          )}

          {!supplierError ? (
            <CrudPagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPageAction}
              disabled={disabled}
              summary={summary}
            />
          ) : null}
        </>
      ) : null}
    </CrudPage>
  );
};

export default ListSupplierPage;
