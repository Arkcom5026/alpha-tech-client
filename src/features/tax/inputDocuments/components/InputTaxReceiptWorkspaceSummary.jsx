import React from 'react';
import { formatTaxMoney } from '../utils/inputTaxReceiptLink';

const SummaryMetric = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const InputTaxReceiptWorkspaceSummary = ({
  receiptCount = 0,
  selectedReceiptCount = 0,
  linkedReceiptCount = 0,
  selectedTotalAmount = 0,
}) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <SummaryMetric label="ใบรับสินค้าที่ค้นพบ" value={receiptCount} />
    <SummaryMetric label="ใบรับสินค้าที่เลือก" value={selectedReceiptCount} />
    <SummaryMetric label="รายการผูกที่ใช้งาน" value={linkedReceiptCount} />
    <SummaryMetric label="ยอดที่เลือก" value={formatTaxMoney(selectedTotalAmount)} />
  </div>
);

export default InputTaxReceiptWorkspaceSummary;
