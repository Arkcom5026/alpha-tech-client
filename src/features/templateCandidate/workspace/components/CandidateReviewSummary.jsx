const CandidateReviewSummary = ({ statuses, total, statusCounts, getStatusLabel, onSelectStatus }) => (
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">ทั้งหมด</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{total}</p>
    </div>
    {statuses.map((status) => (
      <button
        key={status}
        type="button"
        onClick={() => onSelectStatus(status)}
        className="min-h-24 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-300 hover:bg-orange-50/40"
      >
        <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          {getStatusLabel(status)}
        </p>
        <p className="mt-2 text-2xl font-black text-slate-900">{statusCounts[status] || 0}</p>
      </button>
    ))}
  </section>
);

export default CandidateReviewSummary;
