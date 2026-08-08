// src/features/unit/pages/ListUnitPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  ConfirmActionDialog,
  CrudPage,
  CrudPagination,
  CrudPrimaryAction,
  CrudTableAction,
  CrudTableActions,
  CrudToolbar,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
} from '@/design-system';
import useUnitStore from '../store/unitStore';

const ListUnitPage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const {
    units,
    loading,
    submitting,
    error,
    search,
    page,
    limit,
    setSearchAction,
    setPageAction,
    setLimitAction,
    fetchUnitsAction,
    refreshAction,
    deleteUnitAction,
  } = useUnitStore();
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchUnitsAction();
  }, [fetchUnitsAction]);

  const targetSlug = shopSlug || 'advancetech';
  const createUnitPath = `/${targetSlug}/pos/stock/units/create`;
  const normalizedSearch = search.trim().toLocaleLowerCase('th-TH');

  const filteredUnits = useMemo(
    () =>
      units.filter((unit) =>
        String(unit?.name || '')
          .toLocaleLowerCase('th-TH')
          .includes(normalizedSearch)
      ),
    [units, normalizedSearch]
  );

  const total = filteredUnits.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredUnits.slice((safePage - 1) * limit, safePage * limit);
  const selectedUnit = units.find((unit) => Number(unit.id) === Number(confirmId));
  const disabled = loading || submitting;

  useEffect(() => {
    if (page !== safePage) setPageAction(safePage);
  }, [page, safePage, setPageAction]);

  const handleDelete = async () => {
    if (!confirmId || submitting) return;
    await deleteUnitAction(confirmId);
    setConfirmId(null);
  };

  const paginationText = total
    ? `${(safePage - 1) * limit + 1}–${Math.min(safePage * limit, total)} / ${total}`
    : 'ยังไม่มีรายการ';

  return (
    <CrudPage
      title="รายการหน่วยนับ"
      description="จัดการหน่วยนับมาตรฐานที่ใช้กับสินค้าในระบบ"
      maxWidth="5xl"
      actions={
        <CrudPrimaryAction onClick={() => navigate(createUnitPath)} disabled={submitting}>
          เพิ่มหน่วยนับ
        </CrudPrimaryAction>
      }
    >
      <CrudToolbar
        columns="auto"
        bodyClassName="md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
      >
        <Input
          type="search"
          placeholder="ค้นหาชื่อหน่วยนับ..."
          value={search}
          onChange={(event) => setSearchAction(event.target.value)}
        />
        <Select value={limit} onChange={(event) => setLimitAction(Number(event.target.value))}>
          <option value={10}>10 / หน้า</option>
          <option value={20}>20 / หน้า</option>
          <option value={50}>50 / หน้า</option>
          <option value={100}>100 / หน้า</option>
        </Select>
        <Button variant="secondary" onClick={refreshAction} disabled={disabled}>
          รีเฟรช
        </Button>
      </CrudToolbar>

      {error ? (
        <ErrorState
          title="โหลดรายการหน่วยนับไม่สำเร็จ"
          description={String(error)}
          actionLabel="ลองใหม่"
          onAction={refreshAction}
        />
      ) : (
        <Card className="overflow-hidden">
          {loading && units.length === 0 ? (
            <LoadingState label="กำลังโหลดรายการหน่วยนับ…" />
          ) : pageItems.length === 0 ? (
            <CardBody>
              <EmptyState
                title={normalizedSearch ? 'ไม่พบหน่วยนับที่ตรงกับคำค้นหา' : 'ยังไม่มีหน่วยนับ'}
                description={
                  normalizedSearch
                    ? 'ลองเปลี่ยนคำค้นหา แล้วตรวจสอบรายการอีกครั้ง'
                    : 'เพิ่มหน่วยนับรายการแรกเพื่อเริ่มใช้งานกับสินค้า'
                }
                actionLabel={!normalizedSearch ? 'เพิ่มหน่วยนับ' : undefined}
                onAction={!normalizedSearch ? () => navigate(createUnitPath) : undefined}
              />
            </CardBody>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[hsl(var(--ads-surface-subtle))] text-xs uppercase tracking-wide text-[hsl(var(--ads-text-muted))]">
                  <tr>
                    <th className="w-20 px-5 py-3 font-semibold">#</th>
                    <th className="px-5 py-3 font-semibold">ชื่อหน่วยนับ</th>
                    <th className="px-5 py-3 text-right font-semibold">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
                  {pageItems.map((unit, index) => (
                    <tr
                      key={unit.id}
                      className="bg-[hsl(var(--ads-surface-raised))] transition-colors hover:bg-[hsl(var(--ads-surface-subtle))]"
                    >
                      <td className="px-5 py-4 text-[hsl(var(--ads-text-muted))]">
                        {(safePage - 1) * limit + index + 1}
                      </td>
                      <td className="px-5 py-4 font-medium text-[hsl(var(--ads-text-strong))]">
                        {unit.name || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <CrudTableActions>
                          <CrudTableAction
                            action="edit"
                            disabled={disabled}
                            onClick={() =>
                              navigate(`/${targetSlug}/pos/stock/units/edit/${unit.id}`)
                            }
                          >
                            แก้ไข
                          </CrudTableAction>
                          <CrudTableAction
                            action="destructive"
                            disabled={disabled}
                            onClick={() => setConfirmId(unit.id)}
                          >
                            ลบ
                          </CrudTableAction>
                        </CrudTableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {!error ? (
        <CrudPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPageAction}
          disabled={disabled}
          summary={paginationText}
        />
      ) : null}

      <ConfirmActionDialog
        open={Boolean(confirmId)}
        onClose={() => !submitting && setConfirmId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบหน่วยนับ"
        description={
          selectedUnit
            ? `คุณกำลังจะลบ “${selectedUnit.name}” การดำเนินการนี้ไม่สามารถย้อนกลับได้ โปรดตรวจสอบชื่อหน่วยนับให้ถูกต้องก่อนยืนยัน`
            : 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน'
        }
        confirmLabel="ยืนยันการลบ"
        confirmVariant="danger"
        loading={submitting}
        loadingLabel="กำลังลบ…"
      />
    </CrudPage>
  );
};

export default ListUnitPage;
