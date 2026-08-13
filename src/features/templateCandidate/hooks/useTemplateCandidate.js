import { useCallback, useEffect } from 'react';
import useTemplateCandidateStore from '../store/templateCandidateStore';

export const useTemplateCandidate = ({ autoFetch = false, filters = {} } = {}) => {
  const store = useTemplateCandidateStore();

  const refresh = useCallback(
    (nextFilters = filters) => store.fetchTemplateCandidates(nextFilters),
    [store.fetchTemplateCandidates, filters]
  );

  useEffect(() => {
    if (autoFetch) refresh(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return {
    candidates: store.candidates,
    selectedCandidate: store.selectedCandidate,
    pagination: store.pagination,
    summary: store.summary,
    reviewerWorkload: store.reviewerWorkload,
    loading: store.loading,
    mutating: store.mutating,
    error: store.error,
    refresh,
    fetchById: store.fetchTemplateCandidateById,
    createCandidate: store.createTemplateCandidateAction,
    createCatalogQualityCandidate: store.createCatalogQualityCandidateAction,
    scanDuplicates: store.scanCatalogDuplicateCandidatesAction,
    scanOrphans: store.scanCatalogOrphanCandidatesAction,
    scanQuality: store.scanCatalogQualityCandidatesAction,
    startReview: store.startTemplateCandidateReviewAction,
    rejectCandidate: store.rejectTemplateCandidateAction,
    resolveDuplicate: store.resolveCatalogDuplicateCandidateAction,
    archiveOrphan: store.archiveCatalogOrphanCandidateAction,
    clearError: store.clearTemplateCandidateError,
  };
};

export default useTemplateCandidate;
