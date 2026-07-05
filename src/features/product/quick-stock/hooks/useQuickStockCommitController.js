// src/features/product/quick-stock/hooks/useQuickStockCommitController.js

import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { ONBOARDING_STATES, toMoneyNumber } from "../utils/quickStockRuntimeUtils";

const useQuickStockCommitController = ({
  operationalProduct,
  selectedProduct,
  isTemplateOnlySelection,
  isOperationalSelection,
  isCheckingOperationalProduct,
  isCreatingOperationalProduct,
  defaultCost,
  priceForm,
  barcodeQueue,
  queueReady,
  resetQueue,
  quickStockIntakeExistingAction,
} = {}) => {
  const [note, setNote] = useState("Manual stock intake");
  const [isCommitting, setIsCommitting] = useState(false);

  const hasRequiredIntakePrices =
    toMoneyNumber(defaultCost || priceForm.costPrice) > 0 &&
    toMoneyNumber(priceForm.priceRetail) > 0;

  const productReady = isOperationalSelection && hasRequiredIntakePrices;
  const isBusy = isCommitting || isCheckingOperationalProduct || isCreatingOperationalProduct;
  const canScanBarcode = isOperationalSelection && !isBusy;
  const canCommitExistingIntake = productReady && queueReady && !isBusy;

  const validateBeforeCommit = useCallback(() => {
    if (!operationalProduct?.id) {
      toast.error(
        isTemplateOnlySelection
          ? "สินค้านี้ยังเป็น Template และยังไม่ใช่ Operational Product ของร้าน"
          : "กรุณาเลือกสินค้า Operational Product ก่อนบันทึก"
      );
      return false;
    }

    if (toMoneyNumber(defaultCost || priceForm.costPrice) <= 0) {
      toast.error("ราคาทุนรับเข้าต้องมากกว่า 0 ก่อนรับเข้า");
      return false;
    }

    if (toMoneyNumber(priceForm.priceRetail) <= 0) {
      toast.error("ราคาขายปลีกต้องมากกว่า 0 ก่อนรับเข้า");
      return false;
    }

    if (barcodeQueue.length === 0) {
      toast.error("ยังไม่มีบาร์โค้ดใน Queue");
      return false;
    }

    for (const [index, item] of barcodeQueue.entries()) {
      if (!String(item.barcode || "").trim()) {
        toast.error(`แถว ${index + 1}: Barcode ห้ามว่าง`);
        return false;
      }
    }

    return true;
  }, [operationalProduct, isTemplateOnlySelection, defaultCost, priceForm, barcodeQueue]);

  const handleCommit = useCallback(async () => {
    if (!validateBeforeCommit()) return;

    const cleanQueueItems = barcodeQueue.map((item) => ({
      barcode: String(item.barcode || "").trim(),
      serialNumber: String(item.serialNumber || "").trim() || null,
    }));

    const payload = {
      productId: Number(operationalProduct.id),
      productName: operationalProduct.name,
      mode: operationalProduct.mode || "STRUCTURED",
      trackSerialNumber: !!operationalProduct.trackSerialNumber,
      note,
      quantity: cleanQueueItems.length,
      costPrice: toMoneyNumber(defaultCost || priceForm.costPrice),
      priceRetail: toMoneyNumber(priceForm.priceRetail),
      priceWholesale: toMoneyNumber(priceForm.priceWholesale),
      priceTechnician: toMoneyNumber(priceForm.priceTechnician),
      priceOnline: toMoneyNumber(priceForm.priceOnline),
      items: cleanQueueItems,
      barcodes: cleanQueueItems,
    };

    setIsCommitting(true);

    try {
      await quickStockIntakeExistingAction(payload);
      toast.success(`บันทึกรับเข้า ${barcodeQueue.length} รายการเรียบร้อย`);
      resetQueue();
    } catch (err) {
      console.error("Quick Stock Commit Error:", err);
      toast.error(err?.message || "บันทึกรับเข้าไม่สำเร็จ");
    } finally {
      setIsCommitting(false);
    }
  }, [
    validateBeforeCommit,
    barcodeQueue,
    operationalProduct,
    note,
    defaultCost,
    priceForm,
    quickStockIntakeExistingAction,
    resetQueue,
  ]);

  const onboardingState = isCommitting
    ? ONBOARDING_STATES.INTAKE_COMMITTING
    : isCheckingOperationalProduct || isCreatingOperationalProduct
      ? ONBOARDING_STATES.CHECKING_OPERATIONAL_PRODUCT
      : !operationalProduct && !selectedProduct
        ? ONBOARDING_STATES.NO_SELECTION
        : isTemplateOnlySelection
          ? ONBOARDING_STATES.TEMPLATE_SELECTED_NOT_CREATED
          : canCommitExistingIntake
            ? ONBOARDING_STATES.INTAKE_READY
            : isOperationalSelection
              ? ONBOARDING_STATES.OPERATIONAL_READY
              : ONBOARDING_STATES.ERROR_RECOVERABLE;

  const intakeRuntimeProduct = canScanBarcode ? operationalProduct : null;
  const commitRuntimeProduct = canCommitExistingIntake ? operationalProduct : null;

  return {
    note,
    setNote,
    isCommitting,
    setIsCommitting,

    hasRequiredIntakePrices,
    productReady,
    isBusy,
    canScanBarcode,
    canCommitExistingIntake,
    onboardingState,
    intakeRuntimeProduct,
    commitRuntimeProduct,

    validateBeforeCommit,
    handleCommit,
  };
};

export default useQuickStockCommitController;
