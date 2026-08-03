export const projectSaleCustomerSection = ({
  search,
  editor,
  selection = {},
  feedback = {},
}) => ({
  search: {
    query: search.query,
    setQuery: search.setQuery,
    results: search.results,
    selectedResultId: search.selectedResultId,
    setSelectedResultId: search.setSelectedResultId,
    loading: search.loading,
    error: search.error,
    clearSearch: search.clearSearch,
    submitSearch: search.submitSearch,
  },
  editor: {
    editor: editor.editor,
    isModified: editor.isModified,
    patchEditor: editor.patchEditor,
  },
  selection: {
    selectedCustomer: selection.selectedCustomer || null,
    hasSelectedCustomer: Boolean(selection.selectedCustomer?.id),
    pendingCreate: Boolean(selection.pendingCreate),
  },
  feedback: {
    formError: feedback.formError || search.error || '',
    formInfo: feedback.formInfo || '',
  },
});
