import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTemplateCandidate from '../hooks/useTemplateCandidate';
import {
  TEMPLATE_CANDIDATE_STATUS,
  getCandidateStatusLabel,
  getCandidateTypeLabel,
} from '../utils/candidateStatus';
import { BUSINESS_TYPE_OPTIONS, getBusinessTypeLabel } from '../utils/businessType';
import CandidateReviewWorkspaceHeader from '../workspace/components/CandidateReviewWorkspaceHeader';
import CandidateBusinessTypeScope from '../workspace/components/CandidateBusinessTypeScope';
import CandidateCatalogQualityScanner from '../workspace/components/CandidateCatalogQualityScanner';
import CandidateReviewSummary from '../workspace/components/CandidateReviewSummary';
import CandidateReviewFilters from '../workspace/components/CandidateReviewFilters';
import CandidateReviewQueue from '../workspace/components/CandidateReviewQueue';

const STATUS_OPTIONS = ['', ...Object.values(TEMPLATE_CANDIDATE_STATUS)];
const SORT_OPTIONS = [
  ['createdAt', 'สร้างล่าสุด'],
  ['updatedAt', 'อัปเดตล่าสุด'],
  ['reviewedAt', 'ตรวจสอบล่าสุด'],
  ['resolvedAt', 'จัดการล่าสุด'],
  ['status', 'สถานะ'],
  ['type', 'ประเภท Candidate'],
];

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
    mutating,
    error,
    refresh,
    scanDuplicates,
    scanOrphans,
    scanQuality,
  } = useTemplateCandidate();

  const [filters, setFilters] = React.useState({
    businessType: '',
    q: '',
    status: '',
    reviewerId: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    page: 1,
    pageSize: 30,
  });

  const hasBusinessType = Boolean(filters.businessType);

  const loadQueue = React.useCallback((next) => {
    if (!next?.businessType) return Promise.resolve(null);
    return refresh(next);
  }, [refresh]);

  const applyFilters = (next) => {
    setFilters(next);
    return loadQueue(next);
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const handleBusinessType = (businessType) => {
    const next = {
      ...filters,
      businessType,
      status: '',
      reviewerId: '',
      page: 1,
    };
    applyFilters(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    applyFilters({ ...filters, page: 1 });
  };

  const handlePage = (page) => applyFilters({ ...filters, page });
  const handleStatus = (status) => applyFilters({ ...filters, status, page: 1 });
  const handleReviewer = (reviewerId) => applyFilters({ ...filters, reviewerId: String(reviewerId), page: 1 });
  const handleOpenCandidate = (candidateId) => navigate(`${detailBasePath}/${candidateId}`);

  const statusCounts = summary?.byStatus || {};
  const total = hasBusinessType ? (summary?.total ?? pagination?.total ?? candidates.length) : 0;
  const page = pagination?.page || filters.page;
  const totalPages = Math.max(pagination?.totalPages || 1, 1);
  const totalRows = pagination?.total ?? candidates.length;

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 xl:p-6">
      <CandidateReviewWorkspaceHeader
        loading={loading || mutating}
        hasBusinessType={hasBusinessType}
        onRefresh={() => loadQueue(filters)}
      />

      <CandidateBusinessTypeScope
        options={BUSINESS_TYPE_OPTIONS}
        businessType={filters.businessType}
        hasBusinessType={hasBusinessType}
        onSelect={handleBusinessType}
      />

      {hasBusinessType && (
        <>
          <CandidateCatalogQualityScanner
            businessType={filters.businessType}
            busy={loading || mutating}
            onScanDuplicates={scanDuplicates}
            onScanOrphans={scanOrphans}
            onScanQuality={scanQuality}
            onRefresh={() => loadQueue(filters)}
          />

          <CandidateReviewSummary
            statuses={Object.values(TEMPLATE_CANDIDATE_STATUS)}
            total={total}
            statusCounts={statusCounts}
            getStatusLabel={getCandidateStatusLabel}
            onSelectStatus={handleStatus}
          />

          <CandidateReviewFilters
            filters={filters}
            statusOptions={STATUS_OPTIONS}
            sortOptions={SORT_OPTIONS}
            loading={loading}
            getStatusLabel={getCandidateStatusLabel}
            onUpdateFilter={updateFilter}
            onSearch={handleSearch}
          />

          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error.message || String(error)}
            </div>
          )}

          <CandidateReviewQueue
            candidates={candidates}
            reviewerWorkload={reviewerWorkload}
            loading={loading}
            businessType={filters.businessType}
            page={page}
            totalPages={totalPages}
            totalRows={totalRows}
            getBusinessTypeLabel={getBusinessTypeLabel}
            getStatusLabel={getCandidateStatusLabel}
            getTypeLabel={getCandidateTypeLabel}
            onOpenCandidate={handleOpenCandidate}
            onPage={handlePage}
            onReviewer={handleReviewer}
          />
        </>
      )}
    </div>
  );
};

export default CandidateReviewPage;
