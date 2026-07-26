import { useMemo, useState } from 'react';

import {
  Badge,
  ConfirmActionDialog,
  CrudTableAction,
  CrudTableActions,
} from '@/design-system';
import { useCategoryStore } from '../Store/CategoryStore';

const roleIsAdminOrSuper = () => {
  const role = (localStorage.getItem('role') || '').toLowerCase();
  return role === 'admin' || role === 'supperadmin' || role === 'superadmin';
};

const CategoryTable = ({ data = [], onEdit }) => {
  const isAdmin = roleIsAdminOrSuper();
  const { archiveAction, restoreAction } = useCategoryStore();
  const rows = useMemo(() => data || [], [data]);
  const [confirm, setConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const proceed = async () => {
    if (!confirm || isSaving) return;

    setIsSaving(true);
    try {
      if (confirm.type === 'archive') await archiveAction(confirm.row.id);
      if (confirm.type === 'restore') await restoreAction(confirm.row.id);
      setConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const isArchive = confirm?.type === 'archive';

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between border-b border-[hsl(var(--ads-border-default))] px-4 py-3 text-sm text-[hsl(var(--ads-text-muted))]">
          <span>รายการหมวดหมู่สินค้า</span>
          <span>ทั้งหมด {rows.length} รายการ</span>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
            <tr>
              <th className="w-[60%] px-4 py-3 font-semibold">ชื่อหมวดหมู่</th>
              <th className="w-32 px-4 py-3 text-center font-semibold">สถานะ</th>
              <th className="w-52 px-4 py-3 text-right font-semibold">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
            {rows.map((category) => {
              const isActive = Boolean(category.active);
              const isSystem = Boolean(category.isSystem);
              const canEdit = isAdmin && !isSystem && isActive;
              const canArchive = isAdmin && !isSystem && isActive;
              const canRestore = isAdmin && !isSystem && !isActive;

              return (
                <tr key={category.id} className="hover:bg-[hsl(var(--ads-surface-subtle))]">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[hsl(var(--ads-text-strong))]">
                        {category.name}
                      </span>
                      {isSystem ? <Badge tone="brand">หมวดระบบ</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={isActive ? 'success' : 'neutral'}>
                      {isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <CrudTableActions>
                      <CrudTableAction
                        action="edit"
                        disabled={!canEdit}
                        onClick={() => onEdit?.(category)}
                        title={
                          !isAdmin
                            ? 'สำหรับผู้ดูแลระบบเท่านั้น'
                            : isSystem
                              ? 'หมวดระบบถูกล็อก'
                              : !isActive
                                ? 'ต้องเป็นสถานะใช้งาน'
                                : 'แก้ไข'
                        }
                      >
                        แก้ไข
                      </CrudTableAction>
                      <CrudTableAction
                        action={isActive ? 'destructive' : 'restore'}
                        disabled={isActive ? !canArchive : !canRestore}
                        onClick={() =>
                          setConfirm({ type: isActive ? 'archive' : 'restore', row: category })
                        }
                        title={isSystem ? 'หมวดระบบถูกล็อก' : undefined}
                      >
                        {isActive ? 'ปิดใช้งาน' : 'กู้คืน'}
                      </CrudTableAction>
                    </CrudTableActions>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmActionDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={proceed}
        title={`${isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}หมวดหมู่สินค้า`}
        description={`ยืนยันการ${isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}หมวดหมู่ “${confirm?.row?.name || ''}” หรือไม่?`}
        confirmLabel={isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}
        confirmVariant={isArchive ? 'danger' : 'primary'}
        loading={isSaving}
      />
    </>
  );
};

export default CategoryTable;
