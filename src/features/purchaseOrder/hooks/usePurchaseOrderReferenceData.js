import { useEffect, useMemo, useState } from 'react';

import {
  getPurchaseOrderBrandsByProductType,
  getPurchaseOrderDropdowns,
  getSuppliers,
} from '../api/purchaseOrderApi';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const firstArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
};

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  return firstArray(
    payload?.items,
    payload?.products,
    payload?.data,
    payload?.data?.items,
    payload?.data?.products,
    payload?.rows,
    payload?.records
  );
};

const normalizeProductTypeOption = (row) => {
  const id = toPositiveInt(row?.id ?? row?.productTypeId ?? row?.typeId);
  const name = String(row?.name ?? row?.label ?? row?.title ?? '').trim();
  if (!id || !name) return null;
  return {
    ...row,
    id,
    name,
    active: row?.active ?? row?.isActive ?? true,
  };
};

const normalizeBrandOption = (row) => {
  const id = toPositiveInt(row?.id ?? row?.brandId);
  const name = String(row?.name ?? row?.label ?? row?.title ?? '').trim();
  if (!id || !name) return null;
  return {
    ...row,
    id,
    name,
    active: row?.active ?? row?.isActive ?? true,
  };
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
        if (alive) setSupplierList(pickArray(data));
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
        setDropdowns({
          productTypes: pickArray(payload?.productTypes)
            .map(normalizeProductTypeOption)
            .filter(Boolean),
          brands: pickArray(payload?.brands)
            .map(normalizeBrandOption)
            .filter(Boolean),
        });
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
        const brands = pickArray(data).map(normalizeBrandOption).filter(Boolean);
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
