import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ExpensePayeeMasterDataPanel from '../components/ExpensePayeeMasterDataPanel';
import TaxExpenseCreateForm from '../components/TaxExpenseCreateForm';
import useTaxExpenseWorkspace from '../hooks/useTaxExpenseWorkspace';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TaxExpenseWorkspacePage = () => {
  const {
    branchId,
    currentBranch,
    expenses,
    categories,
    payees,
    loading,
    saving,
    savingPayee,
    error,
    load,
    searchPayees,
    submitPayee,
    submitExpense,
  } = useTaxExpenseWorkspace();

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex gap-3"><AlertTriangle />กรุณาเลือกร้านก่อนบันทึกค่าใช้จ่าย</div></div>;
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-black text-slate-900">ค่าใช้จ่ายทางภาษี</h1><p className="mt-1 text-sm text-slate-500">ร้าน: {currentBranch?.name || branchId} · บันทึกจากเอกสารผู้รับเงินจริง</p></div>
        <button type="button" onClick={() => load()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <ExpensePayeeMasterDataPanel
        payees={payees}
        loading={loading}
        saving={savingPayee}
        onRefresh={() => searchPayees('')}
        onSearch={searchPayees}
        onCreate={submitPayee}
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <TaxExpenseCreateForm categories={categories} saving={saving} onSubmit={submitExpense} payeeConnectionReady={false} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-slate-900">รายการล่าสุด</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-slate-500"><tr><th className="pb-2">เลขที่</th><th className="pb-2">ผู้รับเงิน</th><th className="pb-2">เอกสาร</th><th className="pb-2 text-right">ยอดรวม</th></tr></thead>
              <tbody>{expenses.map((expense) => <tr key={expense.id} className="border-b border-slate-100"><td className="py-3 font-bold">{expense.expenseNumber}</td><td className="py-3">{expense.counterpartyName}</td><td className="py-3">{expense.documentNumber || '-'}</td><td className="py-3 text-right font-bold">฿{money(expense.totalAmount)}</td></tr>)}</tbody>
            </table>
            {!loading && !expenses.length && <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีรายการค่าใช้จ่าย</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaxExpenseWorkspacePage;
