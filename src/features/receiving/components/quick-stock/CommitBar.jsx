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

  const productDetailHref = selectedProduct?.id ? `/pos/stock/products/view/${selectedProduct.id}` : null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-800">สรุปก่อนบันทึก</div>
          <div className="text-xs text-gray-500">
            {barcodeQueue.length} รายการใน Queue · ราคาทุน/ราคาปลีก {productReady ? "พร้อม" : "ยังไม่ครบ"} · Queue {queueReady ? "พร้อม" : "ยังไม่ครบ"}
          </div>
          {selectedProduct?.id && (
            <div className="text-xs text-slate-600 mt-1">
              Product #{selectedProduct.id} · {selectedProduct.name || "ไม่ระบุชื่อสินค้า"}
            </div>
          )}
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
      </div>

      {selectedProduct?.id && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600">ทางเลือกหลังจบรอบนี้</div>
          <div className="flex flex-wrap gap-2">
            {productDetailHref && (
              <a className="text-xs rounded-lg border bg-white px-3 py-1.5 hover:bg-slate-100" href={productDetailHref}>
                เปิดรายละเอียดสินค้า
              </a>
            )}
            <a className="text-xs rounded-lg border bg-white px-3 py-1.5 hover:bg-slate-100" href="/pos/stock/products">
              ไป Product List
            </a>
            <button type="button" className="text-xs rounded-lg border bg-white px-3 py-1.5 hover:bg-slate-100" onClick={onResetQueue}>
              เริ่มรอบถัดไป
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CommitBar;
