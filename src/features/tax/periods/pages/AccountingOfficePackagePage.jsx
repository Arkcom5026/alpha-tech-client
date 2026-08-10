import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getAccountingOfficePackage,
  getAccountingOfficePackageErrorMessage,
} from '../api/accountingOfficePackageApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const date = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const downloadCsvFile = ({ filename, headers, rows }) => {
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const ReadinessCheck = ({ label, passed }) => (
  <div className="flex items-center gap-2 text-sm font-semibold">
    <CheckCircle2 size={16} className={passed ? 'text-emerald-600' : 'text-slate-300'} /> {label}
  </div>
);

const AccountingOfficePackagePage = () => {
  const navigate = useNavigate();
  const { taxPeriodId } = useParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      setData(await getAccountingOfficePackage({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = getAccountingOfficePackageErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const readiness = data?.readiness || {};
  const checks = useMemo(() => [
    ['Output VAT พร้อม', readiness.outputVatReady],
    ['Input VAT พร้อม', readiness.inputVatReady],
    ['ค่าใช้จ่ายจัดหมวดครบ', readiness.expensesClassified],
    ['หลักฐานค่าใช้จ่ายครบ', readiness.expenseEvidenceComplete],
    ['รอบภาษีล็อก/ยื่นแล้ว', readiness.periodLockedOrSubmitted],
  ], [readiness]);

  const periodCode = data?.period?.periodCode || taxPeriodId;

  const downloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tax-closing-${periodCode}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadOutputCsv = () => {
    if (!data) return;
    downloadCsvFile({
      filename: `output-vat-${periodCode}.csv`,
      headers: ['วันที่', 'เลขที่เอกสาร', 'ประเภท', 'ลูกค้า', 'เลขผู้เสียภาษี', 'มูลค่าก่อน VAT', 'VAT', 'ยอดรวม'],
      rows: (data.documents || []).map((document) => [
        date(document.documentDate),
        document.issuedDocumentNumber,
        document.ledgerType === 'OUTPUT_VAT_ADJUSTMENT' ? 'ใบลดหนี้/ปรับปรุง' : document.taxInvoiceKind || 'ใบกำกับภาษี',
        document.counterpartyName || '',
        document.counterpartyTaxId || '',
        document.subtotalAmount,
        document.taxAmount,
        document.totalAmount,
      ]),
    });
  };

  const downloadInputCsv = () => {
    if (!data) return;
    downloadCsvFile({
      filename: `input-vat-${periodCode}.csv`,
      headers: ['วันที่', 'เลขที่เอกสาร', 'ประเภท', 'ผู้ขาย/คู่ค้า', 'เลขผู้เสียภาษี', 'มูลค่าก่อน VAT', 'VAT', 'ยอดรวม'],
      rows: (data.inputDocuments || []).map((document) => [
        date(document.documentDate),
        document.issuedDocumentNumber,
        document.ledgerType === 'INPUT_VAT_ADJUSTMENT' ? 'ปรับปรุงภาษีซื้อ' : document.taxInvoiceKind || 'ใบกำกับภาษีซื้อ',
        document.counterpartyName || '',
        document.counterpartyTaxId || '',
        document.subtotalAmount,
        document.taxAmount,
        document.totalAmount,
      ]),
    });
  };

  const downloadExpenseCsv = () => {
    if (!data) return;
    downloadCsvFile({
      filename: `tax-expenses-${periodCode}.csv`,
      headers: ['วันที่', 'เลขที่ค่าใช้จ่าย', 'คู่ค้า', 'เอกสารอ้างอิง', 'ก่อน VAT', 'VAT', 'ยอดรวม', 'WHT', 'ยอดจ่าย', 'สถานะหลักฐาน', 'รายการรอประเมิน'],
      rows: (data.expenses || []).map((expense) => [
        date(expense.expenseDate),
        expense.expenseNumber,
        expense.counterpartyName || '',
        expense.documentNumber || '',
        expense.subtotalAmount,
        expense.vatAmount,
        expense.totalAmount,
        expense.withholdingTaxAmount,
        expense.paymentDueAmount,
        expense.evidenceStatus,
        expense.pendingAssessmentItemCount,
      ]),
    });
  };

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="ย้อนกลับ">
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Monthly Tax Closing Package</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">ชุดปิดภาษีประจำเดือนส่งสำนักงานบัญชี</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {periodCode} · {currentBranch?.name || `สาขา #${branchId || '-'}`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> รีเฟรช
            </button>
            <button type="button" onClick={downloadOutputCsv} disabled={!data} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800 disabled:opacity-50">
              <FileSpreadsheet size={16} /> Output VAT CSV
            </button>
            <button type="button" onClick={downloadInputCsv} disabled={!data} className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-800 disabled:opacity-50">
              <FileSpreadsheet size={16} /> Input VAT CSV
            </button>
            <button type="button" onClick={downloadExpenseCsv} disabled={!data} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-bold text-amber-800 disabled:opacity-50">
              <FileSpreadsheet size={16} /> Expenses CSV
            </button>
            <button type="button" onClick={downloadJson} disabled={!data} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              <Download size={16} /> Closing JSON
            </button>
          </div>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังจัดเตรียมข้อมูล...</div>
      ) : data ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs text-emerald-700">ภาษีขายสุทธิ</p><p className="mt-1 text-2xl font-black text-emerald-950">฿{money(data.summary?.taxAmount)}</p><p className="mt-1 text-xs text-emerald-700">{data.summary?.documentCount || 0} เอกสาร</p></div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs text-blue-700">ภาษีซื้อสุทธิ</p><p className="mt-1 text-2xl font-black text-blue-950">฿{money(data.inputSummary?.taxAmount)}</p><p className="mt-1 text-xs text-blue-700">{data.inputSummary?.documentCount || 0} เอกสาร</p></div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs text-amber-700">ค่าใช้จ่ายรวม</p><p className="mt-1 text-2xl font-black text-amber-950">฿{money(data.expenseSummary?.totalAmount)}</p><p className="mt-1 text-xs text-amber-700">{data.expenseSummary?.expenseCount || 0} รายการ</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">WHT จากค่าใช้จ่าย</p><p className="mt-1 text-2xl font-black">฿{money(data.expenseSummary?.withholdingTaxAmount)}</p><p className="mt-1 text-xs text-slate-500">Foundation สำหรับ WHT workflow ถัดไป</p></div>
          </section>

          <section className={`rounded-2xl border p-4 ${readiness.readyForAccountingOffice ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2"><ShieldCheck size={19} /><h2 className="font-black">Tax Closing Readiness</h2></div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {checks.map(([label, passed]) => <ReadinessCheck key={label} label={label} passed={passed} />)}
            </div>
            <p className="mt-3 text-sm font-black">{readiness.readyForAccountingOffice ? 'READY FOR ACCOUNTANT — พร้อมส่งสำนักงานบัญชี' : 'ยังมีรายการที่ต้องจัดการก่อนปิดชุดส่งสำนักงานบัญชี'}</p>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Output VAT</p><p className="mt-2 font-black">{readiness.outputVatReady ? 'พร้อม' : 'ยังไม่พร้อม'}</p><p className="mt-1 text-xs text-slate-500">Filing {readiness.filingPrepared ? 'เตรียมแล้ว' : 'ยังไม่เตรียม'} · ครบ {readiness.filingCoversAllDocuments ? '✓' : '—'}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Input VAT</p><p className="mt-2 font-black">{readiness.inputVatReady ? 'พร้อม' : 'ยังไม่พร้อม'}</p><p className="mt-1 text-xs text-slate-500">Filing {readiness.inputFilingPrepared ? 'เตรียมแล้ว' : 'ยังไม่เตรียม'} · ครบ {readiness.inputFilingCoversAllDocuments ? '✓' : '—'}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Tax Expenses</p><p className="mt-2 font-black">{readiness.expensesReady ? 'พร้อม' : 'ต้อง Review'}</p><p className="mt-1 text-xs text-slate-500">รอประเมิน {data.expenseSummary?.pendingAssessmentCount || 0} · หลักฐานไม่ครบ {data.expenseSummary?.missingEvidenceCount || 0}</p></div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-black text-slate-900">รายละเอียดภาษีขาย</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500"><tr><th className="px-4 py-3">วันที่</th><th className="px-4 py-3">เลขเอกสาร</th><th className="px-4 py-3">ประเภท</th><th className="px-4 py-3">ลูกค้า</th><th className="px-4 py-3 text-right">ก่อน VAT</th><th className="px-4 py-3 text-right">VAT</th><th className="px-4 py-3 text-right">รวม</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.documents || []).length === 0 ? <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">ไม่มีรายการภาษีขายในรอบนี้</td></tr> : data.documents.map((document) => (
                    <tr key={document.outputVatRecordId}>
                      <td className="px-4 py-3 text-slate-600">{date(document.documentDate)}</td><td className="px-4 py-3 font-bold text-slate-900">{document.issuedDocumentNumber || '-'}</td><td className="px-4 py-3">{document.ledgerType === 'OUTPUT_VAT_ADJUSTMENT' ? 'ปรับปรุง/ใบลดหนี้' : document.taxInvoiceKind || 'ใบกำกับภาษี'}</td><td className="px-4 py-3"><div className="font-semibold">{document.counterpartyName || '-'}</div><div className="text-xs text-slate-400">{document.counterpartyTaxId || '-'}</div></td><td className="px-4 py-3 text-right">฿{money(document.subtotalAmount)}</td><td className="px-4 py-3 text-right font-bold">฿{money(document.taxAmount)}</td><td className="px-4 py-3 text-right font-black">฿{money(document.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-black text-slate-900">รายละเอียดภาษีซื้อ</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500"><tr><th className="px-4 py-3">วันที่</th><th className="px-4 py-3">เลขเอกสาร</th><th className="px-4 py-3">ประเภท</th><th className="px-4 py-3">ผู้ขาย/คู่ค้า</th><th className="px-4 py-3 text-right">ก่อน VAT</th><th className="px-4 py-3 text-right">VAT</th><th className="px-4 py-3 text-right">รวม</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.inputDocuments || []).length === 0 ? <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">ไม่มีรายการภาษีซื้อในรอบนี้</td></tr> : data.inputDocuments.map((document) => (
                    <tr key={document.inputVatRecordId}>
                      <td className="px-4 py-3 text-slate-600">{date(document.documentDate)}</td><td className="px-4 py-3 font-bold text-slate-900">{document.issuedDocumentNumber || '-'}</td><td className="px-4 py-3">{document.ledgerType === 'INPUT_VAT_ADJUSTMENT' ? 'ปรับปรุงภาษีซื้อ' : document.taxInvoiceKind || 'ใบกำกับภาษีซื้อ'}</td><td className="px-4 py-3"><div className="font-semibold">{document.counterpartyName || '-'}</div><div className="text-xs text-slate-400">{document.counterpartyTaxId || '-'}</div></td><td className="px-4 py-3 text-right">฿{money(document.subtotalAmount)}</td><td className="px-4 py-3 text-right font-bold">฿{money(document.taxAmount)}</td><td className="px-4 py-3 text-right font-black">฿{money(document.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-black text-slate-900">ค่าใช้จ่ายและสถานะการตรวจ</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500"><tr><th className="px-4 py-3">วันที่</th><th className="px-4 py-3">เลขค่าใช้จ่าย</th><th className="px-4 py-3">คู่ค้า</th><th className="px-4 py-3 text-right">ยอดรวม</th><th className="px-4 py-3 text-right">VAT</th><th className="px-4 py-3 text-right">WHT</th><th className="px-4 py-3">หลักฐาน</th><th className="px-4 py-3 text-right">รอประเมิน</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.expenses || []).length === 0 ? <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">ไม่มีค่าใช้จ่ายภาษีในรอบนี้</td></tr> : data.expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-slate-600">{date(expense.expenseDate)}</td><td className="px-4 py-3 font-bold text-slate-900">{expense.expenseNumber || '-'}</td><td className="px-4 py-3">{expense.counterpartyName || '-'}</td><td className="px-4 py-3 text-right font-black">฿{money(expense.totalAmount)}</td><td className="px-4 py-3 text-right">฿{money(expense.vatAmount)}</td><td className="px-4 py-3 text-right">฿{money(expense.withholdingTaxAmount)}</td><td className="px-4 py-3">{expense.evidenceStatus || '-'}</td><td className="px-4 py-3 text-right font-bold">{expense.pendingAssessmentItemCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
};

export default AccountingOfficePackagePage;
