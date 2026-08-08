const BillShortTaxPrintToolbar = ({ autoPrint, onBack, onPrint }) => (
  <div className="w-full bg-white px-4 py-3 print:hidden">
    <div className="mx-auto flex max-w-[80mm] items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          กลับหน้าขายสินค้า
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          พิมพ์ใบเสร็จ
        </button>
      </div>

      {autoPrint ? (
        <span className="text-xs font-medium text-emerald-300">
          Auto print เปิดอยู่
        </span>
      ) : null}
    </div>
  </div>
)

export default BillShortTaxPrintToolbar
