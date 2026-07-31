import React from 'react';
import { formatTaxIntakeMoney } from '../presentation/taxIntakePresentation';

const reconciliationRows = Object.freeze([
  ['ยอดก่อน VAT', 'subtotalAmount'],
  ['VAT', 'vatAmount'],
  ['ยอดรวม', 'totalAmount'],
]);

const TaxIntakeReconciliationCard = ({ reconciliation }) => {
  if (!reconciliation) return null;

  return (
    <div className={`rounded-2xl border p-4 ${reconciliation.canApprove ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={`font-black ${reconciliation.canApprove ? 'text-emerald-800' : 'text-amber-900'}`}>
            {reconciliation.canApprove ? 'ยอดตรงกัน พร้อมอนุมัติ' : 'ยอดยังไม่ตรงกัน'}
          </p>
          <p className="text-xs text-slate-600">ผูกใบรับสินค้าแล้ว {reconciliation.receiptCount || 0} ใบ</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${reconciliation.canApprove ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-900'}`}>
          {reconciliation.status}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="pb-2">รายการ</th>
              <th className="pb-2 text-right">เอกสารภาษี</th>
              <th className="pb-2 text-right">ยอดที่ผูก</th>
              <th className="pb-2 text-right">ผลต่าง</th>
            </tr>
          </thead>
          <tbody>
            {reconciliationRows.map(([label, key]) => (
              <tr key={key} className="border-t border-black/5">
                <td className="py-2 font-bold text-slate-700">{label}</td>
                <td className="py-2 text-right">{formatTaxIntakeMoney(reconciliation.documentAmount?.[key])}</td>
                <td className="py-2 text-right">{formatTaxIntakeMoney(reconciliation.allocatedAmount?.[key])}</td>
                <td className={`py-2 text-right font-black ${Math.abs(Number(reconciliation.variance?.[key] || 0)) > Number(reconciliation.tolerance || 0.01) ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatTaxIntakeMoney(reconciliation.variance?.[key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxIntakeReconciliationCard;
