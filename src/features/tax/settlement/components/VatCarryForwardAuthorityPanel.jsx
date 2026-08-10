import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, RefreshCw, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  confirmVatCarryForwardAuthority,
  getVatCarryForwardAuthority,
  getVatSettlementErrorMessage,
} from '../api/vatSettlementApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const VatCarryForwardAuthorityPanel = ({ branchId, taxPeriodId, onConfirmed }) => {
  const [context, setContext] = useState(null);
  const [amount, setAmount] = useState('0.00');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sourceType = context?.previousPeriod ? 'PRIOR_PERIOD' : 'HISTORICAL_OPENING';
  const immutable = String(context?.period?.status || '') === 'SUBMITTED';
  const priorSettlementReady = context?.previousPeriod
    ? Boolean(context?.priorPeriodSettlement?.readyForPp30Preparation)
    : true;

  const load = async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getVatCarryForwardAuthority({ branchId, taxPeriodId });
      setContext(data);
      const initialAmount = data?.authority?.amount ?? data?.suggestedAmount ?? 0;
      setAmount(Number(initialAmount).toFixed(2));
      setNote(data?.authority?.note || '');
    } catch (requestError) {
      const message = getVatSettlementErrorMessage(requestError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [branchId, taxPeriodId]);

  const sourceLabel = useMemo(() => {
    if (context?.previousPeriod) {
      return `รอบก่อนหน้า ${context.previousPeriod.periodCode} · ${context.previousPeriod.status}`;
    }
    return 'ยอดเปิดระบบ (ไม่มีรอบภาษีก่อนหน้าในระบบ)';
  }, [context]);

  const confirm = async () => {
    setSaving(true);
    setError('');
    try {
      await confirmVatCarryForwardAuthority({
        branchId,
        taxPeriodId,
        sourceType,
        amount,
        note,
      });
      toast.success('ยืนยันเครดิต VAT ยกมาแล้ว');
      await load();
      await onConfirmed?.();
    } catch (requestError) {
      const message = getVatSettlementErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-900"><BadgeCheck size={18} /><h2 className="font-black">เครดิต VAT ยกมา</h2></div>
          <p className="mt-1 text-xs text-indigo-700">Authority สำหรับยอดภาษีชำระไว้เกินยกมาที่ใช้ในขั้นเตรียม ภ.พ.30</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-800 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> รีเฟรช Authority
        </button>
      </div>

      {error && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-indigo-100 bg-white p-3"><p className="text-xs text-slate-500">แหล่งที่มา</p><p className="mt-1 text-sm font-black text-slate-900">{sourceLabel}</p></div>
        <div className="rounded-xl border border-indigo-100 bg-white p-3"><p className="text-xs text-slate-500">เครดิตคงเหลือจากรอบก่อน</p><p className="mt-1 text-xl font-black text-indigo-950">{context?.suggestedAmount == null ? 'รอรอบก่อนพร้อม' : `฿${money(context.suggestedAmount)}`}</p></div>
        <div className="rounded-xl border border-indigo-100 bg-white p-3"><p className="text-xs text-slate-500">สถานะ Authority</p><p className="mt-1 text-sm font-black text-slate-900">{context?.authority?.status || 'ยังไม่ยืนยัน'}</p></div>
        <div className="rounded-xl border border-indigo-100 bg-white p-3"><p className="text-xs text-slate-500">ยอดที่ยืนยันล่าสุด</p><p className="mt-1 text-xl font-black text-indigo-950">฿{money(context?.authority?.amount)}</p></div>
        <div className="rounded-xl border border-indigo-100 bg-white p-3"><p className="text-xs text-slate-500">Version</p><p className="mt-1 text-sm font-black text-slate-900">v{context?.authority?.version || '-'}</p></div>
      </div>

      {context?.previousPeriod && !priorSettlementReady && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          รอบก่อนหน้ายังไม่พร้อมสำหรับ ภ.พ.30 จึงยังยืนยันยอดเครดิตยกมาไม่ได้
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-[220px_1fr_auto] lg:items-end">
        <label className="text-sm font-bold text-slate-700">
          ยอดเครดิตยกมา
          <input
            type="number"
            min="0"
            max={context?.suggestedAmount ?? undefined}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={immutable || saving || !priorSettlementReady}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-right font-black outline-none focus:border-indigo-400 disabled:bg-slate-100"
          />
        </label>
        <label className="text-sm font-bold text-slate-700">
          หมายเหตุ / หลักฐานอ้างอิง
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={immutable || saving || !priorSettlementReady}
            placeholder="เช่น ยอดตาม ภ.พ.30 เดือนก่อน / ส่วนที่เลือกยกมาแทนการขอคืน"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-400 disabled:bg-slate-100"
          />
        </label>
        <button type="button" onClick={confirm} disabled={immutable || saving || loading || !priorSettlementReady} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">
          <Save size={16} /> {saving ? 'กำลังยืนยัน...' : 'ยืนยันเครดิตยกมา'}
        </button>
      </div>

      {immutable && <p className="mt-3 text-xs font-semibold text-amber-700">รอบนี้ยื่นแล้ว จึงแก้ Carry-forward Authority ไม่ได้</p>}
    </section>
  );
};

export default VatCarryForwardAuthorityPanel;
