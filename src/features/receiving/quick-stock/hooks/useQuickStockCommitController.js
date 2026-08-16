// src/features/receiving/quick-stock/hooks/useQuickStockCommitController.js

import { useCallback, useRef, useState } from "react";
import { feedback as toast } from '@/design-system';

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
  const commitRef = useRef(false);

  const resolvedCostPrice = defaultCost ?? priceForm.costPrice;
  const hasRequiredIntakePrices =
    resolvedCostPrice != null &&
    toMoneyNumber(resolvedCostPrice) >= 0 &&
    toMoneyNumber(priceForm.priceRetail) > 0;

  const productReady = isOperationalSelection && hasRequiredIntakePrices;
  const mutationBusy = isCommitting || commitRef.current;
  const isBusy = mutationBusy || isCheckingOperationalProduct || isCreatingOperationalProduct;
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

    if (resolvedCostPrice == null) {
      toast.error("กรุณาระบุราคาทุนรับเข้าก่อนรับเข้า");
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
  }, [operationalProduct, isTemplateOnlySelection, resolvedCostPrice, priceForm, barcodeQueue]);

  const handleCommit = useCallback(async () => {
    if (commitRef.current) return;
    if (!validateBeforeCommit()) return;

    const productIdSnapshot = Number(operationalProduct.id);
    const productSnapshot = {
      id: productIdSnapshot,
      name: operationalProduct.name,
      mode: operationalProduct.mode || "STRUCTURED",
      trackSerialNumber: !!operationalProduct.trackSerialNumber,
    };
    const noteSnapshot = note;
    const queueItemsSnapshot = barcodeQueue.map((item) => ({
      barcode: String(item.barcode || "").trim(),
      serialNumber: String(item.serialNumber || "").trim() || null,
    }));
    const queueCountSnapshot = queueItemsSnapshot.length;
    const priceSnapshot = {
      costPrice: toMoneyNumber(resolvedCostPrice),
      priceRetail: toMoneyNumber(priceForm.priceRetail),
      priceWholesale: toMoneyNumber(priceForm.priceWholesale),
      priceTechnician: toMoneyNumber(priceForm.priceTechnician),
      priceOnline: toMoneyNumber(priceForm.priceOnline),
    };

    const payload = {
      productId: productIdSnapshot,
      productName: productSnapshot.name,
      mode: productSnapshot.mode,
      trackSerialNumber: productSnapshot.trackSerialNumber,
      note: noteSnapshot,
      quantity: queueCountSnapshot,
      ...priceSnapshot,
      items: queueItemsSnapshot,
      barcodes: queueItemsSnapshot,
    };

    commitRef.current = true;
    setIsCommitting(true);

    try {
      await quickStockIntakeExistingAction(payload);
      toast.actionSuccess(
        `บันทึกรับเข้า ${queueCountSnapshot} รายการเรียบร้อย`,
        `quick-stock:intake:${productIdSnapshot}:success`,
      );
      resetQueue();
    } catch (err) {
      console.error("Quick Stock Commit Error:", err);
      toast.actionError(
        err,
        err?.message || "บันทึกรับเข้าไม่สำเร็จ",
        `quick-stock:intake:${productIdSnapshot}:error`,
      );
    } finally {
      commitRef.current = false;
      setIsCommitting(false);
    }
  }, [
    validateBeforeCommit,
    barcodeQueue,
    operationalProduct,
    note,
    resolvedCostPrice,
    priceForm,
    quickStockIntakeExistingAction,
    resetQueue,
  ]);

  const onboardingState = mutationBusy
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
