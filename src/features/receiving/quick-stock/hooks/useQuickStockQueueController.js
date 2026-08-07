// src/features/receiving/quick-stock/hooks/useQuickStockQueueController.js

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { normalizeText } from "../utils/quickStockRuntimeUtils";

const useQuickStockQueueController = ({
  isOperationalSelection,
  isTemplateOnlySelection,
} = {}) => {
  const barcodeInputRef = useRef(null);
  const serialInputRefs = useRef({});
  const focusTimerRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [barcodeQueue, setBarcodeQueue] = useState([]);
  const [autoFocusSerial, setAutoFocusSerial] = useState(false);

  const cancelScheduledFocus = useCallback(() => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
  }, []);

  const scheduleFocus = useCallback((resolveTarget, { select = false } = {}) => {
    cancelScheduledFocus();
    focusTimerRef.current = setTimeout(() => {
      const target = typeof resolveTarget === "function" ? resolveTarget() : resolveTarget;
      focusTimerRef.current = null;
      if (!target || target.disabled) return;
      target.focus();
      if (select) target.select?.();
    }, 0);
  }, [cancelScheduledFocus]);

  const focusBarcodeInput = useCallback(() => {
    scheduleFocus(() => barcodeInputRef.current);
  }, [scheduleFocus]);

  const focusSerialInput = useCallback((rowId) => {
    scheduleFocus(() => serialInputRefs.current?.[rowId], { select: true });
  }, [scheduleFocus]);

  useEffect(() => () => cancelScheduledFocus(), [cancelScheduledFocus]);

  useEffect(() => {
    if (isOperationalSelection) {
      focusBarcodeInput();
      return;
    }
    cancelScheduledFocus();
  }, [cancelScheduledFocus, focusBarcodeInput, isOperationalSelection]);

  const resetQueue = useCallback(() => {
    setBarcodeQueue([]);
    setBarcode("");
    serialInputRefs.current = {};
    if (isOperationalSelection) focusBarcodeInput();
    else cancelScheduledFocus();
  }, [cancelScheduledFocus, focusBarcodeInput, isOperationalSelection]);

  const addBarcodeToQueue = useCallback((rawBarcode) => {
    const cleanBarcode = String(rawBarcode || "").trim();
    if (!cleanBarcode) {
      if (isOperationalSelection) focusBarcodeInput();
      return;
    }

    if (!isOperationalSelection) {
      toast.error(
        isTemplateOnlySelection
          ? "สินค้านี้ยังเป็น Template กรุณาสร้าง Operational Product ของร้านก่อนรับเข้า"
          : "กรุณาเลือกสินค้า Operational Product ก่อนสแกนบาร์โค้ด"
      );
      setBarcode("");
      cancelScheduledFocus();
      return;
    }

    if (barcodeQueue.some((item) => normalizeText(item.barcode) === normalizeText(cleanBarcode))) {
      toast.warning(`บาร์โค้ดซ้ำในรายการ: ${cleanBarcode}`);
      setBarcode("");
      focusBarcodeInput();
      return;
    }

    const rowId = `${cleanBarcode}-${Date.now()}`;
    setBarcodeQueue((prev) => [
      ...prev,
      { id: rowId, barcode: cleanBarcode, serialNumber: "", status: "Ready" },
    ]);
    setBarcode("");

    if (autoFocusSerial) focusSerialInput(rowId);
    else focusBarcodeInput();
  }, [
    autoFocusSerial,
    barcodeQueue,
    cancelScheduledFocus,
    focusBarcodeInput,
    focusSerialInput,
    isOperationalSelection,
    isTemplateOnlySelection,
  ]);

  const handleBarcodeSubmit = useCallback((event) => {
    event?.preventDefault();
    addBarcodeToQueue(barcode);
  }, [addBarcodeToQueue, barcode]);

  const handleSerialSubmit = useCallback(() => {
    if (isOperationalSelection) focusBarcodeInput();
  }, [focusBarcodeInput, isOperationalSelection]);

  const removeQueueItem = useCallback((id) => {
    setBarcodeQueue((prev) => prev.filter((item) => item.id !== id));
    if (isOperationalSelection) focusBarcodeInput();
  }, [focusBarcodeInput, isOperationalSelection]);

  const updateQueueItemField = useCallback((id, field, value) => {
    setBarcodeQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const readyCount = barcodeQueue.filter((item) => String(item.barcode || "").trim()).length;
  const needDataCount = barcodeQueue.length - readyCount;
  const queueReady = barcodeQueue.length > 0 && needDataCount === 0;

  return {
    barcodeInputRef,
    serialInputRefs,

    barcode,
    setBarcode,
    barcodeQueue,
    setBarcodeQueue,
    autoFocusSerial,
    setAutoFocusSerial,

    readyCount,
    needDataCount,
    queueReady,

    resetQueue,
    addBarcodeToQueue,
    handleBarcodeSubmit,
    handleSerialSubmit,
    removeQueueItem,
    updateQueueItemField,
  };
};

export default useQuickStockQueueController;
