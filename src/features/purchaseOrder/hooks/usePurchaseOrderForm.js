import { useAuthStore } from '@/features/auth/store/authStore';

import { projectPurchaseOrderFormState } from '../projections/purchaseOrderFormProjection';
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
    mode,
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

  return projectPurchaseOrderFormState({
    currentBranchId,
    editor,
    productSearch,
    referenceData,
  });
};
