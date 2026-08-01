import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatTaxExpenseDate, formatTaxExpenseMoney, getTaxExpenseStatusClass } from '../presentation/taxExpensePresentation';

const TaxExpenseDetailPanel = ({ expense, saving, onRecord }) => {
  if (!expense) return null;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">{expense.expenseNumber}</h2><p className="mt-1 text-sm text-slate-500">{expense.counterpartyName} · {formatTaxExpenseDate(expense.expenseDate)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getTaxExpenseStatusClass(expense.status)}`}>{expense.status}</span></div>
    <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead className="border-b text-left text-slate-500"><tr><th className="py-2">หมวด</th><th>รายละเอียด</th><th className="text-right">จำนวน</th><th className="text-right">ยอด</th></tr></thead><tbody>{expense.items?.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="py-2">{item.category?.name || '-'}</td><td>{item.description}</td><td className="text-right">{item.quantity}</td><td className="text-right">{formatTaxExpenseMoney(item.subtotalAmount)}</td></tr>)}</tbody></table></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="font-black text-slate-900">รวม {formatTaxExpenseMoney(expense.totalAmount)}</div>{expense.status === 'DRAFT' && <button type="button" onClick={onRecord} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={17} /> บันทึกรายการ</button>}</div>
  </section>;
};

export default TaxExpenseDetailPanel;
