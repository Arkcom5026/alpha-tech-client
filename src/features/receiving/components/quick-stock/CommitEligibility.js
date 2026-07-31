export const getCommitEligibility = ({
  selectedProduct,
  queueLength = 0,
  productReady = false,
  queueReady = false,
  isCommitting = false,
}) => {
  const canCommit =
    !!selectedProduct &&
    queueLength > 0 &&
    productReady &&
    queueReady &&
    !isCommitting;

  if (canCommit || isCommitting) {
    return { canCommit, disabledReason: "" };
  }

  if (!productReady) {
    return {
      canCommit,
      disabledReason: "ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านและกรอกราคาทุน/ราคาปลีกให้ครบก่อน",
    };
  }

  if (queueLength === 0) {
    return {
      canCommit,
      disabledReason: "ยังรับสินค้าไม่ได้: ยังไม่มีรายการใน Queue",
    };
  }

  if (!queueReady) {
    return {
      canCommit,
      disabledReason: "ยังรับสินค้าไม่ได้: Queue ยังไม่ครบ",
    };
  }

  if (!selectedProduct) {
    return {
      canCommit,
      disabledReason: "ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านก่อน",
    };
  }

  return {
    canCommit,
    disabledReason: "ยังรับสินค้าไม่ได้: กรุณาตรวจสอบข้อมูลก่อน Commit",
  };
};
