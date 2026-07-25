export const projectPurchaseOrderFormState = ({
  currentBranchId,
  editor,
  productSearch,
  referenceData,
}) => ({
  loading:
    editor.poLoading ||
    referenceData.dropdownsLoading ||
    referenceData.suppliersLoading,
  supplier: editor.supplier,
  setSupplier: editor.setSupplier,
  suppliers: referenceData.suppliers,
  suppliersLoading: referenceData.suppliersLoading,
  creditHint: editor.creditHint,
  orderDate: editor.orderDate,
  setOrderDate: editor.setOrderDate,
  products: editor.products,
  setProducts: editor.setProducts,
  filter: productSearch.filter,
  handleFilterChange: productSearch.handleFilterChange,
  handleCommitSearch: productSearch.handleCommitSearch,
  fetchedProducts: productSearch.fetchedProducts,
  productsLoading: productSearch.productsLoading,
  addProductToOrder: editor.addProductToOrder,
  shouldPrint: editor.shouldPrint,
  setShouldPrint: editor.setShouldPrint,
  submitError: editor.submitError,
  handleCancel: editor.handleCancel,
  handleSubmit: editor.handleSubmit,
  isSubmitting: editor.isSubmitting,
  dropdowns: referenceData.dropdowns,
  currentBranchId,
});
