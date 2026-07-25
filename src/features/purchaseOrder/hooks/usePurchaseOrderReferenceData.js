import { useEffect, useMemo, useState } from 'react';

import {
  getPurchaseOrderBrandsByProductType,
  getPurchaseOrderDropdowns,
  getSuppliers,
} from '../api/purchaseOrderApi';
import {
  mapPurchaseOrderBrandsResponse,
  mapPurchaseOrderDropdownsResponse,
  mapPurchaseOrderSuppliersResponse,
} from '../mappers/purchaseOrderReferenceDataMapper';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const usePurchaseOrderReferenceData = ({ currentBranchId, productTypeId }) => {
  const [supplierList, setSupplierList] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState({ productTypes: [], brands: [] });
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

  const normalizedProductTypeId = useMemo(
    () => toPositiveInt(productTypeId),
    [productTypeId]
  );

  useEffect(() => {
    if (!currentBranchId) {
      setSupplierList([]);
      return;
    }

    let alive = true;
    setSuppliersLoading(true);

    getSuppliers({ branchId: currentBranchId, _ts: Date.now() })
      .then((data) => {
        if (alive) setSupplierList(mapPurchaseOrderSuppliersResponse(data));
      })
      .catch((error) => {
        if (!alive) return;
        console.error('[PO] load suppliers failed:', error);
        setSupplierList([]);
      })
      .finally(() => {
        if (alive) setSuppliersLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId]);

  useEffect(() => {
    if (!currentBranchId) {
      setDropdowns({ productTypes: [], brands: [] });
      return;
    }

    let alive = true;
    setDropdownsLoading(true);

    getPurchaseOrderDropdowns()
      .then((payload) => {
        if (!alive) return;
        setDropdowns(mapPurchaseOrderDropdownsResponse(payload));
      })
      .catch((error) => {
        if (!alive) return;
        console.error('[PO] load dropdowns failed:', error);
        setDropdowns({ productTypes: [], brands: [] });
      })
      .finally(() => {
        if (alive) setDropdownsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId]);

  useEffect(() => {
    if (!currentBranchId || !normalizedProductTypeId) return;

    let alive = true;

    getPurchaseOrderBrandsByProductType(normalizedProductTypeId)
      .then((data) => {
        if (!alive) return;
        const brands = mapPurchaseOrderBrandsResponse(data);
        setDropdowns((previous) => ({ ...previous, brands }));
      })
      .catch((error) => {
        if (alive) console.error('[PO] load brands by product type failed:', error);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId, normalizedProductTypeId]);

  return {
    suppliers: supplierList,
    suppliersLoading,
    dropdowns,
    dropdownsLoading,
  };
};
