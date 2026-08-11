import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ExpensePayeeMasterDataPanel from '../components/ExpensePayeeMasterDataPanel';
import TaxExpenseAssessmentPanel from '../components/TaxExpenseAssessmentPanel';
import TaxExpenseCategoryPanel from '../components/TaxExpenseCategoryPanel';
import TaxExpenseCreateForm from '../components/TaxExpenseCreateForm';
import { verifyTaxExpenseEvidence } from '../api/taxExpenseApi';
import useTaxExpenseWorkspace from '../hooks/useTaxExpenseWorkspace';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TaxExpenseWorkspacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAssessmentExpenseId = Number(searchParams.get('assessmentExpenseId') || 0) || null;
  const [assessmentExpenseId, setAssessmentExpenseId] = useState(initialAssessmentExpenseId);
  const [verifyingEvidenceId, setVerifyingEvidenceId] = useState(null);
  const {
    branchId,
    currentBranch,
    expenses,
    categories,
    payees,
    repairReasons,
    loading,
    saving,
    savingPayee,
    savingCategory,
    error,
    load,
    searchPayees,
    submitCategory,
    submitPayee,
    submitExpense,
  } = useTaxExpenseWorkspace();

  const openAssessment = (expenseId) => {
    const normalizedId = Number(expenseId) || null;
    setAssessmentExpenseId(normalizedId);
    const next = new URLSearchParams(searchParams);
    if (normalizedId) next.set('assessmentExpenseId', String(normalizedId));
    else next.delete('assessmentExpenseId');
    setSearchParams(next, { replace: true });
  };

  const verifyEvidence = async (expense) => {
    if (!expense?.id || expense.evidenceStatus === 'VERIFIED') return;
    if (!window.confirm(`ยืนยันว่าหลักฐานของ ${expense.expenseNumber} ถูกตรวจสอบแล้วหรือไม่?`)) return;
    setVerifyingEvidenceId(expense.id);
    try {
      await verifyTaxExpenseEvidence(expense.id, { note: 'Verified from Tax Expense workspace' });
      toast.success('ยืนยันหลักฐานค่าใช้จ่ายแล้ว');
      await load();
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถยืนยันหลักฐานค่าใช้จ่ายได้');
    } finally {
      setVerifyingEvidenceId(null);
    }
  };

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

      <TaxExpenseCategoryPanel
        categories={categories}
        saving={savingCategory}
        onCreate={submitCategory}
      />

      <ExpensePayeeMasterDataPanel
        payees={payees}
        loading={loading}
        saving={savingPayee}
        onRefresh={() => searchPayees('')}
        onSearch={searchPayees}
        onCreate={submitPayee}
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <TaxExpenseCreateForm categories={categories} payees={payees} repairReasons={repairReasons} saving={saving} onSubmit={submitExpense} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-slate-900">รายการล่าสุด</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-slate-500"><tr><th className="pb-2">เลขที่</th><th className="pb-2">ผู้รับเงิน</th><th className="pb-2">เอกสาร</th><th className="pb-2">หลักฐาน</th><th className="pb-2 text-right">ยอดรวม</th><th className="pb-2 text-right">การทำงาน</th></tr></thead>
              <tbody>{expenses.map((expense) => <tr key={expense.id} className="border-b border-slate-100"><td className="py-3 font-bold">{expense.expenseNumber}</td><td className="py-3">{expense.counterpartyName}</td><td className="py-3">{expense.documentNumber || '-'}</td><td className="py-3"><span className={`rounded-full px-2 py-1 font-bold ${expense.evidenceStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{expense.evidenceStatus || 'MISSING'}</span></td><td className="py-3 text-right font-bold">฿{money(expense.totalAmount)}</td><td className="py-3"><div className="flex justify-end gap-1.5"><button type="button" onClick={() => openAssessment(expense.id)} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700 hover:bg-blue-100">ประเมินภาษี</button><button type="button" onClick={() => verifyEvidence(expense)} disabled={expense.evidenceStatus === 'VERIFIED' || verifyingEvidenceId === expense.id} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck size={13} />{expense.evidenceStatus === 'VERIFIED' ? 'หลักฐานครบแล้ว' : verifyingEvidenceId === expense.id ? 'กำลังยืนยัน...' : 'ยืนยันหลักฐาน'}</button></div></td></tr>)}</tbody>
            </table>
            {!loading && !expenses.length && <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีรายการค่าใช้จ่าย</p>}
          </div>
        </div>
      </div>

      <TaxExpenseAssessmentPanel
        expenseId={assessmentExpenseId}
        onClose={() => openAssessment(null)}
        onConfirmed={() => load()}
      />
    </section>
  );
};

export default TaxExpenseWorkspacePage;
