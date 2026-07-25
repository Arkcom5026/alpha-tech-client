import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Eye,
  FileText,
  Layers,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  User,
} from 'lucide-react';

import { usePurchaseOrderList } from '../hooks/usePurchaseOrderList';
import PurchaseOrderStatusBadge from '../list/components/PurchaseOrderStatusBadge';
import { projectPurchaseOrderListRows } from '../list/projections/purchaseOrderListRowProjection';

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';

  const {
    purchaseOrders,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    showAllHistory,
    setShowAllHistory,
  } = usePurchaseOrderList();

  const rows = useMemo(
    () => projectPurchaseOrderListRows(purchaseOrders),
    [purchaseOrders]
  );

  const orderPath = (action, id) =>
    `/${targetSlug}/pos/purchases/orders/${action}/${id}`;

  return (
    <div className="h-full w-full space-y-6 p-6 text-slate-800 animate-fadeIn">
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            ใบสั่งซื้อ
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            ค้นหา ตรวจสอบ แก้ไข และพิมพ์เอกสารจัดซื้อ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ PO หรือชื่อคู่ค้า..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-64 rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-orange-500 focus:bg-white"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
            <input
              type="checkbox"
              checked={showAllHistory}
              onChange={(event) => setShowAllHistory(event.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            <span>แสดงประวัติทั้งหมด</span>
          </label>

          <button
            type="button"
            onClick={() => navigate(`/${targetSlug}/pos/purchases/orders/create`)}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            สร้างใบสั่งซื้อ
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4 text-xs font-bold text-orange-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          กำลังโหลดข้อมูลใบสั่งซื้อ...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-black text-rose-600">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-100 bg-slate-50/70 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="p-4"><Calendar className="mr-1 inline h-3.5 w-3.5" />วันที่</th>
                <th className="p-4"><FileText className="mr-1 inline h-3.5 w-3.5" />เลขที่ PO</th>
                <th className="p-4"><User className="mr-1 inline h-3.5 w-3.5" />คู่ค้า</th>
                <th className="p-4 text-right">ยอดรวม</th>
                <th className="p-4 text-center"><Layers className="mr-1 inline h-3.5 w-3.5" />สถานะ</th>
                <th className="p-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-sm font-bold italic text-slate-400">
                    ไม่พบข้อมูลใบสั่งซื้อ
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="group transition hover:bg-slate-50/80">
                    <td className="p-4 text-sm font-semibold text-slate-500">
                      {row.createdAtLabel}
                    </td>
                    <td className="p-4 text-sm font-black text-slate-900">
                      {row.code}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      {row.supplierName}
                    </td>
                    <td className="p-4 text-right text-sm font-black text-slate-950">
                      ฿{row.totalAmountLabel}
                    </td>
                    <td className="p-4 text-center">
                      <PurchaseOrderStatusBadge status={row.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          title="ดูรายละเอียด"
                          onClick={() => navigate(orderPath('view', row.id))}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title={row.canEdit ? 'แก้ไข' : 'แก้ไขได้เฉพาะสถานะรอดำเนินการ'}
                          disabled={!row.canEdit}
                          onClick={() => navigate(orderPath('edit', row.id))}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="พิมพ์"
                          onClick={() => navigate(orderPath('print', row.id))}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
