import { useAuthStore } from '@/features/auth/store/authStore';

import { usePurchaseOrderEditor } from './usePurchaseOrderEditor';
import { usePurchaseOrderProductSearch } from './usePurchaseOrderProductSearch';
import { usePurchaseOrderReferenceData } from './usePurchaseOrderReferenceData';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const usePurchaseOrderForm = (mode, searchText) => {
  const authBranchId = useAuthStore((state) => (
    state?.employee?.branchId ??
    state?.employee?.branch?.id ??
    state?.currentEmployee?.branchId ??
    state?.currentEmployee?.branch?.id ??
    state?.branch?.id ??
    state?.branchId
  ));

  const currentBranchId = toPositiveInt(authBranchId);

  const productSearch = usePurchaseOrderProductSearch({
    currentBranchId,
    searchText,
  });

  const referenceData = usePurchaseOrderReferenceData({
    currentBranchId,
    productTypeId: productSearch.productTypeId,
  });

  const editor = usePurchaseOrderEditor({
    mode,
    currentBranchId,
    suppliers: referenceData.suppliers,
  });

  return {
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
  };
};
