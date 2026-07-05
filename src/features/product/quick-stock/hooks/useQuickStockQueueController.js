// src/features/product/quick-stock/hooks/useQuickStockQueueController.js

import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";

import { normalizeText } from "../utils/quickStockRuntimeUtils";

const useQuickStockQueueController = ({
  isOperationalSelection,
  isTemplateOnlySelection,
} = {}) => {
  const barcodeInputRef = useRef(null);
  const serialInputRefs = useRef({});

  const [barcode, setBarcode] = useState("");
  const [barcodeQueue, setBarcodeQueue] = useState([]);
  const [autoFocusSerial, setAutoFocusSerial] = useState(false);

  const resetQueue = useCallback(() => {
    setBarcodeQueue([]);
    setBarcode("");
    serialInputRefs.current = {};
    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  }, []);

  const addBarcodeToQueue = useCallback((rawBarcode) => {
    const cleanBarcode = String(rawBarcode || "").trim();
    if (!cleanBarcode) return;

    if (!isOperationalSelection) {
      toast.error(
        isTemplateOnlySelection
          ? "สินค้านี้ยังเป็น Template กรุณาสร้าง Operational Product ของร้านก่อนรับเข้า"
          : "กรุณาเลือกสินค้า Operational Product ก่อนสแกนบาร์โค้ด"
      );
      setBarcode("");
      barcodeInputRef.current?.focus();
      return;
    }

    if (barcodeQueue.some((item) => normalizeText(item.barcode) === normalizeText(cleanBarcode))) {
      toast.warning(`บาร์โค้ดซ้ำในรายการ: ${cleanBarcode}`);
      setBarcode("");
      barcodeInputRef.current?.focus();
      return;
    }

    const rowId = `${cleanBarcode}-${Date.now()}`;
    setBarcodeQueue((prev) => [
      ...prev,
      { id: rowId, barcode: cleanBarcode, serialNumber: "", status: "Ready" },
    ]);
    setBarcode("");

    setTimeout(() => {
      if (autoFocusSerial && serialInputRefs.current?.[rowId]) {
        serialInputRefs.current[rowId].focus();
        serialInputRefs.current[rowId].select?.();
        return;
      }
      barcodeInputRef.current?.focus();
    }, 50);
  }, [autoFocusSerial, barcodeQueue, isOperationalSelection, isTemplateOnlySelection]);

  const handleBarcodeSubmit = useCallback((event) => {
    event?.preventDefault();
    addBarcodeToQueue(barcode);
  }, [addBarcodeToQueue, barcode]);

  const removeQueueItem = useCallback((id) => {
    setBarcodeQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

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
    removeQueueItem,
    updateQueueItemField,
  };
};

export default useQuickStockQueueController;
