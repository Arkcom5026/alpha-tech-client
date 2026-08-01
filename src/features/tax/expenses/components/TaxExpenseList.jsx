import React from 'react';
import { formatTaxExpenseDate, formatTaxExpenseMoney, getTaxExpenseStatusClass } from '../presentation/taxExpensePresentation';

const TaxExpenseList = ({ expenses, filters, loading, onFilterChange, onOpenExpense }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
      <div><h2 className="font-black text-slate-900">รายการค่าใช้จ่าย</h2><p className="text-xs text-slate-500">แสดงเฉพาะร้านที่กำลังเลือก</p></div>
      <div className="flex gap-2">
        <select value={filters.status} onChange={(e) => onFilterChange({ ...filters, status: e.target.value })} className="rounded-lg border border-slate-300 px-2 py-2 text-sm">
          <option value="">ทุกสถานะ</option><option value="DRAFT">DRAFT</option><option value="RECORDED">RECORDED</option>
        </select>
        <input value={filters.documentNumber} onChange={(e) => onFilterChange({ ...filters, documentNumber: e.target.value })} placeholder="ค้นหาเลขที่เอกสาร" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
      </div>
    </div>
    <div className="divide-y divide-slate-100">
      {expenses.map((expense) => <button key={expense.id} type="button" onClick={() => onOpenExpense(expense)} className="block w-full p-4 text-left hover:bg-slate-50">
        <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{expense.expenseNumber}</p><p className="mt-1 text-xs text-slate-500">{expense.counterpartyName} · {expense.documentNumber || 'ไม่มีเลขที่เอกสาร'} · {formatTaxExpenseDate(expense.expenseDate)}</p></div><div className="text-right"><p className="font-bold text-slate-900">{formatTaxExpenseMoney(expense.totalAmount)}</p><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-bold ${getTaxExpenseStatusClass(expense.status)}`}>{expense.status}</span></div></div>
      </button>)}
      {!loading && expenses.length === 0 && <div className="p-8 text-center text-sm text-slate-500">ยังไม่มีรายการค่าใช้จ่าย</div>}
    </div>
  </section>
);

export default TaxExpenseList;
