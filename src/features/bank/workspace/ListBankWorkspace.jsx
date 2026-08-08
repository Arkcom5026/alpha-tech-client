import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import useBankStore from '@/features/bank/store/bankStore';
import {
  Badge,
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

const ListBankPage = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin: isSuperAdminFromStore } = useAuthStore();

  const roleName = (
    user?.roleName || user?.role?.name || user?.role || user?.profile?.roleName || user?.profile?.role || ''
  ).toString();
  const roleId = user?.roleId ?? user?.role?.id ?? user?.profile?.roleId ?? user?.profile?.role?.id;

  const isSuperAdmin = Boolean(
    isSuperAdminFromStore === true ||
      roleName.toUpperCase() === 'SUPERADMIN' ||
      roleId === 1 ||
      user?.isSuperAdmin === true
  );

  const {
    banks,
    bankLoading,
    bankSaving,
    bankError,
    fetchBanksAction,
    toggleBankActiveAction,
  } = useBankStore();

  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [confirm, setConfirm] = React.useState(null);

  const includeInactive = active !== 'true';

  React.useEffect(() => {
    fetchBanksAction({ q: search, includeInactive });
  }, [search, includeInactive, fetchBanksAction]);

  const filteredRows = React.useMemo(() => {
    const rows = Array.isArray(banks) ? banks : [];
    if (active === 'all') return rows;
    const expected = active === 'true';
    return rows.filter((row) => Boolean(row?.active) === expected);
  }, [banks, active]);

  const total = filteredRows.length;
  const totalPages = Math.max(Math.ceil(total / Math.max(limit, 1)), 1);
  const safePage = Math.min(page, totalPages);
  const pageRows = React.useMemo(() => {
    const start = (safePage - 1) * limit;
    return filteredRows.slice(start, start + limit);
  }, [filteredRows, safePage, limit]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const currentPath = window.location.pathname;
  const onEdit = (row) => navigate(`${currentPath}/${row.id}/edit`);

  const handleToggle = (row) => {
    setConfirm({ row, nextActive: !Boolean(row?.active) });
  };

  const proceedToggle = async () => {
    if (!isSuperAdmin || !confirm?.row || bankSaving) {
      if (!isSuperAdmin) setConfirm(null);
      return;
    }

    await toggleBankActiveAction(confirm.row.id);
    setConfirm(null);
  };

  const retry = () => fetchBanksAction({ q: search, includeInactive });
  const paginationSummary = total
    ? `${(safePage - 1) * limit + 1}–${Math.min(safePage * limit, total)} / ${total}`
    : 'ยังไม่มีรายการ';

  return (
    <CrudPage
      title="รายการบัญชีธนาคาร"
      description="กำหนดข้อมูลธนาคารรับและจ่ายเงินของหน่วยงาน โดยการเพิ่มหรือเปลี่ยนสถานะจำกัดเฉพาะ SuperAdmin"
      maxWidth="5xl"
      actions={
        <CrudPrimaryAction
          onClick={() => isSuperAdmin && navigate(`${currentPath}/create`)}
          disabled={!isSuperAdmin || bankSaving}
          title={!isSuperAdmin ? 'สิทธิ์ไม่ถึงระดับ SuperAdmin' : undefined}
        >
          เพิ่มธนาคารใหม่
        </CrudPrimaryAction>
      }
    >
      <CrudToolbar columns="auto" bodyClassName="lg:grid-cols-[minmax(0,1fr)_240px_160px] lg:items-end">
        <Input
          placeholder="ค้นหาชื่อธนาคาร..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        <Select
          value={active}
          onChange={(event) => {
            setActive(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">แสดงทั้งหมด</option>
          <option value="true">เฉพาะที่ใช้งานอยู่</option>
          <option value="false">เฉพาะที่ปิดใช้งาน</option>
        </Select>

        <label className="flex flex-col gap-1 text-sm text-[hsl(var(--ads-text-muted))]">
          <span>แถวต่อหน้า</span>
          <Select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
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

      {bankError ? (
        <ErrorState
          title="โหลดข้อมูลธนาคารไม่สำเร็จ"
          description={String(bankError)}
          actionLabel="ลองใหม่"
          onAction={retry}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            {bankLoading && total === 0 ? (
              <LoadingState label="กำลังโหลดรายชื่อธนาคาร…" />
            ) : total === 0 ? (
              <EmptyState
                title={search ? 'ไม่พบธนาคารที่ค้นหา' : 'ยังไม่มีข้อมูลธนาคาร'}
                description={
                  search
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ'
                    : 'เพิ่มธนาคารแรกเพื่อเริ่มกำหนดข้อมูลรับและจ่ายเงิน'
                }
                actionLabel={isSuperAdmin && !search ? 'เพิ่มธนาคารใหม่' : undefined}
                onAction={isSuperAdmin && !search ? () => navigate(`${currentPath}/create`) : undefined}
                className="m-4"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
                    <tr>
                      <th className="w-16 px-4 py-3 text-center font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">ชื่อธนาคาร</th>
                      <th className="w-36 px-4 py-3 text-center font-semibold">สถานะ</th>
                      <th className="w-56 px-4 py-3 text-right font-semibold">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
                    {pageRows.map((row, index) => (
                      <tr key={row.id} className="hover:bg-[hsl(var(--ads-surface-subtle))]">
                        <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-muted))]">
                          {(safePage - 1) * limit + index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[hsl(var(--ads-text-strong))]">
                          {row.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge tone={row.active ? 'success' : 'neutral'}>
                            {row.active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <CrudTableActions>
                            <CrudTableAction action="edit" onClick={() => onEdit(row)} disabled={bankSaving}>
                              แก้ไขข้อมูล
                            </CrudTableAction>
                            {isSuperAdmin ? (
                              <CrudTableAction
                                action={row.active ? 'destructive' : 'restore'}
                                onClick={() => handleToggle(row)}
                                disabled={bankSaving}
                              >
                                {row.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                              </CrudTableAction>
                            ) : null}
                          </CrudTableActions>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {!bankError && total > 0 ? (
        <CrudPagination
          page={safePage}
          totalPages={totalPages}
          summary={paginationSummary}
          disabled={bankLoading || bankSaving}
          onPageChange={setPage}
        />
      ) : null}

      <ConfirmActionDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={proceedToggle}
        title="ยืนยันการเปลี่ยนสถานะธนาคาร"
        description={
          confirm
            ? `ต้องการ${confirm.nextActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ธนาคาร “${confirm.row?.name}” หรือไม่?`
            : undefined
        }
        confirmVariant={confirm?.nextActive ? 'primary' : 'danger'}
        loading={bankSaving}
        loadingLabel="กำลังเปลี่ยนสถานะ..."
      />
    </CrudPage>
  );
};

export default ListBankPage;
