export const projectSaleDocumentSearch = ({
  rows,
  loading,
  error,
  lastQuery,
  lastSearchedAt,
  search,
  clearError,
  reset,
} = {}) => ({
  rows: Array.isArray(rows) ? rows : [],
  loading: Boolean(loading),
  error: error || null,
  lastQuery: lastQuery || null,
  lastSearchedAt: lastSearchedAt || null,
  actions: {
    search,
    clearError,
    reset,
  },
});
