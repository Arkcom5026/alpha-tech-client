

// ✅ src/features/productTemplate/components/ProductTemplateTable.jsx
import React, { useMemo, useEffect, useState } from 'react';
import useProductTemplateStore from '../store/productTemplateStore';
import useProductStore from '@/features/product/store/productStore';

// Badge component for status labels
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>
);

// Generic action button
const ActionButton = ({ children, className = '', type = 'button', ...rest }) => (
  <button
    type={type}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const resolveActive = (row) => {
  if (typeof row?.active === 'boolean') return row.active;
  if (typeof row?.isActive === 'boolean') return row.isActive;
  if (typeof row?.enabled === 'boolean') return row.enabled;
  if (row?.status) return String(row.status).toUpperCase() !== 'INACTIVE';
  if (row?.deletedAt) return false;
  return true;
};

const ProductTemplateTable = ({
  data = [],
  loading = false,
  error = null,
  page = 1,
  limit = 20,
  onEdit,
  onToggleActive,
}) => {
              
  const store = useProductTemplateStore();
  const toggleActiveAction = onToggleActive || store.toggleActiveAction;

  const { dropdowns, ensureDropdownsAction } = useProductStore();
  const { categories, productTypes, productProfiles } = dropdowns || {};

  useEffect(() => { ensureDropdownsAction?.(); }, [ensureDropdownsAction]);

  const categoriesById = useMemo(() => {
    const m = {};
    (categories || []).forEach((c) => { m[String(c.id)] = c; });
    return m;
  }, [categories]);

  const productTypesById = useMemo(() => {
    const m = {};
    (productTypes || []).forEach((pt) => { m[String(pt.id)] = pt; });
    return m;
  }, [productTypes]);

  const productProfilesById = useMemo(() => {
    const m = {};
    (productProfiles || []).forEach((pp) => { m[String(pp.id)] = pp; });
    return m;
  }, [productProfiles]);

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [confirm, setConfirm] = useState(null);

  const handleToggle = (row) => {
    const nextActive = !resolveActive(row);
    setConfirm({ type: 'toggle', row, nextActive });
  };

  const proceed = async () => {
    if (!confirm?.row || !toggleActiveAction) return setConfirm(null);
    await toggleActiveAction(confirm.row.id);
    setConfirm(null);
  };

  if (error) {
    return <div className="p-4 text-sm text-red-600">{String(error)}</div>;
  }

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[1100px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">รายการสเปกสินค้า (SKU)</div>
            <div className="text-xs text-zinc-500">ทั้งหมด {rows.length} รายการ</div>
          </div>
        </div>

        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2 w-[60px] text-center">#</th>
              <th className="px-4 py-2 w-[20%]">สเปกสินค้า (SKU)</th>
              <th className="px-4 py-2 w-[20%]">รุ่นสินค้า</th>
              <th className="px-4 py-2 w-[20%]">ประเภทสินค้า</th>
              <th className="px-4 py-2 w-[20%]">หมวดสินค้า</th>
              <th className="px-4 py-2 w-[10%] text-center">สถานะ</th>
              <th className="px-4 py-2 text-right w-[20%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
              </tr>
            )}

            {rows.map((row, idx) => {
              const profileId = row.productProfileId ?? row.productProfile?.id ?? null;
              const profileName = row.productProfile?.name || productProfilesById[String(profileId)]?.name || '-';

              const productTypeId = row.productTypeId ?? row.productType?.id ?? null;
              const productTypeName = row.productType?.name || productTypesById[String(productTypeId)]?.name || '-';

              const categoryId = row.categoryId ?? row.category?.id ?? row.productType?.categoryId ?? null;
              const categoryName = row.category?.name || categoriesById[String(categoryId)]?.name || '-';

              const isActive = resolveActive(row);

              return (
                <tr key={row.id} className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 ${idx % 2 === 1 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-900/40'}`}>
                  <td className="px-4 py-3 text-center">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3"><span className="font-medium text-zinc-800 dark:text-zinc-100">{row.name}</span></td>
                  <td className="px-4 py-3">{profileName}</td>
                  <td className="px-4 py-3">{productTypeName}</td>
                  <td className="px-4 py-3">{categoryName}</td>
                  <td className="px-4 py-3 text-center">
                    {isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30">ใช้งาน</Badge>
                    ) : (
                      <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">ปิดใช้งาน</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-end min-w-[220px]">
                      <ActionButton
                        className="border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => onEdit?.(row)}
                        disabled={!onEdit}
                      >
                        แก้ไข
                      </ActionButton>

                      <ActionButton
                        className={`text-white ${isActive ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`}
                        onClick={() => handleToggle(row)}
                        disabled={!toggleActiveAction}
                      >
                        {isActive ? 'ปิดใช้งาน' : 'กู้คืน'}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}

            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">กำลังโหลดข้อมูล...</td>
              </tr>
            )}
          </tbody>
        </table>

        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'} สเปกสินค้า (SKU) “{confirm.row?.name}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={() => setConfirm(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={proceed}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTemplateTable;

