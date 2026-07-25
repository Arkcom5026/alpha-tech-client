import { useCallback, useEffect, useMemo, useState } from 'react';

import { searchPurchaseOrderProducts } from '../api/purchaseOrderApi';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const toNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
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

export const pickPurchaseOrderCostPrice = (row) => {
  const branchPrice = Array.isArray(row?.branchPrice)
    ? row.branchPrice[0]
    : row?.branchPrice;
  const branchPrices = Array.isArray(row?.branchPrices)
    ? row.branchPrices[0]
    : row?.branchPrices;
  const stockBalance = row?.stockBalance || row?.stockBalances?.[0] || null;

  return toNumber(
    row?.costPrice ??
      row?.cost ??
      row?.receivedCost ??
      row?.lastReceivedCost ??
      row?.purchaseCost ??
      branchPrice?.costPrice ??
      branchPrices?.costPrice ??
      stockBalance?.lastReceivedCost,
    0
  );
};

const normalizeProductRow = (row) => {
  const id = toPositiveInt(row?.id ?? row?.productId);
  if (!id) return null;

  const categoryName =
    row?.categoryName ??
    row?.productType?.globalProductType?.category?.name ??
    (typeof row?.category === 'string' ? row.category : row?.category?.name) ??
    '-';
  const productTypeName =
    row?.productTypeName ??
    (typeof row?.productType === 'string' ? row.productType : row?.productType?.name) ??
    '-';
  const brandName =
    row?.brandName ??
    row?.brand?.name ??
    (typeof row?.brand === 'string' ? row.brand : null) ??
    '-';

  return {
    ...row,
    id,
    productId: id,
    name: row?.name ?? row?.title ?? '-',
    category: categoryName,
    categoryName,
    productType: productTypeName,
    productTypeName,
    brandId: row?.brandId ?? row?.brand?.id ?? null,
    brandName,
    templateTrace:
      row?.templateName ??
      row?.productTemplateName ??
      row?.templateProduct?.name ??
      null,
    model: row?.model ?? row?.spec ?? '-',
    description: row?.description ?? '',
    costPrice: pickPurchaseOrderCostPrice(row),
    branchPrice: row?.branchPrice ?? row?.branchPrices ?? [],
    stockBalance: row?.stockBalance ?? null,
  };
};

export const usePurchaseOrderProductSearch = ({ currentBranchId, searchText }) => {
  const [filter, setFilter] = useState({ productTypeId: '', brandId: '' });
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const productTypeId = useMemo(
    () => toPositiveInt(filter.productTypeId),
    [filter.productTypeId]
  );
  const brandId = useMemo(() => toPositiveInt(filter.brandId), [filter.brandId]);

  useEffect(() => {
    const search = committedSearchText.trim();
    const hasFilter = productTypeId || brandId || search;

    if (!currentBranchId || !hasFilter) {
      setFetchedProducts([]);
      return;
    }

    let alive = true;
    setProductsLoading(true);

    searchPurchaseOrderProducts({ productTypeId, brandId, search })
      .then((data) => {
        if (!alive) return;
        setFetchedProducts(pickArray(data).map(normalizeProductRow).filter(Boolean));
      })
      .catch((error) => {
        if (!alive) return;
        console.error('[PO] product search failed:', error);
        setFetchedProducts([]);
      })
      .finally(() => {
        if (alive) setProductsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId, productTypeId, brandId, committedSearchText]);

  const handleFilterChange = useCallback((patch) => {
    setFilter((previous) => {
      const updated = { ...previous, ...patch };
      if (
        Object.prototype.hasOwnProperty.call(patch, 'productTypeId') &&
        patch.productTypeId !== previous.productTypeId
      ) {
        updated.brandId = '';
      }
      return updated;
    });
  }, []);

  const handleCommitSearch = useCallback(() => {
    setCommittedSearchText((searchText || '').trim());
  }, [searchText]);

  return {
    filter,
    productTypeId,
    handleFilterChange,
    handleCommitSearch,
    fetchedProducts,
    productsLoading,
  };
};
