import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePositionStore } from '../stores/positionStore.js';
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
  feedback,
} from '@/design-system';

const ListPositionPage = () => {
  const navigate = useNavigate();
  const { list, meta, loading, error, message, fetchListAction, toggleActiveAction } = usePositionStore();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchListAction({
      page,
      limit,
      search,
      active: active === 'all' ? undefined : active === 'true',
    });
  }, [page, limit, search, active, fetchListAction]);

  const rows = Array.isArray(list) ? list : [];
  const total = Number(meta?.total || 0);
  const totalPages = Math.max(Number(meta?.pages || 1), 1);

  const paginationSummary = useMemo(() => {
    if (!total) return 'ยังไม่มีรายการ';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `${start}–${end} / ${total}`;
  }, [page, limit, total]);

  const reload = () => {
    fetchListAction({
      page,
      limit,
      search,
      active: active === 'all' ? undefined : active === 'true',
    });
  };

  const handleToggle = (row) => {
    setConfirm({ row, nextActive: !row?.isActive });
  };

  const proceedToggle = async () => {
    if (!confirm?.row || isSaving) return;

    const actionText = confirm.nextActive ? 'กู้คืน' : 'ปิดใช้งาน';
    setIsSaving(true);
    try {
      await toggleActiveAction(confirm.row.id);
      setConfirm(null);
      feedback.actionSuccess(`${actionText}ตำแหน่งเรียบร้อยแล้ว`, `position:${confirm.nextActive ? 'restore' : 'deactivate'}:success`);
    } catch (toggleError) {
      feedback.actionError(toggleError, `${actionText}ตำแหน่งไม่สำเร็จ`, `position:${confirm.nextActive ? 'restore' : 'deactivate'}:error`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CrudPage
      title="ตำแหน่งพนักงาน"
      description="กำหนดตำแหน่งงานและสถานะการใช้งานสำหรับพนักงานของร้าน"
      actions={<CrudPrimaryAction onClick={() => navigate('create')}>เพิ่มตำแหน่ง</CrudPrimaryAction>}
      notices={message ? <Badge tone="success">{message}</Badge> : null}
    >
      <CrudToolbar columns="auto" bodyClassName="lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
        <Input
          placeholder="ค้นหาชื่อตำแหน่ง..."
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
          <option value="all">ทุกสถานะ</option>
          <option value="true">ใช้งานอยู่</option>
          <option value="false">ปิดใช้งาน</option>
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

      {error ? (
        <ErrorState
          title="โหลดข้อมูลตำแหน่งไม่สำเร็จ"
          description={String(error)}
          actionLabel="ลองใหม่"
          onAction={reload}
        />
      ) : loading && rows.length === 0 ? (
        <LoadingState label="กำลังโหลดข้อมูลตำแหน่ง…" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
                <tr>
                  <th className="w-16 px-4 py-3 text-center font-semibold">#</th>
                  <th className="w-[35%] px-4 py-3 font-semibold">ชื่อตำแหน่ง</th>
                  <th className="px-4 py-3 font-semibold">คำอธิบาย</th>
                  <th className="w-32 px-4 py-3 text-center font-semibold">สถานะ</th>
                  <th className="w-52 px-4 py-3 text-right font-semibold">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-[hsl(var(--ads-border-default))] last:border-b-0 hover:bg-[hsl(var(--ads-surface-subtle))]"
                  >
                    <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-muted))]">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-[hsl(var(--ads-text-strong))]">{row.name || '-'}</td>
                    <td className="px-4 py-3 text-[hsl(var(--ads-text-default))]">{row.description || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge tone={row.isActive ? 'success' : 'neutral'}>
                        {row.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <CrudTableActions>
                        <CrudTableAction action="edit" onClick={() => navigate(`edit/${row.id}`)} disabled={isSaving}>
                          แก้ไข
                        </CrudTableAction>
                        <CrudTableAction
                          action={row.isActive ? 'destructive' : 'restore'}
                          onClick={() => handleToggle(row)}
                          disabled={isSaving}
                        >
                          {row.isActive ? 'ปิดใช้งาน' : 'กู้คืน'}
                        </CrudTableAction>
                      </CrudTableActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 ? (
            <CardBody>
              <EmptyState
                title={search ? 'ไม่พบตำแหน่งที่ค้นหา' : 'ยังไม่มีข้อมูลตำแหน่งพนักงาน'}
                description={search ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ' : 'เพิ่มตำแหน่งแรกเพื่อเริ่มกำหนดโครงสร้างพนักงาน'}
                actionLabel={!search ? 'เพิ่มตำแหน่ง' : undefined}
                onAction={!search ? () => navigate('create') : undefined}
              />
            </CardBody>
          ) : null}
        </Card>
      )}

      {!error ? (
        <CrudPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={loading || isSaving}
          summary={paginationSummary}
        />
      ) : null}

      <ConfirmActionDialog
        open={Boolean(confirm)}
        onClose={() => !isSaving && setConfirm(null)}
        onConfirm={proceedToggle}
        title={`${confirm?.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'}ตำแหน่ง`}
        description={`ยืนยันการ${confirm?.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'}ตำแหน่ง “${confirm?.row?.name || ''}” หรือไม่?`}
        confirmVariant={confirm?.nextActive ? 'primary' : 'danger'}
        loading={isSaving}
        loadingLabel="กำลังบันทึกสถานะ..."
      />
    </CrudPage>
  );
};

export default ListPositionPage;
