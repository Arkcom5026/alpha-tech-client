import React from 'react';
import { Calendar, Eye, FileText, Layers, Pencil, Printer, User } from 'lucide-react';

import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';

export default function PurchaseOrderListTable({ rows, isLoading, onView, onEdit, onPrint }) {
  return (
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
                  <td className="p-4 text-sm font-semibold text-slate-500">{row.createdAtLabel}</td>
                  <td className="p-4 text-sm font-black text-slate-900">{row.code}</td>
                  <td className="p-4 text-sm font-bold text-slate-700">{row.supplierName}</td>
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
                        onClick={() => onView(row.id)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title={row.canEdit ? 'แก้ไข' : 'แก้ไขได้เฉพาะสถานะรอดำเนินการ'}
                        disabled={!row.canEdit}
                        onClick={() => onEdit(row.id)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="พิมพ์"
                        onClick={() => onPrint(row.id)}
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
  );
}
