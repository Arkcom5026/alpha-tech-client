import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  searchPurchaseOrderProducts,
  searchPurchaseOrderTemplateProducts,
} from '../api/purchaseOrderApi';
import { mapPurchaseOrderProductSearchResponse } from '../mappers/purchaseOrderProductSearchMapper';
import {
  applyPurchaseOrderProductFilterPatch,
  hasPurchaseOrderProductSearchCriteria,
  toPurchaseOrderPositiveInt,
} from '../policies/purchaseOrderProductSearchPolicy';

const markLocalRows = (payload) =>
  mapPurchaseOrderProductSearchResponse(payload).map((row) => ({
    ...row,
    discoverySource: 'LOCAL',
    isTemplateProduct: false,
  }));

const markTemplateRows = (payload) =>
  mapPurchaseOrderProductSearchResponse(payload).map((row) => ({
    ...row,
    discoverySource: 'TEMPLATE',
    isTemplateProduct: true,
    templateProductId: Number(row?.templateProductId || row?.id),
  }));

const mergeDiscoveryRows = (localRows, templateRows) => {
  const linkedTemplateIds = new Set(
    localRows
      .map((row) => Number(row?.templateProductId))
      .filter((id) => Number.isInteger(id) && id > 0)
  );

  return [
    ...localRows,
    ...templateRows.filter((row) => !linkedTemplateIds.has(Number(row?.templateProductId))),
  ];
};

export const usePurchaseOrderProductSearch = ({ currentBranchId, searchText, mode = 'create' }) => {
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

    const localRequest = searchPurchaseOrderProducts({ productTypeId, brandId, search });
    const templateRequest = mode === 'create'
      ? searchPurchaseOrderTemplateProducts({ productTypeId, brandId, search })
      : Promise.resolve([]);

    Promise.allSettled([localRequest, templateRequest])
      .then(([localResult, templateResult]) => {
        if (!alive) return;

        const localRows = localResult.status === 'fulfilled'
          ? markLocalRows(localResult.value)
          : [];
        const templateRows = templateResult.status === 'fulfilled'
          ? markTemplateRows(templateResult.value)
          : [];

        if (localResult.status === 'rejected') {
          console.error('[PO] local product search failed:', localResult.reason);
        }
        if (templateResult.status === 'rejected') {
          console.error('[PO] template product search failed:', templateResult.reason);
        }

        setFetchedProducts(mergeDiscoveryRows(localRows, templateRows));
      })
      .finally(() => {
        if (alive) setProductsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentBranchId, productTypeId, brandId, committedSearchText, mode]);

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
