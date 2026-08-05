import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Clock, Printer } from 'lucide-react';

const BillResultTable = ({ rows, loading, sortKey, sortDir, onSort, onPrint, formatMoney, lastSearchedAt }) => {
  const indicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => onSort('createdAt')}>วันที่ {indicator('createdAt')}</th>
              <th className="px-4 py-3 font-medium">เลขที่บิล</th>
              <th className="px-4 py-3 font-medium">ลูกค้า</th>
              <th className="cursor-pointer px-4 py-3 text-right font-medium" onClick={() => onSort('totalAmount')}>ยอดรวม {indicator('totalAmount')}</th>
              <th className="cursor-pointer px-4 py-3 text-right font-medium" onClick={() => onSort('paidAmount')}>รับชำระ {indicator('paidAmount')}</th>
              <th className="cursor-pointer px-4 py-3 text-right font-medium" onClick={() => onSort('changeAmount')}>เงินทอน {indicator('changeAmount')}</th>
              <th className="px-4 py-3 text-center font-medium">คำสั่ง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString('th-TH') : '-'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.code || row.id}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-800">{row.customerName || row.customer?.name || '-'}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{row.customerPhone || row.customer?.phone || ''}</div>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">฿{formatMoney(row.grossAmount)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-emerald-700">฿{formatMoney(row.paidAmount)}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-500">฿{formatMoney(row.changeAmount)}</td>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => onPrint(row)} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-emerald-100 hover:text-emerald-900">
                    <Printer className="h-3.5 w-3.5" /> พิมพ์
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-t border-slate-100 px-4 py-12 text-center">
          <div className="rounded-full bg-slate-100 p-3 text-slate-400"><AlertCircle className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-700">ไม่พบรายการใบเสร็จในช่วงที่เลือก</div>
          <div className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือขยายช่วงวันที่</div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
        <Clock className="h-3.5 w-3.5" />
        ค้นหาล่าสุด: {lastSearchedAt ? new Date(lastSearchedAt).toLocaleString('th-TH') : 'ยังไม่ได้ค้นหา'}
      </div>
    </section>
  );
};

export default BillResultTable;
