import { useCallback, useEffect, useMemo, useState } from 'react';

import { searchPurchaseOrderProducts } from '../api/purchaseOrderApi';
import { mapPurchaseOrderProductSearchResponse } from '../mappers/purchaseOrderProductSearchMapper';
import {
  applyPurchaseOrderProductFilterPatch,
  hasPurchaseOrderProductSearchCriteria,
  toPurchaseOrderPositiveInt,
} from '../policies/purchaseOrderProductSearchPolicy';

export const usePurchaseOrderProductSearch = ({ currentBranchId, searchText }) => {
  const [filter, setFilter] = useState({ productTypeId: '', brandId: '' });
  const [committedSearchText, setCommittedSearchText] = useState('');
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const productTypeId = useMemo(
    () => toPurchaseOrderPositiveInt(filter.productTypeId),
    [filter.productTypeId]
  );
  const brandId = useMemo(
    () => toPurchaseOrderPositiveInt(filter.brandId),
    [filter.brandId]
  );

  useEffect(() => {
    const search = committedSearchText.trim();
    const hasCriteria = hasPurchaseOrderProductSearchCriteria({
      productTypeId,
      brandId,
      search,
    });

    if (!currentBranchId || !hasCriteria) {
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
    setFilter((previous) => applyPurchaseOrderProductFilterPatch(previous, patch));
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
