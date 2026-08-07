// ✅ src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx
// Show all IN_STOCK StockItems (STRUCTURED) for a product in the selected branch

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import useProductStore from '../store/productStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import useReadyToSellScannerController from '../ready-to-sell/scan-workflow/hooks/useReadyToSellScannerController';
import ReadyToSellWorkspaceHeader from '../ready-to-sell/workspace/components/ReadyToSellWorkspaceHeader';
import ReadyToSellProductSummary from '../ready-to-sell/workspace/components/ReadyToSellProductSummary';
import ReadyToSellScanControls from '../ready-to-sell/workspace/components/ReadyToSellScanControls';
import ReadyToSellStatusMessages from '../ready-to-sell/workspace/components/ReadyToSellStatusMessages';
import ReadyToSellResultsTable from '../ready-to-sell/workspace/components/ReadyToSellResultsTable';

const ReadyToSellStructuredDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();

  const branchId = useBranchStore((s) => s.selectedBranchId);

  const pid = useMemo(() => {
    const n = Number(productId);
    return Number.isFinite(n) ? n : null;
  }, [productId]);

  const [searchText, setSearchText] = useState('');
  const [committed, setCommitted] = useState('');

  const loading = useProductStore((s) => s.readyToSellStructuredDetailsLoading);
  const loadError = useProductStore((s) => s.readyToSellStructuredDetailsError);
  const data = useProductStore((s) => s.readyToSellStructuredDetails);

  const fetchAction = useProductStore((s) => s.fetchReadyToSellStructuredDetailsAction);
  const resetAction = useProductStore((s) => s.resetReadyToSellStructuredDetailsAction);

  const loadingRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setCommitted(searchText.trim()), 250);
    return () => clearTimeout(t);
  }, [searchText]);

  const safeFetch = useCallback(
    async (q) => {
      const fn = typeof fetchAction === 'function' ? fetchAction : null;
      if (!fn) throw new Error('READY_TO_SELL_DETAILS_ACTION_NOT_FOUND');
      return await fn({ branchId, productId: pid, q });
    },
    [fetchAction, branchId, pid]
  );

  const load = useCallback(async () => {
    if (!branchId || !pid) return;
    if (loadingRef.current || loading) return;
    loadingRef.current = true;
    try {
      await safeFetch(committed || '');
    } finally {
      loadingRef.current = false;
    }
  }, [branchId, pid, loading, committed, safeFetch]);

  useEffect(() => {
    return () => {
      if (typeof resetAction === 'function') resetAction();
    };
  }, [resetAction]);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);

  const {
    scanMode,
    scanText,
    scanMessage,
    highlightId,
    sortMode,
    scanInputRef,
    displayRows: displayItems,
    setScanText,
    setScanMessage,
    handleScanEnter,
    toggleScanMode,
    toggleSortMode,
  } = useReadyToSellScannerController({
    rows: items,
    branchId,
    productId: pid,
  });

  const total = useMemo(() => Number(data?.total ?? items.length) || items.length, [data, items]);

  const latestReceivedAt = useMemo(() => {
    const first = displayItems?.[0];
    const v = first?.receivedAt ?? null;
    return v ? new Date(v).toLocaleString('th-TH') : '-';
  }, [displayItems]);

  const oldestReceivedAt = useMemo(() => {
    const last = displayItems?.[displayItems.length - 1];
    const v = last?.receivedAt ?? null;
    return v ? new Date(v).toLocaleString('th-TH') : '-';
  }, [displayItems]);

  const headerName = useMemo(() => {
    const first = items?.[0];
    return first?.productName ?? first?.product?.name ?? '-';
  }, [items]);

  const headerMeta = useMemo(() => {
    const first = items?.[0] || {};

    const brandName = first?.brandName ?? first?.brand?.name ?? first?.product?.brand?.name ?? '-';
    const categoryName =
      first?.categoryName ??
      first?.product?.categoryName ??
      first?.productType?.globalProductType?.category?.name ??
      first?.product?.productType?.globalProductType?.category?.name ??
      '-';
    const productTypeName =
      first?.productTypeName ??
      first?.product?.productTypeName ??
      first?.productType?.name ??
      first?.product?.productType?.name ??
      '-';

    const sku = first?.sku ?? first?.productSku ?? first?.code ?? first?.product?.sku ?? first?.product?.productConfig?.sku ?? '-';
    const model = first?.model ?? first?.productModel ?? first?.product?.model ?? first?.product?.productConfig?.model ?? '-';

    const sellPriceRaw = first?.sellPrice ?? first?.salePrice ?? first?.price ?? first?.product?.sellPrice ?? first?.product?.branchPrice?.[0]?.priceRetail ?? null;
    const sellPriceNum = sellPriceRaw == null || sellPriceRaw === '' ? null : Number(sellPriceRaw);
    const sellPrice = Number.isFinite(sellPriceNum) ? sellPriceNum : null;

    return {
      sku,
      model,
      brandName,
      categoryName,
      productTypeName,
      sellPrice,
    };
  }, [items]);

  const errorMessage = useMemo(() => {
    if (!loadError) return null;
    return loadError?.message || loadError?.raw?.message || 'โหลดข้อมูลไม่สำเร็จ';
  }, [loadError]);

  const canOperate = Boolean(branchId && pid);

  const copyCode = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(String(code));
      setScanMessage(`คัดลอก ${code} แล้ว`);
    } catch (_) {
      setScanMessage('ไม่สามารถคัดลอกได้');
    }
  }, [setScanMessage]);

  return (
    <div className="w-full px-4 py-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <ReadyToSellWorkspaceHeader
          productName={headerName}
          productId={pid}
          pathname={location.pathname}
          loading={loading}
          canOperate={canOperate}
          onBack={() => navigate(-1)}
          onRefresh={load}
        />

        <ReadyToSellProductSummary
          productName={headerName}
          meta={headerMeta}
          total={total}
          oldestReceivedAt={oldestReceivedAt}
          latestReceivedAt={latestReceivedAt}
        />

        <ReadyToSellScanControls
          searchText={searchText}
          setSearchText={setSearchText}
          scanMode={scanMode}
          scanText={scanText}
          setScanText={setScanText}
          scanInputRef={scanInputRef}
          sortMode={sortMode}
          total={total}
          canOperate={canOperate}
          onScanEnter={handleScanEnter}
          onToggleScanMode={toggleScanMode}
          onToggleSortMode={toggleSortMode}
        />

        <ReadyToSellStatusMessages
          branchId={branchId}
          productId={pid}
          loading={loading}
          errorMessage={errorMessage}
          scanMessage={scanMessage}
        />

        <ReadyToSellResultsTable
          rows={displayItems}
          loading={loading}
          highlightId={highlightId}
          onCopyCode={copyCode}
        />
      </div>
    </div>
  );
};

export default ReadyToSellStructuredDetailsPage;
