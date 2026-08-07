import React from 'react'

const CustomerReceiptPrintToolbar = ({
  receiptCode = '-',
  autoPrint = false,
  printMode = 'FULL',
  onBack,
  onPrint,
  onChangeMode,
}) => (
  <div className="w-full bg-white px-4 py-3 print:hidden">
    <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700"
        >
          กลับ
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          พิมพ์ใบเสร็จ
        </button>
      </div>

      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => onChangeMode?.('FULL')}
          className={`rounded-md px-3 py-1.5 text-sm font-bold ${
            printMode === 'FULL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          A4
        </button>
        <button
          type="button"
          onClick={() => onChangeMode?.('SHORT')}
          className={`rounded-md px-3 py-1.5 text-sm font-bold ${
            printMode === 'SHORT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          80mm
        </button>
      </div>

      <div className="text-right text-xs font-medium text-slate-500">
        <div>{receiptCode || '-'}</div>
        {autoPrint ? <div className="text-emerald-600">Auto print เปิดอยู่</div> : null}
      </div>
    </div>
  </div>
)

export default CustomerReceiptPrintToolbar
