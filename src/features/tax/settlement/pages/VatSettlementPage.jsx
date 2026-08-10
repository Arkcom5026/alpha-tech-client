import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calculator, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { getVatSettlementErrorMessage, getVatSettlementPreparation } from '../api/vatSettlementApi';
import VatCarryForwardAuthorityPanel from '../components/VatCarryForwardAuthorityPanel';

const money = (value) => value == null ? '-' : Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const labels = {
  VAT_SETTLEMENT_OUTPUT_FILING_NOT_PREPARED: 'ยังไม่ได้เตรียมรายงานภาษีขายสำหรับรอบนี้',
  VAT_SETTLEMENT_INPUT_FILING_NOT_PREPARED: 'ยังไม่ได้เตรียมรายงานภาษีซื้อสำหรับรอบนี้',
  VAT_SETTLEMENT_OUTPUT_RECONCILIATION_MISMATCH: 'ยอดภาษีขายใน filing ยังไม่ตรงกับ VAT authority',
  VAT_SETTLEMENT_INPUT_CREDIT_NOT_READY: 'สิทธิ์เครดิตภาษีซื้อยังไม่พร้อมสำหรับการคำนวณ',
  VAT_SETTLEMENT_PERIOD_NOT_LOCKED: 'รอบภาษียังไม่ได้ล็อกหรือยื่นแล้ว',
  VAT_SETTLEMENT_CARRY_FORWARD_AUTHORITY_REQUIRED: 'ยังไม่มี authority ยืนยันภาษีชำระไว้เกินยกมาจากรอบก่อน',
};

const Status = ({ passed, children }) => (
  <div className="flex items-center gap-2 text-sm font-semibold">
    <CheckCircle2 size={16} className={passed ? 'text-emerald-600' : 'text-slate-300'} />
    <span>{children}</span>
  </div>
);

