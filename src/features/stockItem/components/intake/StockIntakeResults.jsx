import React from 'react';
import { ArrowRight, CalendarDays, PackageSearch, UserRound } from 'lucide-react';

const thDate = new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });

function PendingBadge({ type, value }) {
  const count = Number(value || 0);
  const tone = type === 'SN'
    ? 'border-blue-200 bg-blue-50 text-blue-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return (
    <span className={`inline-flex min-h-8 items-center justify-center rounded-full border px-3 text-xs font-bold tabular-nums ${tone}`}>
      {type} {count}
    </span>
  );
}

function IntakeAction({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 sm:w-auto"
    >
      ยิงรับสต๊อก
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export default function StockIntakeResults({ rows = [], loading = false, error = null, onRetry, onScan }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm" role="status">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
        <p className="mt-3 text-sm font-semibold text-slate-500">กำลังโหลดคิวรับสินค้าเข้าสู่สต๊อก</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm" role="alert">
        <p className="font-bold">โหลดคิวรับสินค้าไม่สำเร็จ</p>
        <p className="mt-1 break-words text-sm">{typeof error === 'string' ? error : error?.message || 'กรุณาลองใหม่อีกครั้ง'}</p>
        <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl border border-rose-300 bg-white px-4 text-sm font-bold hover:bg-rose-100">
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <PackageSearch className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 font-bold text-slate-800">ไม่มีคิวรับสินค้าเข้าสู่สต๊อก</p>
        <p className="mt-1 text-sm text-slate-500">ไม่มีใบรับที่ตรงกับตัวกรองในขณะนี้</p>
      </div>
    );
  }

  return (
    <section aria-label="รายการคิวรับสินค้าเข้าสู่สต๊อก">
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">ใบตรวจรับ</p>
                <p className="truncate font-mono text-sm font-bold text-slate-950">{row.code || '-'}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <PendingBadge type="SN" value={row.pendingSN} />
                <PendingBadge type="LOT" value={row.pendingLOT} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">เลข PO</p>
                <p className="mt-1 truncate font-mono font-semibold text-slate-800">{row.purchaseOrderCode || '-'}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs font-semibold text-slate-500"><CalendarDays className="h-3.5 w-3.5" /> วันที่</p>
                <p className="mt-1 font-semibold text-slate-800">{row.createdAt ? thDate.format(new Date(row.createdAt)) : '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="flex items-center gap-1 text-xs font-semibold text-slate-500"><UserRound className="h-3.5 w-3.5" /> Supplier</p>
                <p className="mt-1 truncate font-semibold text-slate-800">{row.supplier || '-'}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <IntakeAction onClick={() => onScan?.(row)} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">เลข PO</th>
                <th className="px-4 py-3">เลข RC</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-center">SN ค้าง</th>
                <th className="px-4 py-3 text-center">LOT ค้าง</th>
                <th className="px-4 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">{row.purchaseOrderCode || '-'}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-950">{row.code || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{row.createdAt ? thDate.format(new Date(row.createdAt)) : '-'}</td>
                  <td className="max-w-[260px] truncate px-4 py-3 font-semibold text-slate-700">{row.supplier || '-'}</td>
                  <td className="px-4 py-3 text-center"><PendingBadge type="SN" value={row.pendingSN} /></td>
                  <td className="px-4 py-3 text-center"><PendingBadge type="LOT" value={row.pendingLOT} /></td>
                  <td className="px-4 py-3 text-right"><IntakeAction onClick={() => onScan?.(row)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
