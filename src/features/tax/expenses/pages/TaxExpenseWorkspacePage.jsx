import React from 'react';
import { AlertTriangle } from 'lucide-react';
import TaxExpenseWorkspaceHeader from '../components/TaxExpenseWorkspaceHeader';
import TaxExpenseForm from '../components/TaxExpenseForm';
import TaxExpenseList from '../components/TaxExpenseList';
import TaxExpenseDetailPanel from '../components/TaxExpenseDetailPanel';
import useTaxExpenseWorkspaceController from '../hooks/useTaxExpenseWorkspaceController';

const TaxExpenseWorkspacePage = () => {
  const controller = useTaxExpenseWorkspaceController();
  if (!controller.branchId) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"><div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนบันทึกค่าใช้จ่าย</span></div></div>;

  return <section className="space-y-5">
    <TaxExpenseWorkspaceHeader branchLabel={controller.currentBranch?.name || controller.branchId} loading={controller.loading} onRefresh={controller.loadWorkspace} />
    {controller.error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{controller.error}</div>}
    <TaxExpenseForm categories={controller.categories} saving={controller.saving} onSubmitExpense={controller.submitExpense} onSubmitCategory={controller.submitCategory} />
    <TaxExpenseList expenses={controller.expenses} filters={controller.filters} loading={controller.loading} onFilterChange={controller.setFilters} onOpenExpense={controller.openExpense} />
    <TaxExpenseDetailPanel expense={controller.selectedExpense} saving={controller.saving} onRecord={controller.recordExpense} />
  </section>;
};

export default TaxExpenseWorkspacePage;
