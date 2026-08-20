import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Clock, FilePenLine, Printer, Truck } from 'lucide-react';

const typeMeta = (row) => {
  if (row?.rowKind === 'OUTPUT_TAX_FULL') return { label: 'ใบกำกับภาษีเต็มรูป', className: 'border-blue-100 bg-blue-50 text-blue-700' };
  if (row?.rowKind === 'OUTPUT_TAX_SHORT') return { label: 'ใบกำกับภาษีอย่างย่อ', className: 'border-violet-100 bg-violet-50 text-violet-700' };
  if (row?.rowKind === 'CONSOLIDATED_BILLING') return { label: 'เอกสารรวม', className: 'border-amber-100 bg-amber-50 text-amber-700' };
  return { label: 'รายการขาย / ใบเสร็จ', className: 'border-slate-200 bg-slate-50 text-slate-600' };
};

const statusMeta = (row) => {
  const status = String(row?.documentStatus || row?.status || '').toUpperCase();
  if (row?.documentSourceType === 'TAX_DOCUMENT') {
    if (status === 'REGISTERED') return { label: 'ออกเลขแล้ว', className: 'bg-emerald-50 text-emerald-700' };
    if (status === 'DRAFT') return { label: 'รอออกเลข', className: 'bg-amber-50 text-amber-700' };
    if (status === 'CANCELLED') return { label: 'ยกเลิก', className: 'bg-rose-50 text-rose-700' };
    return { label: status || 'กำลังดำเนินการ', className: 'bg-slate-100 text-slate-600' };
  }
  return { label: 'พร้อมพิมพ์', className: 'bg-slate-100 text-slate-600' };
};

const BillResultTable = ({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
  onPrint,
  onManageTaxDocument,
  onDeliveryNote,
  deliveryBusyId,
  formatMoney,
  lastSearchedAt,
}) => {
  const indicator = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => onSort('createdAt')}>วันที่ {indicator('createdAt')}</th>
              <th className="px-4 py-3 font-medium">เลขที่เอกสาร</th>
              <th className="px-4 py-3 font-medium">ประเภทเอกสาร</th>
              <th className="px-4 py-3 font-medium">ลูกค้า</th>
              <th className="cursor-pointer px-4 py-3 text-right font-medium" onClick={() => onSort('totalAmount')}>ยอดรวม {indicator('totalAmount')}</th>
              <th className="px-4 py-3 text-center font-medium">สถานะ</th>
              <th className="px-4 py-3 text-center font-medium">คำสั่ง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const sourceId = row.documentSourceId ?? row.id;
              const isTaxDocument = row.documentSourceType === 'TAX_DOCUMENT';
              const taxRegistered = isTaxDocument && String(row.documentStatus || row.status || '').toUpperCase() === 'REGISTERED';
              const hasDeliveryNote = !isTaxDocument && (
                Boolean(row.officialDocumentNumber)
                || row.documentSourceType === 'CONSOLIDATED_DELIVERY'
              );
              const deliveryBusy = String(deliveryBusyId || '') === String(sourceId);
              const type = typeMeta(row);
              const status = statusMeta(row);

              return (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString('th-TH') : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">{row.code || row.id}</div>
                    {isTaxDocument && row.issuedTaxDocumentNumber && row.draftDocumentNumber && row.issuedTaxDocumentNumber !== row.draftDocumentNumber ? (
                      <div className="mt-0.5 text-[11px] text-slate-400">อ้างอิง: {row.draftDocumentNumber}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${type.className}`}>{type.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-800">{row.customerName || row.customer?.name || '-'}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{row.customerPhone || row.customer?.phone || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">฿{formatMoney(row.grossAmount ?? row.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-2">
                      {isTaxDocument ? (
                        taxRegistered ? (
                          <button type="button" onClick={() => onPrint(row)} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-emerald-100 hover:text-emerald-900">
                            <Printer className="h-3.5 w-3.5" /> พิมพ์
                          </button>
                        ) : (
                          <button type="button" onClick={() => onManageTaxDocument?.(row)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100">
                            <FilePenLine className="h-3.5 w-3.5" /> จัดการ / ออกใบกำกับภาษี
                          </button>
                        )
                      ) : (
                        <>
                          <button type="button" onClick={() => onPrint(row)} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-emerald-100 hover:text-emerald-900">
                            <Printer className="h-3.5 w-3.5" /> พิมพ์
                          </button>
                          <button
                            type="button"
                            disabled={deliveryBusy}
                            onClick={() => onDeliveryNote?.(row)}
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            {deliveryBusy ? 'กำลังสร้าง...' : hasDeliveryNote ? 'ใบส่งของ' : 'สร้างใบส่งของ'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-t border-slate-100 px-4 py-12 text-center">
          <div className="rounded-full bg-slate-100 p-3 text-slate-400"><AlertCircle className="h-5 w-5" /></div>
          <div className="text-sm font-medium text-slate-700">ไม่พบเอกสารขายในช่วงที่เลือก</div>
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
