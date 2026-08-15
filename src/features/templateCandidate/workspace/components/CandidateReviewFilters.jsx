const CandidateReviewFilters = ({
  filters,
  statusOptions,
  sortOptions,
  loading,
  getStatusLabel,
  onUpdateFilter,
  onSearch,
}) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <form onSubmit={onSearch} className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_190px_150px_180px_140px_120px]">
      <input
        type="search"
        value={filters.q}
        onChange={(event) => onUpdateFilter('q', event.target.value)}
        placeholder="ค้นหา Candidate ID, สินค้า, ร้าน หรือ Template..."
        className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <select
        value={filters.status}
        onChange={(event) => onUpdateFilter('status', event.target.value)}
        className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
      >
        {statusOptions.map((status) => (
          <option key={status || 'ALL'} value={status}>
            {status ? getStatusLabel(status) : 'ทุกสถานะ'}
          </option>
        ))}
      </select>
      <input
        value={filters.reviewerId}
        onChange={(event) => onUpdateFilter('reviewerId', event.target.value.replace(/\D/g, ''))}
        placeholder="Reviewer ID"
        inputMode="numeric"
        className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold"
      />
      <select
        value={filters.sortBy}
        onChange={(event) => onUpdateFilter('sortBy', event.target.value)}
        className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
      >
        {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select
        value={filters.sortDirection}
        onChange={(event) => onUpdateFilter('sortDirection', event.target.value)}
        className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
      >
        <option value="desc">มาก → น้อย</option>
        <option value="asc">น้อย → มาก</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        className="min-h-11 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        ค้นหา
      </button>
    </form>
  </section>
);

export default CandidateReviewFilters;
