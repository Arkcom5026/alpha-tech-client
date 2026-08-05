import React from 'react';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

const DeliveryNoteResultTable = ({ rows, sortKey, sortDir, onSort, onPrint }) => {
  const indicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />;
  };

  const agingClass = (days) => {
    if (days >= 31) return 'bg-rose-50 text-rose-700';
    if (days >= 8) return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('code')}>เลขที่ใบขาย {indicator('code')}</th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('companyName')}>หน่วยงาน {indicator('companyName')}</th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('customerName')}>ลูกค้า {indicator('customerName')}</th>
              <th className="px-4 py-3">เบอร์โทร</th>
              <th className="px-4 py-3 text-right cursor-pointer" onClick={() => onSort('totalAmount')}>ยอดรวม {indicator('totalAmount')}</th>
              <th className="px-4 py-3 text-right cursor-pointer" onClick={() => onSort('paidAmount')}>ชำระแล้ว {indicator('paidAmount')}</th>
              <th className="px-4 py-3 text-right cursor-pointer" onClick={() => onSort('balanceAmount')}>ค้างชำระ {indicator('balanceAmount')}</th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('createdAt')}>วันที่ขาย {indicator('createdAt')}</th>
              <th className="px-4 py-3 cursor-pointer" onClick={() => onSort('agingDays')}>อายุงาน {indicator('agingDays')}</th>
              <th className="px-4 py-3">ผู้ทำรายการ</th>
              <th className="px-4 py-3 text-center">คำสั่ง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-950">{row.code || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{row.companyName || '-'}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{row.customerName || '-'}</td>
                <td className="px-4 py-3 text-slate-500">{row.customerPhone || '-'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.totalAmount)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{formatMoney(row.paidAmount)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-rose-700">{formatMoney(row.balanceAmount)}</td>
                <td className="px-4 py-3 text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('th-TH') : '-'}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${agingClass(Number(row.agingDays || 0))}`}>{Number(row.agingDays || 0)} วัน</span></td>
                <td className="px-4 py-3 text-slate-500">{row.employeeName || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => onPrint(row)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-50 px-3 text-xs font-semibold text-teal-800 hover:bg-teal-100">
                    <Printer className="h-3.5 w-3.5" /> พิมพ์
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="px-4 py-12 text-center text-sm text-slate-500">ไม่พบใบส่งสินค้าตามเงื่อนไขที่เลือก</div>}
    </section>
  );
};

export default DeliveryNoteResultTable;
