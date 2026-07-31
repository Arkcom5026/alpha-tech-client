import React from "react";

const QueueSummaryMetric = ({ label, value, valueClassName = "text-gray-900", valueSize = "text-2xl" }) => (
  <div className="bg-white border rounded-2xl p-4">
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`${valueSize} font-bold ${valueClassName}`}>{value}</div>
  </div>
);

export default QueueSummaryMetric;
