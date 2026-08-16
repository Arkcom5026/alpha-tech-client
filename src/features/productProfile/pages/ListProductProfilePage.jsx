import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system/feedback';
import { useAuthStore } from '@/features/auth/store/authStore';
import useProductProfileStore from '../store/productProfileStore';

const ListProductProfilePage = () => {
  const { shopSlug } = useParams();
  const listBasePath = `/${shopSlug}/pos/stock/profiles`;
  const { isSuperAdmin, canManageProductOrdering } = useAuthStore();
  const canManage = useMemo(
    () => isSuperAdmin || canManageProductOrdering(),
    [isSuperAdmin, canManageProductOrdering],
  );

  const {
    items,
    page,
    total,
    totalPages,
    search,
    includeInactive,
    isLoading,
    isSubmitting,
    error,
    setPageAction,
    setSearchAction,
    setIncludeInactiveAction,
    fetchListAction,
    deleteProfileAction,
  } = useProductProfileStore();

  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!canManage) return;
    fetchListAction().catch((requestError) => {
      feedback.actionError(requestError, 'โหลดรายการโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:list:load:error');
    });
  }, [canManage, fetchListAction, page, search, includeInactive]);

  const confirmDelete = async () => {
    if (!pendingDelete || isSubmitting) return;
    try {
      await deleteProfileAction(pendingDelete.id);
      feedback.actionSuccess('ลบโปรไฟล์สินค้าเรียบร้อยแล้ว', 'product-profile:delete:success');
      setPendingDelete(null);
    } catch (requestError) {
      feedback.actionError(requestError, 'ลบโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:delete:error');
    }
  };

  if (!canManage) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
          คุณไม่มีสิทธิ์จัดการโปรไฟล์สินค้าในบัญชีนี้
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Product Profile</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">โปรไฟล์สินค้า</h1>
            <p className="mt-1 text-sm text-slate-500">ใช้เป็นตัวช่วยจัดกลุ่มรูปแบบซ้ำภายในประเภทสินค้า ไม่จำเป็นต้องมีทุกสินค้า</p>
          </div>
          <Link to={`${listBasePath}/create`} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-center text-sm font-black text-white hover:bg-emerald-800">
            เพิ่มโปรไฟล์สินค้า
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearchAction(event.target.value)}
              placeholder="ค้นหาชื่อโปรไฟล์สินค้า"
              className="min-h-11 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              disabled={isLoading || isSubmitting}
            />
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(event) => setIncludeInactiveAction(event.target.checked)}
                disabled={isLoading || isSubmitting}
              />
              แสดงรายการที่ไม่ใช้งาน
            </label>
            <button
              type="button"
              onClick={() => fetchListAction().catch((requestError) => feedback.actionError(requestError, 'โหลดรายการโปรไฟล์สินค้าไม่สำเร็จ', 'product-profile:list:reload:error'))}
              disabled={isLoading || isSubmitting}
              className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 disabled:opacity-50"
            >
              {isLoading ? 'กำลังโหลด...' : 'โหลดใหม่'}
            </button>
          </div>
        </section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{String(error)}</div>}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ชื่อโปรไฟล์</th>
                  <th className="px-4 py-3">ประเภทสินค้า</th>
                  <th className="px-4 py-3">รายละเอียด</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-bold text-slate-900">{item.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{item.productType?.name || item.productTypeName || '-'}</td>
                    <td className="max-w-md px-4 py-3 text-slate-600">{item.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`${listBasePath}/edit/${item.id}`} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">แก้ไข</Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          disabled={isSubmitting}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 disabled:opacity-50"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">ไม่พบโปรไฟล์สินค้า</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>ทั้งหมด {Number(total || 0).toLocaleString('th-TH')} รายการ</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPageAction(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">ก่อนหน้า</button>
              <span>หน้า {page} / {Math.max(1, totalPages || 1)}</span>
              <button type="button" disabled={page >= totalPages || isLoading} onClick={() => setPageAction(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">ถัดไป</button>
            </div>
          </div>
        </section>
      </main>

      <ConfirmActionDialog
        open={Boolean(pendingDelete)}
        title="ลบโปรไฟล์สินค้า"
        description={`ยืนยันลบ ${pendingDelete?.name || 'โปรไฟล์สินค้านี้'} หรือไม่?`}
        confirmLabel="ลบโปรไฟล์"
        intent="destructive"
        loading={isSubmitting}
        loadingLabel="กำลังลบ..."
        onClose={() => {
          if (!isSubmitting) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default ListProductProfilePage;
