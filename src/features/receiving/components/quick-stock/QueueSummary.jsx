import React from "react";
import QueueSummaryMetric from "./QueueSummaryMetric";

const QueueSummary = ({
  total = 0,
  readyCount = 0,
  needDataCount = 0,
  productReady = false,
}) => {
  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <QueueSummaryMetric label="รวมรายการ" value={total} />
      <QueueSummaryMetric label="Ready" value={readyCount} valueClassName="text-green-700" />
      <QueueSummaryMetric label="Need Barcode" value={needDataCount} valueClassName="text-red-600" />
      <QueueSummaryMetric
        label="ราคาทุน + ราคาปลีก"
        value={productReady ? "พร้อมรับเข้า" : "ยังไม่ครบ"}
        valueClassName={productReady ? "text-green-700" : "text-red-600"}
        valueSize="text-lg"
      />
    </section>
  );
};

export default QueueSummary;
