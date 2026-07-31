import React from "react";

const CommitSummary = ({
  selectedProduct,
  queueLength = 0,
  productReady = false,
  queueReady = false,
  disabledReason = "",
}) => (
  <div>
    <div className="font-semibold text-gray-800">สรุปก่อนบันทึก</div>
    <div className="text-xs text-gray-500">
      {queueLength} รายการใน Queue · ราคาทุน/ราคาปลีก {productReady ? "พร้อม" : "ยังไม่ครบ"} · Queue {queueReady ? "พร้อม" : "ยังไม่ครบ"}
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
);

export default CommitSummary;
