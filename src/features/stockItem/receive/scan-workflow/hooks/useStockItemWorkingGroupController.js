import { useMemo } from 'react';
import {
  classifyStockItemWorkingGroup,
  resolveExpectedBarcode,
} from '../policies/stockItemScanWorkflowPolicy';

const defaultResolveProductIdentity = (row) =>
  row?.productId ?? row?.product?.id ?? row?.productName ?? null;

const defaultResolveSearchText = (row) => [
  row?.productName,
  row?.product?.name,
  row?.purchaseOrderReceiptItem?.productName,
  row?.purchaseOrderReceiptItem?.product?.name,
  row?.receiptItem?.productName,
  row?.receiptItem?.product?.name,
  row?.barcode,
  row?.stockItem?.product?.sku,
  row?.stockItem?.sku,
]
  .filter(Boolean)
  .join(' ')
  .toLowerCase();

export const useStockItemWorkingGroupController = ({
  rows = [],
  query = '',
  isPending = () => true,
  resolveProductIdentity = defaultResolveProductIdentity,
  resolveSearchText = defaultResolveSearchText,
} = {}) => {
  const pendingRows = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    return list.filter((row) => isPending(row));
  }, [rows, isPending]);

  const workingRows = useMemo(() => {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    if (!normalizedQuery) return pendingRows;
    return pendingRows.filter((row) =>
      String(resolveSearchText(row) || '').toLowerCase().includes(normalizedQuery)
    );
  }, [pendingRows, query, resolveSearchText]);

  const workingGroup = useMemo(
    () => classifyStockItemWorkingGroup(workingRows, resolveProductIdentity),
    [workingRows, resolveProductIdentity]
  );

  const expectedBarcode = useMemo(
    () => resolveExpectedBarcode(workingRows),
    [workingRows]
  );

  return {
    pendingRows,
    workingRows,
    workingGroup,
    expectedBarcode,
    resultCount: workingRows.length,
  };
};

export default useStockItemWorkingGroupController;
