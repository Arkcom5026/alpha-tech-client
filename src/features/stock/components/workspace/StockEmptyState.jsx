const StockEmptyState = ({ title, description, onAction, loading = false, actionLabel = 'โหลดข้อมูลส่วนนี้' }) => (
  <button
    type="button"
    onClick={onAction}
    disabled={loading || !onAction}
    className="w-full rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-6 text-left transition-colors hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
  >
    <p className="text-sm font-semibold text-slate-950">{title}</p>
    {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
    {onAction && (
      <span className="mt-4 inline-flex rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-sm font-semibold text-teal-800">
        {loading ? 'กำลังโหลดข้อมูล...' : actionLabel}
      </span>
    )}
  </button>
);

export default StockEmptyState;
