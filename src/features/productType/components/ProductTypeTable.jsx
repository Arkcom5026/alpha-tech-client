import { useMemo, useState } from 'react';

import {
  Badge,
  ConfirmActionDialog,
  CrudTableAction,
  CrudTableActions,
  LoadingState,
} from '@/design-system';
import useProductTypeStore from '@/features/productType/store/productTypeStore.js';

const toCount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const ProductTypeTable = ({
  data = [],
  loading,
  error,
  page = 1,
  limit = 20,
  onEdit,
  canManage = false,
}) => {
  const { archiveProductTypeAction, restoreProductTypeAction, isSubmitting } =
    useProductTypeStore();
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [confirm, setConfirm] = useState(null);

  const proceed = async () => {
    if (!confirm?.row || isSubmitting) return;
    if (confirm.type === 'archive') await archiveProductTypeAction(confirm.row.id);
    if (confirm.type === 'restore') await restoreProductTypeAction(confirm.row.id);
    setConfirm(null);
  };

  const isArchive = confirm?.type === 'archive';

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between border-b border-[hsl(var(--ads-border-default))] px-4 py-3 text-sm text-[hsl(var(--ads-text-muted))]">
          <span>รายการประเภทสินค้า</span>
          <span>ทั้งหมด {rows.length} รายการ</span>
        </div>

        {error ? (
          <div className="border-b border-[hsl(var(--ads-border-default))] px-4 py-3 text-sm text-[hsl(var(--ads-danger))]">
            {String(error)}
          </div>
        ) : null}

        {loading ? (
          <LoadingState label="กำลังโหลดข้อมูลประเภทสินค้า…" />
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[hsl(var(--ads-surface-subtle))] text-left text-[hsl(var(--ads-text-muted))]">
              <tr>
                <th className="w-16 px-4 py-3 text-center font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">ชื่อประเภทสินค้า</th>
                <th className="w-24 px-4 py-3 text-center font-semibold">แบรนด์</th>
                <th className="w-24 px-4 py-3 text-center font-semibold">สินค้า</th>
                <th className="w-32 px-4 py-3 text-center font-semibold">สถานะ</th>
                <th className="w-52 px-4 py-3 text-right font-semibold">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[hsl(var(--ads-text-muted))]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : null}

              {rows.map((row, index) => {
                const isActive = Boolean(row.active);
                const isSystem = Boolean(row.isSystem);
                const canEdit = canManage && !isSystem && isActive;
                const canArchive = canManage && !isSystem && isActive;
                const canRestore = canManage && !isSystem && !isActive;
                const brandCount = toCount(
                  row.brandCount ?? row?._count?.productTypeBrands ?? row?.brands?.length,
                );
                const productCount = toCount(row.productCount ?? row?._count?.Product);

                return (
                  <tr key={row.id} className="hover:bg-[hsl(var(--ads-surface-subtle))]">
                    <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-muted))]">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[hsl(var(--ads-text-strong))]">
                          {row.name}
                        </span>
                        {isSystem ? <Badge tone="brand">ประเภทระบบ</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-default))]">
                      {brandCount}
                    </td>
                    <td className="px-4 py-3 text-center text-[hsl(var(--ads-text-default))]">
                      {productCount}
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
                          onClick={() => onEdit?.(row)}
                          title={
                            !canManage
                              ? 'สำหรับผู้มีสิทธิ์เท่านั้น'
                              : isSystem
                                ? 'ประเภทระบบถูกล็อก'
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
                            setConfirm({ type: isActive ? 'archive' : 'restore', row })
                          }
                          title={isSystem ? 'ประเภทระบบถูกล็อก' : undefined}
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
        )}
      </div>

      <ConfirmActionDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={proceed}
        title={`${isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}ประเภทสินค้า`}
        description={`ยืนยันการ${isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}ประเภทสินค้า “${confirm?.row?.name || ''}” หรือไม่?`}
        confirmLabel={isArchive ? 'ปิดใช้งาน' : 'กู้คืน'}
        confirmVariant={isArchive ? 'danger' : 'primary'}
        loading={isSubmitting}
      />
    </>
  );
};

export default ProductTypeTable;
