export const projectSaleCustomerSection = ({
  search,
  editor,
  selectedCustomer,
  pendingCreate,
  formError,
  formInfo,
}) => ({
  search: {
    phone: search.phone,
    rawPhone: search.rawPhone,
    searchMode: search.searchMode,
    nameSearch: search.nameSearch,
    results: search.results,
    selectedResultId: search.selectedResultId,
    loading: search.loading,
    error: search.error,
  },
  editor: {
    ...editor.editor,
    isModified: editor.isModified,
  },
  selection: {
    selectedCustomer,
    hasSelectedCustomer: Boolean(selectedCustomer?.id),
    pendingCreate,
  },
  feedback: {
    error: formError || search.error || '',
    info: formInfo || '',
  },
});
