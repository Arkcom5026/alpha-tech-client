import React from "react";

const QueueSummary = ({
  total = 0,
  readyCount = 0,
  needCostCount = 0,
  productReady = false,
}) => {
  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <div className="bg-white border rounded-2xl p-4">
        <div className="text-xs text-gray-500">รวมรายการ</div>
        <div className="text-2xl font-bold text-gray-900">{total}</div>
      </div>
      <div className="bg-white border rounded-2xl p-4">
        <div className="text-xs text-gray-500">Ready</div>
        <div className="text-2xl font-bold text-green-700">{readyCount}</div>
      </div>
      <div className="bg-white border rounded-2xl p-4">
        <div className="text-xs text-gray-500">Need Cost</div>
        <div className="text-2xl font-bold text-red-600">{needCostCount}</div>
      </div>
      <div className="bg-white border rounded-2xl p-4">
        <div className="text-xs text-gray-500">ราคาขายปลีก</div>
        <div className={`text-lg font-bold ${productReady ? "text-green-700" : "text-red-600"}`}>
          {productReady ? "พร้อมขาย" : "ยังไม่ครบ"}
        </div>
      </div>
    </section>
  );
};

export default QueueSummary;
