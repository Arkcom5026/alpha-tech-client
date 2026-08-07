import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  READY_TO_SELL_SORT_MODE,
  matchReadyToSellScan,
  sortReadyToSellRows,
} from '../policies/readyToSellScannerPolicy';

const useReadyToSellScannerController = ({
  rows = [],
  branchId,
  productId,
} = {}) => {
  const [scanMode, setScanMode] = useState(true);
  const [scanText, setScanText] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [highlightId, setHighlightId] = useState(null);
  const [sortMode, setSortMode] = useState(READY_TO_SELL_SORT_MODE.NEWEST);
  const scanInputRef = useRef(null);

  const displayRows = useMemo(
    () => sortReadyToSellRows(rows, sortMode),
    [rows, sortMode],
  );

  const focusScanInput = useCallback(() => {
    if (!scanMode || !branchId || !productId) return;
    const node = scanInputRef.current;
    if (!node || node.disabled) return;
    try {
      node.focus();
    } catch (_) {
      // fail-soft: scanner focus must never block the read-only workspace
    }
  }, [scanMode, branchId, productId]);

  useEffect(() => {
    focusScanInput();
  }, [focusScanInput]);

  const scrollToRow = useCallback((id) => {
    if (id == null) return;
    try {
      const el = document.getElementById(`sn-row-${id}`);
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (_) {
      // fail-soft: row scrolling is a UX enhancement only
    }
  }, []);

  const submitScan = useCallback((raw) => {
    const outcome = matchReadyToSellScan(displayRows, raw);
    setHighlightId(outcome.highlightId ?? null);
    setScanMessage(outcome.message || '');

    if (outcome.matched) scrollToRow(outcome.highlightId);
    return outcome;
  }, [displayRows, scrollToRow]);

  const handleScanEnter = useCallback(() => {
    const value = String(scanText || '').trim();
    if (!value) return null;
    const outcome = submitScan(value);
    setScanText('');
    return outcome;
  }, [scanText, submitScan]);

  const toggleScanMode = useCallback(() => {
    setScanMode((value) => !value);
    setScanMessage('');
    setHighlightId(null);
  }, []);

  const toggleSortMode = useCallback(() => {
    setSortMode((mode) => (
      mode === READY_TO_SELL_SORT_MODE.FIFO
        ? READY_TO_SELL_SORT_MODE.NEWEST
        : READY_TO_SELL_SORT_MODE.FIFO
    ));
  }, []);

  return {
    scanMode,
    scanText,
    scanMessage,
    highlightId,
    sortMode,
    scanInputRef,
    displayRows,
    setScanText,
    setScanMessage,
    submitScan,
    handleScanEnter,
    toggleScanMode,
    toggleSortMode,
    focusScanInput,
  };
};

export default useReadyToSellScannerController;
