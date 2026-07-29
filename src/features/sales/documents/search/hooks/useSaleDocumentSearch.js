import { useCallback, useEffect, useRef } from 'react';

import useSaleDocumentSearchStore from '../store/saleDocumentSearchStore';
import { projectSaleDocumentSearch } from '../projections/saleDocumentSearchProjection';

export const useSaleDocumentSearch = ({ policy, initialQuery, autoSearch = true } = {}) => {
  const didInitRef = useRef(false);

  const rows = useSaleDocumentSearchStore((state) => state.rows);
  const loading = useSaleDocumentSearchStore((state) => state.loading);
  const error = useSaleDocumentSearchStore((state) => state.error);
  const lastQuery = useSaleDocumentSearchStore((state) => state.lastQuery);
  const lastSearchedAt = useSaleDocumentSearchStore((state) => state.lastSearchedAt);
  const searchStore = useSaleDocumentSearchStore((state) => state.search);
  const clearError = useSaleDocumentSearchStore((state) => state.clearError);
  const reset = useSaleDocumentSearchStore((state) => state.reset);

  const search = useCallback(
    (query = {}) => searchStore({ policy, ...(initialQuery || {}), ...(query || {}) }),
    [initialQuery, policy, searchStore]
  );

  useEffect(() => {
    if (!autoSearch || didInitRef.current) return;
    didInitRef.current = true;
    search();
  }, [autoSearch, search]);

  return projectSaleDocumentSearch({
    rows,
    loading,
    error,
    lastQuery,
    lastSearchedAt,
    search,
    clearError,
    reset,
  });
};
