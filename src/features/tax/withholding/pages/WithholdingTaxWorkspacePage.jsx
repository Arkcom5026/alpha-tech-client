import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileCheck2, RefreshCw, ShieldAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  getWithholdingTaxErrorMessage,
  getWithholdingTaxWorkspace,
  issueWithholdingCertificate,
  prepareWithholdingFiling,
  submitWithholdingFiling,
  transitionWithholdingTreatment,
} from '../api/withholdingTaxApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formLabel = (value) => value === 'PND3' ? 'ภ.ง.ด.3' : value === 'PND53' ? 'ภ.ง.ด.53' : value || '-';

const Status = ({ passed, children }) => (
  <div className="flex items-center gap-2 text-sm font-semibold">
    <CheckCircle2 size={16} className={passed ? 'text-emerald-600' : 'text-slate-300'} />
    <span>{children}</span>
  </div>
);

const WithholdingTaxWorkspacePage = () => {
  const navigate = useNavigate();
  const { taxPeriodId } = useParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [references, setReferences] = useState({ PND3: '', PND53: '' });
  const [manualForms, setManualForms] = useState({});

  const load = useCallback(async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      setData(await getWithholdingTaxWorkspace({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = getWithholdingTaxErrorMessage(requestError);
      setError(message);
      feedback.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => Array.isArray(data?.rows) ? data.rows : [], [data?.rows]);
  const filings = useMemo(() => Array.isArray(data?.filings) ? data.filings : [], [data?.filings]);
  const exceptions = useMemo(() => Array.isArray(data?.exceptions) ? data.exceptions : [], [data?.exceptions]);
  const readiness = useMemo(() => data?.readiness || {}, [data?.readiness]);
  const summary = useMemo(() => data?.summary || {}, [data?.summary]);
  const noWhtSource = Number(summary.sourceItemCount || 0) === 0;
  const filingByForm = useMemo(() => Object.fromEntries(filings.map((row) => [row.formType, row])), [filings]);
  const expenseGroups = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      if (!map.has(row.taxExpenseId)) map.set(row.taxExpenseId, []);
      map.get(row.taxExpenseId).push(row);
    });
    return Array.from(map.values());
  }, [rows]);

  const run = async (key, work, successMessage) => {
    setBusyKey(key);
    try {
      await work();
      feedback.success(successMessage);
      await load();
    } catch (requestError) {
      feedback.error(getWithholdingTaxErrorMessage(requestError));
    } finally {
      setBusyKey('');
    }
  };

  const transition = async (row, resultingTreatment) => run(
    `treatment:${row.taxExpenseItemId}`,
    () => transitionWithholdingTreatment({ branchId, taxExpenseItemId: row.taxExpenseItemId, resultingTreatment }),
    resultingTreatment === 'WITHHOLDING_REQUIRED' ? 'ยืนยันว่ารายการนี้ต้องหัก WHT แล้ว' : 'ยืนยันว่าหัก WHT แล้ว',
  );

  const issue = async (group) => {
    const first = group[0];
    const selectedForm = first.recommendedFormType || manualForms[first.taxExpenseId];
    if (!selectedForm) {
      feedback.warning('กรุณาเลือก ภ.ง.ด.3 หรือ ภ.ง.ด.53 สำหรับผู้รับเงินรายนี้');
      return;
    }
    return run(`cert:${first.taxExpenseId}`, () => issueWithholdingCertificate({ branchId, taxPeriodId, taxExpenseId: first.taxExpenseId, formType: selectedForm }), `ออกหนังสือรับรอง WHT ${first.expenseNumber} แล้ว`);
  };

  const prepare = async (formType) => run(`prepare:${formType}`, () => prepareWithholdingFiling({ branchId, taxPeriodId, formType }), `เตรียม ${formLabel(formType)} แล้ว`);
  const submit = async (formType) => run(`submit:${formType}`, () => submitWithholdingFiling({ branchId, taxPeriodId, formType, reference: references[formType] }), `บันทึกหลักฐานการยื่น ${formLabel(formType)} แล้ว`);

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="ย้อนกลับ"><ArrowLeft size={18} /></button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Withholding Tax Workspace</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">ภาษีหัก ณ ที่จ่าย / WHT</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {data?.period?.periodCode || taxPeriodId} · {currentBranch?.name || `สาขา #${branchId || '-'}`}</p>
              <p className="mt-1 text-xs text-slate-400">Review → WITHHOLDING_REQUIRED → WITHHELD → Certificate → ภ.ง.ด.3 / ภ.ง.ด.53 preparation → manual filing evidence — ยังไม่ใช่ direct e-Filing</p>
            </div>
          </div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> รีเฟรช</button>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังโหลด WHT workspace...</div> : data ? <>
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">รายการ WHT</p><p className="mt-1 text-2xl font-black">{summary.sourceItemCount || 0}</p></div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs text-violet-700">WITHHELD แล้ว</p><p className="mt-1 text-2xl font-black text-violet-950">{summary.withheldItemCount || 0}</p></div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs text-blue-700">ฐานภาษี WHT</p><p className="mt-1 text-2xl font-black text-blue-950">฿{money(summary.taxableBaseAmount)}</p></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs text-amber-700">ภาษีหัก ณ ที่จ่าย</p><p className="mt-1 text-2xl font-black text-amber-950">฿{money(summary.withholdingTaxAmount)}</p></div>
        </section>

        <section className={`rounded-2xl border p-4 ${readiness.readyForAccountant ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <h2 className="font-black">WHT Readiness</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {noWhtSource ? <>
              <Status passed>ไม่มีรายการที่ต้องออกหนังสือรับรอง</Status>
              <Status passed>ไม่มีรายการที่ต้องยื่น ภ.ง.ด.3/53</Status>
              <Status passed>ไม่มี WHT blocker สำหรับสำนักงานบัญชี</Status>
            </> : <>
              <Status passed={readiness.certificatesReady}>หนังสือรับรองครบ</Status>
              <Status passed={readiness.filingsReady}>Filing ที่มีรายการยื่นครบ</Status>
              <Status passed={readiness.readyForAccountant}>พร้อมส่งสำนักงานบัญชี</Status>
            </>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-black text-slate-900">ตรวจและยืนยัน WHT</h2>
          {expenseGroups.length === 0 ? <p className="mt-3 text-sm text-slate-500">ไม่มีรายการค่าใช้จ่ายที่มี WHT ในรอบนี้</p> : <div className="mt-3 space-y-4">
            {expenseGroups.map((group) => {
              const first = group[0];
              const certificateIssued = first.certificateStatus === 'ISSUED';
              const canIssue = group.every((row) => row.whtTreatment === 'WITHHELD' && Number(row.withholdingTaxAmount || 0) > 0);
              return <div key={first.taxExpenseId} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div><div className="font-black text-slate-900">{first.expenseNumber} · {first.counterpartyName}</div><div className="mt-1 text-xs text-slate-500">{group.length} รายการ · WHT ฿{money(group.reduce((sum, row) => sum + Number(row.withholdingTaxAmount || 0), 0))} · {certificateIssued ? `ใบรับรอง ${first.certificateNumber}` : 'ยังไม่ออกใบรับรอง'}</div></div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!first.recommendedFormType && <select value={manualForms[first.taxExpenseId] || ''} onChange={(event) => setManualForms((current) => ({ ...current, [first.taxExpenseId]: event.target.value }))} className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-bold"><option value="">เลือกแบบ</option><option value="PND3">ภ.ง.ด.3</option><option value="PND53">ภ.ง.ด.53</option></select>}
                    <span className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-bold">{formLabel(first.recommendedFormType || manualForms[first.taxExpenseId])}</span>
                    <button type="button" disabled={!canIssue || !!busyKey} onClick={() => issue(group)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"><FileCheck2 size={14} /> {certificateIssued ? 'ออกใบรับรองใหม่' : 'ออกหนังสือรับรอง'}</button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {group.map((row) => <div key={row.taxExpenseItemId} className="flex flex-col gap-2 rounded-lg bg-slate-50 p-2 text-xs md:flex-row md:items-center md:justify-between">
                    <div><span className="font-bold">#{row.lineNumber} {row.description}</span><span className="ml-2 text-slate-500">WHT {money(row.withholdingTaxRate)}% · ฿{money(row.withholdingTaxAmount)} · {row.whtTreatment}</span></div>
                    <div className="flex gap-2">
                      {row.whtTreatment === 'PENDING_REVIEW' && <button type="button" disabled={!!busyKey || certificateIssued} onClick={() => transition(row, 'WITHHOLDING_REQUIRED')} className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 font-bold text-amber-800 disabled:opacity-40">ยืนยันว่าต้องหัก</button>}
                      {row.whtTreatment === 'WITHHOLDING_REQUIRED' && <button type="button" disabled={!!busyKey || certificateIssued} onClick={() => transition(row, 'WITHHELD')} className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1.5 font-bold text-emerald-800 disabled:opacity-40">ยืนยันว่าหักแล้ว</button>}
                    </div>
                  </div>)}
                </div>
              </div>;
            })}
          </div>}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {['PND3', 'PND53'].map((formType) => {
            const filing = filingByForm[formType];
            return <div key={formType} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="font-black text-slate-900">{formLabel(formType)} Filing Preparation</h2>
              <div className="mt-2 text-sm text-slate-600">สถานะ: <span className="font-black">{noWhtSource ? 'ไม่มีรายการที่ต้องยื่น' : filing?.status || 'ยังไม่เตรียม'}</span> · {Number(filing?.itemCount || 0)} รายการ · WHT ฿{money(filing?.withholdingTaxAmount)}</div>
              {noWhtSource ? <p className="mt-3 text-xs font-semibold text-slate-500">ไม่ต้องเตรียมแบบสำหรับรอบนี้</p> : <div className="mt-3"><button type="button" disabled={!!busyKey || filing?.status === 'SUBMITTED'} onClick={() => prepare(formType)} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40">เตรียม {formLabel(formType)}</button></div>}
              {filing?.status === 'PREPARED' && <div className="mt-3 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3"><label className="block text-xs font-bold text-amber-900">เลขอ้างอิง/หลักฐานการยื่นภายนอก</label><input value={references[formType] || ''} onChange={(event) => setReferences((current) => ({ ...current, [formType]: event.target.value }))} className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" placeholder="เช่น RD-ACK-2026-08-001" /><button type="button" disabled={!!busyKey || !String(references[formType] || '').trim()} onClick={() => submit(formType)} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">ยืนยันว่าดำเนินการยื่นภายนอกแล้ว</button></div>}
              {filing?.status === 'SUBMITTED' && <p className="mt-3 text-sm font-bold text-emerald-700">บันทึกหลักฐานการยื่นแล้ว</p>}
            </div>;
          })}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800"><ShieldAlert size={18} /><h2 className="font-black">WHT Exceptions</h2></div>
          {exceptions.length === 0 ? <p className="mt-3 text-sm font-semibold text-emerald-700">ไม่มี blocker ของ WHT รอบนี้</p> : <div className="mt-3 space-y-2">{exceptions.map((entry) => <div key={entry.code} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"><div className="font-black text-amber-900">{entry.code} · {entry.count}</div><div className="mt-1 text-slate-600">{entry.message}</div></div>)}</div>}
        </section>
      </> : null}
    </section>
  );
};

export default WithholdingTaxWorkspacePage;