const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusClass = (status) => ({
  DRAFT: 'bg-slate-100 text-slate-700',
  OPEN: 'bg-amber-50 text-amber-700',
  UNDER_REVIEW: 'bg-blue-50 text-blue-700',
  REJECTED: 'bg-red-50 text-red-700',
  MERGED: 'bg-violet-50 text-violet-700',
  PROMOTED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-zinc-100 text-zinc-600',
  RESOLVED: 'bg-emerald-50 text-emerald-700',
  DISMISSED: 'bg-slate-100 text-slate-600',
  ARCHIVED: 'bg-zinc-100 text-zinc-700',
}[status] || 'bg-slate-100 text-slate-700');

const CandidateReviewQueue = ({
  candidates,
  reviewerWorkload,
  loading,
  businessType,
  page,
  totalPages,
  totalRows,
  getBusinessTypeLabel,
  getStatusLabel,
  getTypeLabel,
  onOpenCandidate,
  onPage,
  onReviewer,
}) => (
  <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[80px_170px_1.35fr_1fr_1fr_150px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 md:grid">
        <div>ID</div><div>Candidate Type</div><div>Template Product</div><div>Comparison / Scope</div><div>Reviewer</div><div>Status / Updated</div>
      </div>
      {loading && candidates.length === 0 ? (
        <div className="p-10 text-center text-sm font-bold text-slate-500">กำลังโหลด Candidate...</div>
      ) : candidates.length === 0 ? (
        <div className="p-10 text-center text-sm font-bold text-slate-500">ไม่พบ Candidate ในกลุ่ม {getBusinessTypeLabel(businessType)}</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {candidates.map((candidate) => (
            <button key={candidate.id} type="button" onClick={() => onOpenCandidate(candidate.id)} className="grid w-full gap-2 px-4 py-4 text-left transition hover:bg-emerald-50/60 md:grid-cols-[80px_170px_1.35fr_1fr_1fr_150px] md:gap-3">
              <div className="text-sm font-black text-slate-800">#{candidate.id}</div>
              <div>
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{getTypeLabel(candidate.type)}</span>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">{getBusinessTypeLabel(candidate.businessType)}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">{candidate.sourceProductName || '-'}</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">Template Product #{candidate.primaryTemplateProductId || candidate.sourceProductId || '-'}</p>
              </div>
              <div className="min-w-0 text-sm font-bold text-slate-600">
                {candidate.comparisonTemplateProductId ? (
                  <>
                    <p className="truncate">{candidate.comparisonProductName || `Template Product #${candidate.comparisonTemplateProductId}`}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">Comparison #{candidate.comparisonTemplateProductId}</p>
                  </>
                ) : (
                  <>
                    <p className="truncate">Template Branch #{candidate.templateBranchId || '-'}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">refs {candidate.primarySnapshot?.localReferenceCount ?? '-'}</p>
                  </>
                )}
              </div>
              <div className="min-w-0 text-sm font-bold text-slate-600">
                <p className="truncate">{candidate.reviewerName || 'ยังไม่มี Reviewer'}</p>
                <p className="mt-1 text-xs text-slate-400">ID {candidate.reviewedByEmployeeId || '-'}</p>
              </div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${getStatusClass(candidate.status)}`}>{getStatusLabel(candidate.status)}</span>
                <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(candidate.resolvedAt || candidate.updatedAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Page {page} / {totalPages} · {totalRows} รายการ</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)} className="min-h-11 rounded-2xl border border-slate-200 px-4 disabled:opacity-40">ก่อนหน้า</button>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => onPage(page + 1)} className="min-h-11 rounded-2xl border border-slate-200 px-4 disabled:opacity-40">ถัดไป</button>
        </div>
      </div>
    </div>

    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-600">Reviewer Workload</p>
      <h2 className="mt-2 text-lg font-black text-slate-900">{getBusinessTypeLabel(businessType)}</h2>
      <div className="mt-4 space-y-3">
        {reviewerWorkload.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">ยังไม่มีงานที่ผูก Reviewer</p>
        ) : reviewerWorkload.map((item) => (
          <button key={item.reviewerId} type="button" onClick={() => onReviewer(item.reviewerId)} className="min-h-16 w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-slate-800">Reviewer #{item.reviewerId}</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{item.assigned ?? item.total ?? item.count ?? 0}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-400">Pending {item.pending ?? 0} · Reviewed {item.reviewed ?? 0}</p>
          </button>
        ))}
      </div>
    </aside>
  </section>
);

export default CandidateReviewQueue;
