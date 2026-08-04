import { useCallback, useState } from 'react';
import { listCanonicalProductGroupsApi } from '../api/templateCandidateApi';

const EMPTY_PAGINATION = { page: 1, pageSize: 30, total: 0, totalPages: 1 };

const useCanonicalProductGroups = () => {
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState({ totalGroups: 0, ready: 0, productTypeReviewRequired: 0 });
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [templateBranch, setTemplateBranch] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (filters) => {
    if (!filters?.businessType) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await listCanonicalProductGroupsApi(filters);
      const payload = response?.data ?? response ?? {};
      setGroups(Array.isArray(payload.items) ? payload.items : []);
      setSummary(payload.summary || {});
      setPagination(payload.pagination || EMPTY_PAGINATION);
      setTemplateBranch(payload.templateBranch || null);
      setCategoryId(payload.categoryId ?? null);
      return payload;
    } catch (nextError) {
      setError(nextError);
      throw nextError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { groups, summary, pagination, templateBranch, categoryId, loading, error, refresh };
};

export default useCanonicalProductGroups;
