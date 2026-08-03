import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTemplateCandidate from '../hooks/useTemplateCandidate';
import {
  TEMPLATE_CANDIDATE_STATUS,
  getCandidateStatusLabel,
} from '../utils/candidateStatus';

const STATUS_OPTIONS = [
  '',
  TEMPLATE_CANDIDATE_STATUS.DRAFT,
  TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW,
  TEMPLATE_CANDIDATE_STATUS.REJECTED,
  TEMPLATE_CANDIDATE_STATUS.MERGED,
  TEMPLATE_CANDIDATE_STATUS.PROMOTED,
  TEMPLATE_CANDIDATE_STATUS.CANCELLED,
];

const SORT_OPTIONS = [
  ['createdAt', 'สร้างล่าสุด'],
  ['updatedAt', 'อัปเดตล่าสุด'],
  ['reviewedAt', 'ตรวจสอบล่าสุด'],
  ['promotedAt', 'Promote ล่าสุด'],
  ['status', 'สถานะ'],
];

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusClass = (status) => {
  const classes = {
    DRAFT: 'bg-slate-100 text-slate-700',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700',
    REJECTED: 'bg-red-50 text-red-700',
    MERGED: 'bg-violet-50 text-violet-700',
    PROMOTED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-zinc-100 text-zinc-600',
  };
  return classes[status] || classes.DRAFT;
};

const CandidateReviewPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const detailBasePath = shopSlug
    ? `/${shopSlug}/superadmin/catalog/candidates`
    : '/superadmin/catalog/candidates';

  const {
    candidates,
    pagination,
    summary,
    reviewerWorkload,
    loading,
    error,
    refresh,
  } = useTemplateCandidate();

  const [filters, setFilters] = React.useState({
    q: '',
    status: '',
    reviewerId: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    page: 1,
    pageSize: 30,
  });

  const loadQueue = React.useCallback(
    (next = filters) => refresh(next),
    [filters, refresh]
  );

  React.useEffect(() => {
    loadQueue(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    loadQueue(next);
  };

  const handlePage = (page) => {
    const next = { ...filters, page };
    setFilters(next);
    loadQueue(next);
  };

  const statusCounts = summary?.byStatus || {};
  const total = summary?.total ?? pagination?.total ?? candidates.length;
  const page = pagination?.page || filters.page;
  const totalPages = Math.max(pagination?.totalPages || 1, 1);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 xl:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
          Catalog Governance
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Product Template Candidate Review Queue</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              ตรวจ Candidate จากสินค้าของแต่ละร้านก่อน Reject, Merge เข้ากับ Template เดิม หรือ Promote เป็น Template ใหม่
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadQueue(filters)}
            disabled={loading}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'กำลังโหลด...' : 'Refresh Queue'}
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">ทั้งหมด</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{total}</p>
        </div>
        {Object.values(TEMPLATE_CANDIDATE_STATUS).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              const next = { ...filters, status, page: 1 };
              setFilters(next);
              loadQueue(next);
            }}
            className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-300 hover:bg-orange-50/40"
          >
            <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
              {getCandidateStatusLabel(status)}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">{statusCounts[status] || 0}</p>
          </button>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_190px_150px_180px_140px_120px]">
          <input
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="ค้นหา Candidate ID, สินค้า, ร้าน หรือ Template..."
            className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status || 'ALL'} value={status}>
                {status ? getCandidateStatusLabel(status) : 'ทุกสถานะ'}
              </option>
            ))}
          </select>
          <input
            value={filters.reviewerId}
            onChange={(event) => updateFilter('reviewerId', event.target.value.replace(/\D/g, ''))}
            placeholder="Reviewer ID"
            inputMode="numeric"
            className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold"
          />
          <select
            value={filters.sortBy}
            onChange={(event) => updateFilter('sortBy', event.target.value)}
            className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
          >
            {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select
            value={filters.sortDirection}
            onChange={(event) => updateFilter('sortDirection', event.target.value)}
            className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
          >
            <option value="desc">มาก → น้อย</option>
            <option value="asc">น้อย → มาก</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-orange-500 disabled:opacity-50"
          >
            ค้นหา
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error.message || String(error)}
        </div>
      )}

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[90px_1.4fr_1fr_1fr_160px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            <div>ID</div><div>Source Product / Store</div><div>Target Template</div><div>Reviewer</div><div>Status / Updated</div>
          </div>
          {loading && candidates.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-slate-500">กำลังโหลด Candidate...</div>
          ) : candidates.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-slate-500">ไม่พบ Candidate ตามเงื่อนไขนี้</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => navigate(`${detailBasePath}/${candidate.id}`)}
                  className="grid w-full grid-cols-[90px_1.4fr_1fr_1fr_160px] gap-3 px-4 py-4 text-left transition hover:bg-orange-50/60"
                >
                  <div className="text-sm font-black text-slate-800">#{candidate.id}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{candidate.sourceProductName || '-'}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                      {candidate.sourceBranchName || '-'} · Product #{candidate.sourceProductId || '-'}
                    </p>
                  </div>
                  <div className="min-w-0 text-sm font-bold text-slate-600">
                    <p className="truncate">{candidate.targetTemplateProductName || 'ยังไม่ผูก Template'}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{candidate.targetTemplateBranchName || '-'}</p>
                  </div>
                  <div className="min-w-0 text-sm font-bold text-slate-600">
                    <p className="truncate">{candidate.reviewedByEmployee?.name || 'ยังไม่มี Reviewer'}</p>
                    <p className="mt-1 text-xs text-slate-400">ID {candidate.reviewedByEmployeeId || '-'}</p>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${getStatusClass(candidate.status)}`}>
                      {getCandidateStatusLabel(candidate.status)}
                    </span>
                    <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(candidate.updatedAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 text-sm font-bold text-slate-600">
            <span>Page {page} / {totalPages} · {pagination?.total ?? candidates.length} รายการ</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => handlePage(page - 1)} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">ก่อนหน้า</button>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => handlePage(page + 1)} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">ถัดไป</button>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-500">Reviewer Workload</p>
          <h2 className="mt-2 text-lg font-black text-slate-900">ภาระงานผู้ตรวจ</h2>
          <div className="mt-4 space-y-3">
            {reviewerWorkload.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">ยังไม่มีงานที่ผูก Reviewer</p>
            ) : reviewerWorkload.map((item) => (
              <button
                key={item.reviewerId}
                type="button"
                onClick={() => {
                  const next = { ...filters, reviewerId: String(item.reviewerId), page: 1 };
                  setFilters(next);
                  loadQueue(next);
                }}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800">Reviewer #{item.reviewerId}</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">ค้าง {item.pending}</span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">Assigned {item.assigned} · Reviewed {item.reviewed}</p>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CandidateReviewPage;
