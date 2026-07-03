// src/features/product/templateCandidate/hooks/useTemplateCandidate.js
import { useCallback, useEffect } from 'react';
import useTemplateCandidateStore from '../store/templateCandidateStore';

export const useTemplateCandidate = ({ autoFetch = false, filters = {} } = {}) => {
  const store = useTemplateCandidateStore();

  const refresh = useCallback(
    (nextFilters = filters) => store.fetchTemplateCandidates(nextFilters),
    [store, filters]
  );

  useEffect(() => {
    if (autoFetch) refresh(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return {
    candidates: store.candidates,
    selectedCandidate: store.selectedCandidate,
    pagination: store.pagination,
    loading: store.loading,
    submitting: store.submitting,
    promoting: store.promoting,
    error: store.error,
    refresh,
    fetchById: store.fetchTemplateCandidateById,
    submitCandidate: store.submitTemplateCandidateAction,
    promoteCandidate: store.promoteTemplateCandidateAction,
    rejectCandidate: store.rejectTemplateCandidateAction,
    requestRevision: store.requestTemplateCandidateRevisionAction,
    mergeCandidate: store.mergeTemplateCandidateAction,
    clearError: store.clearTemplateCandidateError,
  };
};

export default useTemplateCandidate;