const VatSettlementPage = () => {
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
      setData(await getVatSettlementPreparation({ branchId, taxPeriodId }));
    } catch (requestError) {
      const message = getVatSettlementErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => { load(); }, [load]);

  const settlement = data?.settlement || {};
  const carryForward = data?.carryForward || {};
  const readiness = data?.readiness || {};
  const exceptions = Array.isArray(data?.exceptions) ? data.exceptions : [];
  const checks = useMemo(() => [
    ['Output filing พร้อม', readiness.outputFilingPrepared],
    ['Output filing reconcile แล้ว', readiness.outputFilingReconciled],
    ['Input filing พร้อม', readiness.inputFilingPrepared],
    ['สิทธิ์เครดิต Input VAT พร้อม', readiness.inputCreditAuthorityReady],
    ['เครดิตยกมามี authority', readiness.carryForwardAuthorityReady],
    ['รอบภาษีล็อก/ยื่นแล้ว', readiness.periodLockedOrSubmitted],
  ], [readiness]);

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="ย้อนกลับ">
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">VAT Settlement Preparation</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">เตรียมสรุป VAT สำหรับ ภ.พ.30</h1>
              <p className="mt-1 text-sm text-slate-500">รอบ {data?.period?.periodCode || taxPeriodId} · {currentBranch?.name || `สาขา #${branchId || '-'}`}</p>
              <p className="mt-1 text-xs text-slate-400">Preparation & validation workspace — ยังไม่ใช่การยื่นแบบต่อกรมสรรพากร</p>
            </div>
          </div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> รีเฟรช
          </button>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">กำลังคำนวณ VAT Settlement...</div>
      ) : data ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Output VAT</p><p className="mt-1 text-2xl font-black text-emerald-950">฿{money(settlement.outputVatAuthority)}</p></div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs text-blue-700">Input VAT ใช้เครดิตได้</p><p className="mt-1 text-2xl font-black text-blue-950">฿{money(settlement.creditableInputVat)}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Input VAT ยังไม่ได้ใช้เครดิต</p><p className="mt-1 text-2xl font-black">฿{money(settlement.nonCreditableOrUnselectedInputVat)}</p></div>
            <div className={`rounded-2xl border p-4 ${Number(settlement.currentPeriodNetVat || 0) >= 0 ? 'border-amber-200 bg-amber-50' : 'border-indigo-200 bg-indigo-50'}`}><p className="text-xs">VAT สุทธิรอบปัจจุบัน</p><p className="mt-1 text-2xl font-black">฿{money(settlement.currentPeriodNetVat)}</p></div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-center gap-2 text-rose-800"><Calculator size={18} /><h2 className="font-black">VAT ต้องชำระตาม ภ.พ.30</h2></div>
              <p className="mt-2 text-3xl font-black text-rose-950">{settlement.pp30VatPayable == null ? 'รอ Authority' : `฿${money(settlement.pp30VatPayable)}`}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="flex items-center gap-2 text-indigo-800"><Calculator size={18} /><h2 className="font-black">VAT เครดิตคงเหลือตาม ภ.พ.30</h2></div>
              <p className="mt-2 text-3xl font-black text-indigo-950">{settlement.pp30VatCredit == null ? 'รอ Authority' : `฿${money(settlement.pp30VatCredit)}`}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-700"><Calculator size={18} /><h2 className="font-black">ภาษีชำระไว้เกินยกมา</h2></div>
              <p className="mt-2 text-3xl font-black">{carryForward.amount == null ? 'รอ Authority' : `฿${money(carryForward.amount)}`}</p>
              <p className="mt-1 text-xs text-slate-500">{carryForward.previousPeriodCode ? `อ้างอิงรอบ ${carryForward.previousPeriodCode}` : 'ไม่มีรอบก่อนหน้า'}</p>
            </div>
          </section>

          <VatCarryForwardAuthorityPanel branchId={branchId} taxPeriodId={taxPeriodId} onConfirmed={load} />

          <section className={`rounded-2xl border p-4 ${readiness.readyForPp30Preparation ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <h2 className="font-black">PP30 Preparation Readiness</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {checks.map(([label, passed]) => <Status key={label} passed={passed}>{label}</Status>)}
            </div>
            <p className="mt-3 text-sm font-black">{readiness.readyForPp30Preparation ? 'พร้อมสำหรับขั้นเตรียม ภ.พ.30' : readiness.readyForCurrentPeriodSettlement ? 'ยอด VAT รอบปัจจุบันพร้อมแล้ว แต่ยังมี authority อื่นที่ต้องยืนยันก่อนเตรียม ภ.พ.30' : 'ยังมีรายการที่ต้องแก้ก่อนใช้ยอด settlement เป็นข้อมูลเตรียม ภ.พ.30'}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-black text-slate-900">Reconciliation</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm">
              <div><p className="text-slate-500">Output VAT authority</p><p className="mt-1 font-black">฿{money(settlement.outputVatAuthority)}</p></div>
              <div><p className="text-slate-500">Output filing</p><p className="mt-1 font-black">฿{money(settlement.outputVatFiling)}</p></div>
              <div><p className="text-slate-500">ผลต่าง</p><p className="mt-1 font-black">฿{money(settlement.outputReconciliationDifference)}</p></div>
              <div><p className="text-slate-500">VAT สุทธิหลังเครดิตยกมา</p><p className="mt-1 font-black">{settlement.pp30NetVatAfterCarryForward == null ? 'รอ Authority' : `฿${money(settlement.pp30NetVatAfterCarryForward)}`}</p></div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800"><ShieldAlert size={18} /><h2 className="font-black">Settlement Exceptions</h2></div>
            {exceptions.length === 0 ? <p className="mt-3 text-sm font-semibold text-emerald-700">ไม่มี blocker สำหรับขั้นเตรียม ภ.พ.30</p> : (
              <div className="mt-3 space-y-2">
                {exceptions.map((entry) => (
                  <div key={entry.code} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm">
                    <div className="font-black text-amber-900">{entry.code}</div>
                    <div className="mt-1 text-slate-600">{labels[entry.code] || entry.code}{entry.amount != null ? ` · ผลต่าง ฿${money(entry.amount)}` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
};

export default VatSettlementPage;
