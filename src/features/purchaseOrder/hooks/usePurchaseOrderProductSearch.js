import { useCallback, useEffect, useMemo, useState } from 'react';

import { searchPurchaseOrderProducts } from '../api/purchaseOrderApi';
import { mapPurchaseOrderProductSearchResponse } from '../mappers/purchaseOrderProductSearchMapper';

const toPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
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
        setFetchedProducts(mapPurchaseOrderProductSearchResponse(data));
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
