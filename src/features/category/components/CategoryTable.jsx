import { useMemo, useState } from 'react';

import {
  Badge,
  ConfirmActionDialog,
  CrudTableAction,
  CrudTableActions,
  feedback,
} from '@/design-system';
import { useCategoryStore } from '../Store/CategoryStore';

const CategoryTable = ({
  data = [],
  page = 1,
  limit = 20,
  total = 0,
  canManage = false,
  disabled = false,
  onEdit,
}) => {
  const { archiveAction, restoreAction } = useCategoryStore();
  const rows = useMemo(() => data || [], [data]);
  const [confirm, setConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const proceed = async () => {
    if (!confirm || isSaving || disabled || !canManage) return;

    const isArchiveAction = confirm.type === 'archive';
    const actionText = isArchiveAction ? 'ปิดใช้งาน' : 'กู้คืน';
    setIsSaving(true);
    try {
      const result = isArchiveAction
        ? await archiveAction(confirm.row.id)
        : await restoreAction(confirm.row.id);

      if (result?.ok) {
        setConfirm(null);
        feedback.actionSuccess(`${actionText}หมวดหมู่เรียบร้อยแล้ว`, `category:${isArchiveAction ? 'archive' : 'restore'}:success`);
      } else {
        feedback.error(result?.message || `${actionText}หมวดหมู่ไม่สำเร็จ`, { eventKey: `category:${isArchiveAction ? 'archive' : 'restore'}:error` });
      }
    } catch (actionError) {
      feedback.actionError(actionError, `${actionText}หมวดหมู่ไม่สำเร็จ`, `category:${isArchiveAction ? 'archive' : 'restore'}:error`);
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
          <span>ทั้งหมด {total} รายการ</span>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
            <tr>
              <th className="w-16 px-4 py-3 text-center font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">ชื่อหมวดหมู่</th>
              <th className="w-32 px-4 py-3 text-center font-semibold">สถานะ</th>
              <th className="w-52 px-4 py-3 text-right font-semibold">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
            {rows.map((category, index) => {
              const isActive = Boolean(category.active);
              const isSystem = Boolean(category.isSystem);
              const canEdit = canManage && !isSystem && isActive;
              const canArchive = canManage && !isSystem && isActive;
              const canRestore = canManage && !isSystem && !isActive;
              const rowNo = (Number(page) - 1) * Number(limit) + index + 1;

              return (
                <tr key={category.id} className="hover:bg-[hsl(var(--ads-surface-subtle))]">
                  <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-muted))]">{rowNo}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[hsl(var(--ads-text-strong))]">
                        {category.name || '-'}
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
                        disabled={disabled || !canEdit}
                        onClick={() => onEdit?.(category)}
                        title={
                          !canManage
                            ? 'ไม่มีสิทธิ์จัดการหมวดหมู่'
                            : isSystem
                              ? 'หมวดระบบถูกล็อก'
                              : !isActive
                                ? 'ต้องกู้คืนหมวดหมู่ก่อนแก้ไข'
                                : 'แก้ไข'
                        }
                      >
                        แก้ไข
                      </CrudTableAction>
                      <CrudTableAction
                        action={isActive ? 'destructive' : 'restore'}
                        disabled={disabled || (isActive ? !canArchive : !canRestore)}
                        onClick={() =>
                          setConfirm({ type: isActive ? 'archive' : 'restore', row: category })
                        }
                        title={
                          !canManage
                            ? 'ไม่มีสิทธิ์จัดการหมวดหมู่'
                            : isSystem
                              ? 'หมวดระบบถูกล็อก'
                              : undefined
                        }
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
        onClose={() => !isSaving && setConfirm(null)}
        onConfirm={proceed}
        title={`${isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}หมวดหมู่สินค้า`}
        description={`ยืนยันการ${isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}หมวดหมู่ “${confirm?.row?.name || ''}” หรือไม่?`}
        confirmLabel={isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}
        confirmVariant={isArchive ? 'danger' : 'primary'}
        loading={isSaving}
        loadingLabel={isArchive ? 'กำลังปิดใช้งาน...' : 'กำลังกู้คืน...'}
      />
    </>
  );
};

export default CategoryTable;
