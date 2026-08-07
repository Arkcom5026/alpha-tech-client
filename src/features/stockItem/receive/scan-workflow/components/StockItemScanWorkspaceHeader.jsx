import { ArrowLeft, ShieldCheck } from 'lucide-react';

const StockItemScanWorkspaceHeader = ({
  receiptLabel,
  shopSlug,
  pendingCount = 0,
  submitting = false,
  onBack,
  onFinalize,
}) => (
  <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-teal-700">รับสินค้าเข้าสต๊อก</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">สแกนรับสินค้าเข้าสต๊อก</h1>
          <p className="mt-1 text-sm text-slate-500">
            ใบรับสินค้า: {receiptLabel}{shopSlug ? ` · ${shopSlug}` : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onFinalize}
        disabled={submitting || pendingCount > 0}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <ShieldCheck size={18} />
        ปิดยอดใบรับสินค้า
      </button>
    </div>
  </header>
);

export default StockItemScanWorkspaceHeader;
