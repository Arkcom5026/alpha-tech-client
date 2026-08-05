import React from 'react';
import ScanInput from '../ScanInput';

const SCAN_MODES = ['BARCODE', 'SN'];

const StockAuditScannerWorkspace = React.forwardRef(({
  scanMode = 'BARCODE',
  onScanModeChange,
  onSubmit,
  disabled = false,
  sessionClosed = false,
  isScanning = false,
}, ref) => {
  const placeholder = sessionClosed
    ? 'รอบนี้ถูกปิดแล้ว กรุณาเริ่มรอบใหม่'
    : scanMode === 'SN'
      ? 'สแกนหรือพิมพ์หมายเลขเครื่อง'
      : 'สแกนบาร์โค้ดสินค้า';

  return (
    <section className="rounded-2xl border border-teal-200 bg-white p-4 shadow-sm md:p-5" aria-labelledby="stock-audit-scanner-title">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-teal-700">เครื่องมือหลักของรอบตรวจนับ</p>
          <h2 id="stock-audit-scanner-title" className="mt-1 text-lg font-bold text-slate-950">สแกนสินค้า</h2>
          <p className="mt-1 text-sm text-slate-500">เริ่มรอบก่อน แล้วสแกน Barcode หรือหมายเลขเครื่องได้ทันที</p>
        </div>
        <p className="text-xs font-medium text-slate-500">F2 โฟกัสช่องสแกน · F3 สลับ Barcode / SN</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor="stock-audit-scan-input">
            ค่าที่ต้องการสแกน
          </label>
          <ScanInput
            id="stock-audit-scan-input"
            ref={ref}
            onSubmit={onSubmit}
            disabled={disabled || isScanning}
            placeholder={placeholder}
            autoSubmit
            delay={140}
            className="min-h-12 w-full rounded-xl border border-teal-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600">โหมดสแกน</p>
          <div className="grid grid-cols-2 rounded-xl border border-teal-200 bg-teal-50 p-1 lg:min-w-[220px]">
            {SCAN_MODES.map((mode) => {
              const active = scanMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition ${active
                    ? 'bg-emerald-200 text-emerald-950 shadow-sm'
                    : 'text-teal-900 hover:bg-white'}`}
                  onClick={() => onScanModeChange?.(mode)}
                  aria-pressed={active}
                >
                  {mode === 'BARCODE' ? 'Barcode' : 'SN'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

StockAuditScannerWorkspace.displayName = 'StockAuditScannerWorkspace';

export default StockAuditScannerWorkspace;
