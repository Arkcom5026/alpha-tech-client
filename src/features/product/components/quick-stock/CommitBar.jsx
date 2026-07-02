import React from "react";

const CommitBar = ({
  selectedProduct,
  barcodeQueue = [],
  productReady,
  queueReady,
  isCommitting,
  onResetQueue,
  onCommit,
}) => {
  const canCommit =
    !!selectedProduct &&
    barcodeQueue.length > 0 &&
    productReady &&
    queueReady &&
    !isCommitting;

  const disabledReason = (() => {
    if (canCommit || isCommitting) return "";
    if (!productReady) {
      return "ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านและกรอกราคาทุน/ราคาปลีกให้ครบก่อน";
    }
    if (barcodeQueue.length === 0) {
      return "ยังรับสินค้าไม่ได้: ยังไม่มีรายการใน Queue";
    }
    if (!queueReady) {
      return "ยังรับสินค้าไม่ได้: Queue ยังไม่ครบ";
    }
    if (!selectedProduct) {
      return "ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านก่อน";
    }
    return "ยังรับสินค้าไม่ได้: กรุณาตรวจสอบข้อมูลก่อน Commit";
  })();

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      <div>
        <div className="font-semibold text-gray-800">สรุปก่อนบันทึก</div>
        <div className="text-xs text-gray-500">
          {barcodeQueue.length} รายการใน Queue · ราคาทุน/ราคาปลีก {productReady ? "พร้อม" : "ยังไม่ครบ"} · Queue {queueReady ? "พร้อม" : "ยังไม่ครบ"}
        </div>
        {disabledReason && (
          <div className="text-xs text-amber-700 mt-1">
            {disabledReason}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          disabled={barcodeQueue.length === 0 || isCommitting}
          onClick={onResetQueue}
        >
          ล้างรายการ
        </button>
        <button
          type="button"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={!canCommit}
          onClick={onCommit}
        >
          {isCommitting ? "กำลังบันทึก..." : `Commit ${barcodeQueue.length} รายการ`}
        </button>
      </div>
    </section>
  );
};

export default CommitBar;