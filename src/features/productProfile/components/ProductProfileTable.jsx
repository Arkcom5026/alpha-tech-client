// ✅ src/features/productProfile/components/ProductProfileTable.jsx
import React, { useMemo, useState, useEffect } from 'react';
import useProductProfileStore from '../store/productProfileStore';
import useProductStore from '@/features/product/store/productStore';

// ✅ Table ไม่เช็ค auth เอง (ให้ Page ตัดสินสิทธิ์และส่ง canManage ลงมา)

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>
);

const ActionButton = ({ children, className = '', ...rest }) => (
  <button
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const ProductProfileTable = ({ data = [], loading, error, page = 1, limit = 20, onEdit, canManage = false }) => {
  const { archiveProfileAction, restoreProfileAction, isSubmitting } = useProductProfileStore();
  const isAdmin = !!canManage;

  // โหลด dropdowns ของสินค้าเพื่อใช้ map id -> name
  const { dropdowns, ensureDropdownsAction } = useProductStore();
  const { categories, productTypes } = dropdowns || {};

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

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [confirm, setConfirm] = useState(null); // { type: 'archive'|'restore', row }

  const handleArchive = (row) => setConfirm({ type: 'archive', row });
  const handleRestore = (row) => setConfirm({ type: 'restore', row });

  const proceed = async () => {
    if (!confirm?.row) return;
    if (confirm.type === 'archive') await archiveProfileAction(confirm.row.id);
    if (confirm.type === 'restore') await restoreProfileAction(confirm.row.id);
    setConfirm(null);
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[1100px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">รายการแบรนด์</div>
            <div className="text-xs text-zinc-500">ทั้งหมด {rows.length} รายการ</div>
          </div>
        </div>

        {error && <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{String(error)}</div>}

        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2 w-[60px] text-center">#</th>
              <th className="px-4 py-2 w-[30%]">ชื่อแบรนด์</th>
              <th className="px-4 py-2 w-[22%]">ประเภทสินค้า</th>
              <th className="px-4 py-2 w-[22%]">หมวดหมู่</th>
              <th className="px-4 py-2 w-[10%] text-center">สถานะ</th>
              <th className="px-4 py-2 text-right w-[22%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
              </tr>
            )}

            {rows.map((row, idx) => {
              const productTypeId = row.productTypeId ?? row.productType?.id ?? null;
              const productTypeObj = productTypesById[String(productTypeId)] || null;
              const productTypeName = row.productType?.name || productTypeObj?.name || '-';

              const categoryIdFromRow = row.categoryId ?? row.category?.id ?? row.productType?.categoryId ?? productTypeObj?.categoryId ?? null;
              const categoryName = row.productType?.category?.name || row.category?.name || categoriesById[String(categoryIdFromRow)]?.name || '-';
              const isActive = !!row.active;
              const isSystem = !!row.isSystem;
                            const canEdit = isAdmin && !isSystem && isActive;
              const canArchive = isAdmin && !isSystem && isActive;
              const canRestore = isAdmin && !isSystem && !isActive;

              return (
                <tr
                  key={row.id}
                  className={`border-b border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 ${idx % 2 === 1 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-900/40'}`}
                >
                  <td className="px-4 py-3 text-center align-middle">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-800 dark:text-zinc-100">{row.name}</span>
                      {isSystem && (
                        <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-400/30">ระบบ</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">{productTypeName}</td>
                  <td className="px-4 py-3 align-middle">{categoryName}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    {isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30">ใช้งาน</Badge>
                    ) : (
                      <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">ปิดใช้งาน</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-end min-w-[220px]">
                      <ActionButton
                        className="border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed"
                        disabled={!canEdit}
                        onClick={() => onEdit?.(row)}
                      >
                        แก้ไข
                      </ActionButton>

                      {isActive ? (
                        <ActionButton
                          className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 disabled:bg-rose-400"
                          disabled={!canArchive}
                          onClick={() => handleArchive(row)}
                        >
                          ปิดใช้งาน
                        </ActionButton>
                      ) : (
                        <ActionButton
                          className="bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"
                          disabled={!canRestore}
                          onClick={() => handleRestore(row)}
                        >
                          กู้คืน
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">กำลังโหลดข้อมูล...</td>
              </tr>
            )}
          </tbody>
        </table>

        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.type === 'archive' ? 'ปิดใช้งาน' : 'กู้คืน'} แบรนด์ “{confirm.row?.name}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={() => setConfirm(null)}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={proceed} disabled={isSubmitting}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductProfileTable;









