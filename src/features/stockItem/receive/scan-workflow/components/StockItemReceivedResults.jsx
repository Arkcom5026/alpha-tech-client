import { CheckCircle2 } from 'lucide-react';

const StockItemReceivedResults = ({
  rows = [],
  resolveProductName,
  lastFlashBarcode,
  editingBarcodeReceiptId,
  editSerialInputRef,
  editingSN,
  setEditingSN,
  editingSubmitting,
  onSaveEditSN,
  onCancelEditSN,
  onStartEditSN,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="รายการรับแล้ว">
    <div className="mb-3 flex items-center gap-2">
      <CheckCircle2 className="text-emerald-500" size={20} />
      <h2 className="font-semibold text-slate-900">รายการรับแล้ว</h2>
    </div>

    <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          ยังไม่มีรายการรับเข้า
        </p>
      ) : rows.map((row, index) => {
        const isEditing = editingBarcodeReceiptId === row.id;
        const isFlashed = lastFlashBarcode === String(row.barcode || '');

        return (
          <article
            key={row.id ?? `${row.barcode}-${index}`}
            className={`rounded-xl border p-3 ${isFlashed ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">{resolveProductName(row)}</p>
                <p className="mt-1 font-mono text-sm text-teal-700">{row.barcode || '-'}</p>
              </div>

              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={editSerialInputRef}
                    value={editingSN}
                    onChange={(event) => setEditingSN(event.target.value)}
                    placeholder="เว้นว่างเพื่อล้าง SN"
                    className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    disabled={editingSubmitting}
                    onClick={() => onSaveEditSN(row)}
                    className="min-h-11 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    disabled={editingSubmitting}
                    onClick={onCancelEditSN}
                    className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">พร้อมขาย</span>
                  <span className="font-mono text-sm text-slate-600">SN: {row.serialNumber || '-'}</span>
                  <button
                    type="button"
                    onClick={() => onStartEditSN(row)}
                    className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                  >
                    แก้ไข SN
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  </section>
);

export default StockItemReceivedResults;
