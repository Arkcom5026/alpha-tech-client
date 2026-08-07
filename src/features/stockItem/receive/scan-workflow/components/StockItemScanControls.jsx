import { Barcode, CreditCard } from 'lucide-react';

const StockItemScanControls = ({
  manualSerialMode,
  onSerialModeChange,
  barcodeInputRef,
  barcodeInput,
  setBarcodeInput,
  onBarcodeEnter,
  expectedBarcode,
  serialInputRef,
  snInput,
  setSnInput,
  onSubmit,
  submitting,
  pendingCount,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Barcode className="text-teal-700" size={22} />
        <div>
          <h2 className="font-semibold text-slate-900">จุดสแกนหลัก</h2>
          <p className="text-xs text-slate-500">ใช้ Auto Focus ตามกลุ่มสินค้าที่ค้นหา และเลือกเก็บ SN เมื่อต้องการ</p>
        </div>
      </div>
      <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={manualSerialMode}
          onChange={onSerialModeChange}
          disabled={submitting}
          className="h-4 w-4 rounded border-slate-300"
        />
        เก็บ Serial Number
      </label>
    </div>

    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">บาร์โค้ด</span>
        <input
          ref={barcodeInputRef}
          value={barcodeInput}
          onChange={(event) => setBarcodeInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onBarcodeEnter();
            }
          }}
          placeholder={expectedBarcode || 'สแกนหรือกรอกบาร์โค้ด'}
          disabled={submitting}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </label>

      <label>
        <span className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Serial Number</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">ไม่บังคับ</span>
        </span>
        <input
          ref={serialInputRef}
          value={snInput}
          onChange={(event) => setSnInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={manualSerialMode ? 'ยิงหรือกรอก Serial Number' : 'เว้นว่างได้'}
          disabled={submitting || !manualSerialMode}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
        />
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || pendingCount === 0}
        className="inline-flex min-h-11 h-[52px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <CreditCard size={18} />
        {submitting ? 'กำลังบันทึก…' : 'บันทึกรับเข้า'}
      </button>
    </div>
  </section>
);

export default StockItemScanControls;
