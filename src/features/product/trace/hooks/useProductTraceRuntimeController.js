import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useProductTraceRuntimeStore from '../store/productTraceRuntimeStore';

const useProductTraceRuntimeController = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const lookup = useProductTraceRuntimeStore((state) => state.lookup);
  const trace = useProductTraceRuntimeStore((state) => state.trace);
  const loading = useProductTraceRuntimeStore((state) => state.loading);
  const error = useProductTraceRuntimeStore((state) => state.error);
  const errorCode = useProductTraceRuntimeStore((state) => state.errorCode);
  const searched = useProductTraceRuntimeStore((state) => state.searched);
  const lastLoadedAt = useProductTraceRuntimeStore((state) => state.lastLoadedAt);
  const setLookupAction = useProductTraceRuntimeStore((state) => state.setLookupAction);
  const loadTraceAction = useProductTraceRuntimeStore((state) => state.loadTraceAction);
  const reloadTraceAction = useProductTraceRuntimeStore((state) => state.reloadTraceAction);
  const resetAction = useProductTraceRuntimeStore((state) => state.resetAction);

  const queryLookup = useMemo(
    () => String(searchParams.get('barcode') || '').trim(),
    [searchParams]
  );

  useEffect(() => {
    if (!queryLookup) return;
    setLookupAction(queryLookup);
    loadTraceAction(queryLookup);
  }, [queryLookup, setLookupAction, loadTraceAction]);

  const handleLookupChange = useCallback(
    (value) => setLookupAction(value),
    [setLookupAction]
  );

  const handleSearch = useCallback(
    async (value = lookup) => {
      const normalized = String(value ?? '').trim();

      if (normalized) {
        const next = new URLSearchParams(searchParams);
        next.set('barcode', normalized);
        setSearchParams(next, { replace: true });
      }

      return loadTraceAction(normalized);
    },
    [lookup, loadTraceAction, searchParams, setSearchParams]
  );

  const handleReset = useCallback(() => {
    resetAction();
    const next = new URLSearchParams(searchParams);
    next.delete('barcode');
    setSearchParams(next, { replace: true });
  }, [resetAction, searchParams, setSearchParams]);

  return {
    lookup,
    trace,
    loading,
    error,
    errorCode,
    searched,
    lastLoadedAt,
    handleLookupChange,
    handleSearch,
    handleReset,
    reloadTraceAction,
  };
};

export default useProductTraceRuntimeController;
