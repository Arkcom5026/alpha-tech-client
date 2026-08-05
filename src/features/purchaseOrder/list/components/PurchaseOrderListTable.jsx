import React from 'react';
import { Calendar, Eye, FileText, Layers, Pencil, Printer, User } from 'lucide-react';

import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';

const actionButtonClass = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-35';

const PurchaseOrderActions = ({ row, onView, onEdit, onPrint }) => (
  <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
    <button type="button" aria-label={`ดู ${row.code}`} title="ดูรายละเอียด" onClick={() => onView(row.id)} className={actionButtonClass}>
      <Eye className="h-4 w-4" />
    </button>
    <button
      type="button"
      aria-label={`แก้ไข ${row.code}`}
      title={row.canEdit ? 'แก้ไข' : 'แก้ไขได้เฉพาะสถานะรอดำเนินการ'}
      disabled={!row.canEdit}
      onClick={() => onEdit(row.id)}
      className={actionButtonClass}
    >
      <Pencil className="h-4 w-4" />
    </button>
    <button type="button" aria-label={`พิมพ์ ${row.code}`} title="พิมพ์" onClick={() => onPrint(row.id)} className={actionButtonClass}>
      <Printer className="h-4 w-4" />
    </button>
  </div>
);

export default function PurchaseOrderListTable({ rows, isLoading, onView, onEdit, onPrint }) {
  if (!isLoading && rows.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-3 text-base font-semibold text-slate-900">ไม่พบข้อมูลใบสั่งซื้อ</h2>
        <p className="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองประวัติ</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="รายการใบสั่งซื้อ">
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">เลขที่ PO</p>
                <h2 className="mt-0.5 break-all text-base font-bold text-slate-950">{row.code}</h2>
              </div>
              <PurchaseOrderStatusBadge status={row.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-2 flex items-start gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <dt className="text-xs text-slate-500">คู่ค้า</dt>
                  <dd className="break-words font-semibold text-slate-800">{row.supplierName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">วันที่</dt>
                  <dd className="font-semibold text-slate-800">{row.createdAtLabel}</dd>
                </div>
              </div>
              <div className="flex items-start justify-end gap-2.5 text-right">
                <Layers className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">ยอดรวม</dt>
                  <dd className="font-bold tabular-nums text-slate-950">฿{row.totalAmountLabel}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <PurchaseOrderActions row={row} onView={onView} onEdit={onEdit} onPrint={onPrint} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500">
              <th className="px-5 py-4"><Calendar className="mr-1.5 inline h-3.5 w-3.5" />วันที่</th>
              <th className="px-5 py-4"><FileText className="mr-1.5 inline h-3.5 w-3.5" />เลขที่ PO</th>
              <th className="px-5 py-4"><User className="mr-1.5 inline h-3.5 w-3.5" />คู่ค้า</th>
              <th className="px-5 py-4 text-right">ยอดรวม</th>
              <th className="px-5 py-4 text-center"><Layers className="mr-1.5 inline h-3.5 w-3.5" />สถานะ</th>
              <th className="px-5 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-teal-50/40">
                <td className="px-5 py-4 text-sm font-medium text-slate-500">{row.createdAtLabel}</td>
                <td className="px-5 py-4 text-sm font-bold text-slate-950">{row.code}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-700">{row.supplierName}</td>
                <td className="px-5 py-4 text-right text-sm font-bold tabular-nums text-slate-950">฿{row.totalAmountLabel}</td>
                <td className="px-5 py-4 text-center"><PurchaseOrderStatusBadge status={row.status} /></td>
                <td className="px-5 py-4"><PurchaseOrderActions row={row} onView={onView} onEdit={onEdit} onPrint={onPrint} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
