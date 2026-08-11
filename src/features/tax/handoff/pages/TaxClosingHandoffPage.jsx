import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, FileSpreadsheet, PackageCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getTaxClosingHandoffBundle,
  getTaxClosingHandoffErrorMessage,
} from '../api/taxClosingHandoffApi';

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const downloadBlob = ({ filename, content, type }) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
const downloadJson = (filename, value) => downloadBlob({
  filename,
  content: JSON.stringify(value, null, 2),
  type: 'application/json;charset=utf-8',
});
const downloadCsv = (filename, headers, rows) => downloadBlob({
  filename,
  content: `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`,
  type: 'text/csv;charset=utf-8',
});
const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TaxClosingHandoffPage = () => {
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
      setData(await getTaxClosingHandoffBundle({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = getTaxClosingHandoffErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const snapshot = data?.snapshot || {};
  const periodCode = data?.periodCode || taxPeriodId;
  const readiness = snapshot?.readiness?.summary || {};
  const manifestFiles = data?.manifest?.files || [];
  const hashShort = data?.snapshotHash ? `${data.snapshotHash.slice(0, 12)}…${data.snapshotHash.slice(-8)}` : '-';

  const exportRows = useMemo(() => ({
    outputVat: (snapshot?.outputVat?.documents || []).map((row) => [
      row.documentDate || '', row.issuedDocumentNumber || '', row.ledgerType || '', row.counterpartyName || '',
      row.counterpartyTaxId || '', row.subtotalAmount, row.taxAmount, row.totalAmount,
    ]),
    inputVat: (snapshot?.inputVat?.documents || []).map((row) => [
      row.documentDate || '', row.issuedDocumentNumber || '', row.ledgerType || '', row.counterpartyName || '',
      row.counterpartyTaxId || '', row.subtotalAmount, row.taxAmount, row.totalAmount,
    ]),
    expenses: (snapshot?.expenses?.rows || []).map((row) => [
      row.expenseDate || '', row.expenseNumber || '', row.counterpartyName || '', row.documentNumber || '',
      row.subtotalAmount, row.vatAmount, row.totalAmount, row.withholdingTaxAmount, row.paymentDueAmount, row.evidenceStatus || '',
    ]),
    withholding: (snapshot?.withholding?.rows || []).map((row) => [
      row.expenseNumber || row.taxExpenseNumber || '', row.counterpartyName || '', row.counterpartyTaxId || '',
      row.withholdingTaxAmount ?? row.taxAmount ?? 0, row.formType || '', row.certificateNumber || '', row.status || '',
    ]),
  }), [snapshot]);

  const exportAll = () => {
    if (!data) return;
    downloadJson(`tax-closing-${periodCode}-manifest.json`, {
      ...data.manifest,
      snapshotHash: data.snapshotHash,
      packageVersion: data.packageVersion,
      generatedAt: data.generatedAt,
    });
    downloadJson(`tax-closing-${periodCode}-bundle.json`, data);
    downloadJson(`pp30-settlement-${periodCode}.json`, snapshot?.pp30 || {});
    downloadCsv(`output-vat-${periodCode}.csv`, ['วันที่', 'เลขเอกสาร', 'ประเภท', 'คู่ค้า', 'เลขผู้เสียภาษี', 'ก่อน VAT', 'VAT', 'รวม'], exportRows.outputVat);
    downloadCsv(`input-vat-${periodCode}.csv`, ['วันที่', 'เลขเอกสาร', 'ประเภท', 'คู่ค้า', 'เลขผู้เสียภาษี', 'ก่อน VAT', 'VAT', 'รวม'], exportRows.inputVat);
    downloadCsv(`tax-expenses-${periodCode}.csv`, ['วันที่', 'เลขค่าใช้จ่าย', 'คู่ค้า', 'เลขเอกสาร', 'ก่อน VAT', 'VAT', 'รวม', 'WHT', 'ยอดจ่าย', 'หลักฐาน'], exportRows.expenses);
    downloadCsv(`withholding-tax-${periodCode}.csv`, ['เลขค่าใช้จ่าย', 'คู่ค้า', 'เลขผู้เสียภาษี', 'WHT', 'แบบ', 'หนังสือรับรอง', 'สถานะ'], exportRows.withholding);
  };

  if (!branchId) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">กรุณาเลือกร้านก่อนเปิด Tax Closing Package</div>;
  }

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Tax Closing Package</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">ชุดข้อมูลภาษีพร้อมส่งต่อ</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {periodCode} · {currentBranch?.name || `สาขา #${branchId}`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
            <button type="button" onClick={exportAll} disabled={!data} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Download size={16} />ดาวน์โหลดชุดส่งต่อ</button>
          </div>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังสร้าง Tax Closing Snapshot...</div> : data && (
        <>
          <section className={`rounded-2xl border p-5 ${data.handoffReady ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2"><PackageCheck size={20} /><h2 className="font-black">{data.handoffReady ? 'READY FOR HANDOFF' : 'DRAFT — ยังมีรายการต้องจัดการ'}</h2></div>
            <p className="mt-2 text-sm">Readiness {readiness.readinessPercent ?? 0}% · Blockers {readiness.blockerCount ?? 0} · Package v{data.packageVersion}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-600">Snapshot SHA-256: {hashShort}</p>
            <p className="mt-2 text-xs font-semibold text-slate-600">ชุดนี้ใช้สำหรับส่งสำนักงานบัญชีหรือใช้เตรียมการยื่นเองในอนาคต และไม่ใช่หลักฐานการยื่นต่อกรมสรรพากรโดยตรง</p>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-emerald-200 bg-white p-4"><p className="text-xs text-slate-500">Output VAT</p><p className="mt-1 text-xl font-black">฿{money(snapshot?.outputVat?.summary?.taxAmount)}</p><p className="text-xs text-slate-500">{snapshot?.outputVat?.documents?.length || 0} เอกสาร</p></div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4"><p className="text-xs text-slate-500">Input VAT</p><p className="mt-1 text-xl font-black">฿{money(snapshot?.inputVat?.summary?.taxAmount)}</p><p className="text-xs text-slate-500">{snapshot?.inputVat?.documents?.length || 0} เอกสาร</p></div>
            <div className="rounded-2xl border border-amber-200 bg-white p-4"><p className="text-xs text-slate-500">Tax Expenses</p><p className="mt-1 text-xl font-black">฿{money(snapshot?.expenses?.summary?.totalAmount)}</p><p className="text-xs text-slate-500">{snapshot?.expenses?.rows?.length || 0} รายการ</p></div>
            <div className="rounded-2xl border border-violet-200 bg-white p-4"><p className="text-xs text-slate-500">WHT</p><p className="mt-1 text-xl font-black">฿{money(snapshot?.withholding?.summary?.withholdingTaxAmount)}</p><p className="text-xs text-slate-500">{snapshot?.withholding?.rows?.length || 0} รายการ</p></div>
            <div className="rounded-2xl border border-cyan-200 bg-white p-4"><p className="text-xs text-slate-500">PP30 สุทธิ</p><p className="mt-1 text-xl font-black">฿{money(snapshot?.pp30?.settlement?.pp30VatPayable ?? snapshot?.pp30?.settlement?.pp30VatCredit)}</p><p className="text-xs text-slate-500">{snapshot?.pp30?.readiness?.readyForPp30Preparation ? 'พร้อม' : 'ยังไม่พร้อม'}</p></div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><ShieldCheck size={18} /><h2 className="font-black">Package Manifest</h2></div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {manifestFiles.map((file) => <div key={file.key} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-2"><FileSpreadsheet size={15} /><p className="text-xs font-black">{file.key}</p></div><p className="mt-1 break-all text-xs text-slate-500">{file.filename}</p></div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black">Readiness Domains</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {(snapshot?.readiness?.domains || []).map((domain) => <div key={domain.key} className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-black">{domain.label}</p><p className={`mt-1 text-sm font-bold ${domain.ready ? 'text-emerald-600' : 'text-amber-700'}`}>{domain.ready ? 'พร้อม' : 'ยังไม่พร้อม'}</p></div>)}
            </div>
          </section>
        </>
      )}
    </section>
  );
};

export default TaxClosingHandoffPage;
