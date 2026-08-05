import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import StockIntakeWorkspaceHeader from '../components/intake/StockIntakeWorkspaceHeader';
import StockIntakeSummary from '../components/intake/StockIntakeSummary';
import StockIntakeToolbar from '../components/intake/StockIntakeToolbar';
import StockIntakeResults from '../components/intake/StockIntakeResults';

const ListReceiptItemsToScanPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { receipts, loadReceiptsReadyToScanAction, loading, error, clearErrorAction } = useBarcodeStore();
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(() => {
    clearErrorAction?.();
    loadReceiptsReadyToScanAction();
  }, [loadReceiptsReadyToScanAction, clearErrorAction]);

  useEffect(() => {
    load();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') load();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [load]);

  const rowsAll = useMemo(() => {
    const rows = Array.isArray(receipts) ? [...receipts] : [];
    return rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [receipts]);

  const rows = useMemo(() => {
    if (filter === 'SN') return rowsAll.filter((receipt) => Number(receipt?.pendingSN || 0) > 0);
    if (filter === 'LOT') return rowsAll.filter((receipt) => Number(receipt?.pendingLOT || 0) > 0);
    return rowsAll;
  }, [rowsAll, filter]);

  const sumSN = useMemo(
    () => rowsAll.reduce((sum, receipt) => sum + Number(receipt?.pendingSN || 0), 0),
    [rowsAll]
  );
  const sumLOT = useMemo(
    () => rowsAll.reduce((sum, receipt) => sum + Number(receipt?.pendingLOT || 0), 0),
    [rowsAll]
  );

  const goScan = useCallback((receipt) => {
    if (!receipt?.id) return;
    const targetSlug = shopSlug || 'advancetech';
    navigate(
      `/${targetSlug}/pos/purchases/receipt/items/scan/${receipt.id}?code=${encodeURIComponent(
        receipt.purchaseOrderCode || ''
      )}`
    );
  }, [navigate, shopSlug]);

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-5 p-4 text-slate-800 md:space-y-6 md:p-6">
      <StockIntakeWorkspaceHeader loading={loading} onRefresh={load} />

      <StockIntakeSummary
        receiptCount={rowsAll.length}
        pendingSN={sumSN}
        pendingLOT={sumLOT}
      />

      <StockIntakeToolbar
        filter={filter}
        onFilterChange={setFilter}
        resultCount={rows.length}
      />

      <StockIntakeResults
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        onScan={goScan}
      />
    </main>
  );
};

export default ListReceiptItemsToScanPage;
