// src/features/bank/pages/ListBankPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import useBankStore from '@/features/bank/store/bankStore';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Dialog,
  EmptyState,
  Input,
  Page,
  PageHeader,
  Select,
  Stack,
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

  const { banks, fetchBanksAction, toggleBankActiveAction } = useBankStore();
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState('all');
  const [confirm, setConfirm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetchBanksAction({ search, active: active === 'all' ? undefined : active === 'true' });
  }, [search, active, fetchBanksAction]);

  const currentPath = window.location.pathname;
  const onEdit = (row) => navigate(`${currentPath}/${row.id}/edit`);

  const handleToggle = (row) => {
    setConfirm({ row, nextActive: !row?.active });
  };

  const proceedToggle = async () => {
    if (!isSuperAdmin || !confirm?.row || saving) {
      if (!isSuperAdmin) setConfirm(null);
      return;
    }

    setSaving(true);
    try {
      await toggleBankActiveAction(confirm.row.id);
      setConfirm(null);
    } finally {
      setSaving(false);
    }
  };

  const rows = Array.isArray(banks) ? banks : [];

  return (
    <Page>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          title="รายการบัญชีธนาคาร"
          description="กำหนดข้อมูลธนาคารรับและจ่ายเงินของหน่วยงาน โดยการเพิ่มหรือเปลี่ยนสถานะจำกัดเฉพาะ SuperAdmin"
          actions={
            <Button
              onClick={() => isSuperAdmin && navigate(`${currentPath}/create`)}
              disabled={!isSuperAdmin}
              title={!isSuperAdmin ? 'สิทธิ์ไม่ถึงระดับ SuperAdmin' : undefined}
            >
              เพิ่มธนาคารใหม่
            </Button>
          }
        />

        <Stack gap={4}>
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
                <Input
                  placeholder="ค้นหาชื่อธนาคาร..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Select value={active} onChange={(event) => setActive(event.target.value)}>
                  <option value="all">แสดงทั้งหมด</option>
                  <option value="true">เฉพาะที่ใช้งานอยู่</option>
                  <option value="false">เฉพาะที่ปิดใช้งาน</option>
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-0">
              {rows.length === 0 ? (
                <EmptyState
                  title="ไม่พบข้อมูลธนาคาร"
                  description="ยังไม่มีธนาคารที่ตรงกับเงื่อนไขการค้นหาหรือสถานะที่เลือก"
                  actionLabel={isSuperAdmin ? 'เพิ่มธนาคารใหม่' : undefined}
                  onAction={isSuperAdmin ? () => navigate(`${currentPath}/create`) : undefined}
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
                        <th className="w-56 px-4 py-3 text-center font-semibold">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
                      {rows.map((row, index) => (
                        <tr key={row.id} className="hover:bg-[hsl(var(--ads-surface-subtle))]">
                          <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-muted))]">{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-[hsl(var(--ads-text-strong))]">{row.name}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge tone={row.active ? 'success' : 'neutral'}>
                              {row.active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap justify-center gap-2">
                              <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
                                แก้ไขข้อมูล
                              </Button>
                              {isSuperAdmin ? (
                                <Button
                                  variant={row.active ? 'danger' : 'primary'}
                                  size="sm"
                                  onClick={() => handleToggle(row)}
                                  disabled={saving}
                                >
                                  {row.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Stack>

        <Dialog
          open={Boolean(confirm)}
          onClose={() => !saving && setConfirm(null)}
          title="ยืนยันการเปลี่ยนสถานะธนาคาร"
          description={
            confirm
              ? `ต้องการ${confirm.nextActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ธนาคาร “${confirm.row?.name}” หรือไม่?`
              : undefined
          }
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirm(null)} disabled={saving}>
                ยกเลิก
              </Button>
              <Button
                variant={confirm?.nextActive ? 'primary' : 'danger'}
                onClick={proceedToggle}
                loading={saving}
                loadingLabel="กำลังบันทึก..."
                disabled={!isSuperAdmin}
              >
                ยืนยัน
              </Button>
            </>
          }
        />
      </div>
    </Page>
  );
};

export default ListBankPage;
