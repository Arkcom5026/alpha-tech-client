import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { feedback } from '@/design-system/feedback';
import {
  confirmTaxExpenseAssessment,
  getTaxExpenseAssessmentSuggestion,
} from '../api/taxExpenseApi';

const VAT_OPTIONS = ['PENDING_REVIEW', 'CREDITABLE', 'NON_CREDITABLE', 'OUT_OF_SCOPE'];
const CIT_OPTIONS = ['PENDING_REVIEW', 'DEDUCTIBLE', 'NON_DEDUCTIBLE', 'PARTIALLY_DEDUCTIBLE'];

const confidenceClass = (value) => value === 'HIGH'
  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
  : value === 'MEDIUM'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

const TaxExpenseAssessmentPanel = ({ expenseId, onClose, onConfirmed }) => {
  const [data, setData] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!expenseId) return;
    setLoading(true);
    try {
      const response = await getTaxExpenseAssessmentSuggestion(expenseId);
      setData(response);
      const next = {};
      (response?.suggestion?.items || []).forEach((item) => {
        next[item.taxExpenseItemId] = {
          vatTreatment: item.suggestions?.vat?.treatment || item.current?.vatTreatment || 'PENDING_REVIEW',
          citTreatment: item.suggestions?.cit?.treatment || item.current?.citTreatment || 'PENDING_REVIEW',
        };
      });
      setDecisions(next);
      setNote(response?.latestAssessment?.assessmentNote || '');
    } catch (error) {
      feedback.error(error?.response?.data?.message || 'ไม่สามารถโหลดคำแนะนำการประเมินภาษีได้');
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useEffect(() => { load(); }, [load]);

  const items = useMemo(() => data?.suggestion?.items || [], [data]);
  const complete = useMemo(() => items.length > 0 && items.every((item) => {
    const decision = decisions[item.taxExpenseItemId];
    return decision?.vatTreatment && decision?.citTreatment;
  }), [decisions, items]);

  const updateDecision = (itemId, field, value) => {
    if (loading || saving) return;
    setDecisions((current) => ({
      ...current,
      [itemId]: { ...current[itemId], [field]: value },
    }));
  };

  const confirm = async () => {
    if (!complete || saving || loading) return;
    setSaving(true);
    try {
      const payload = {
        decisions: items.map((item) => ({
          taxExpenseItemId: item.taxExpenseItemId,
          vatTreatment: decisions[item.taxExpenseItemId].vatTreatment,
          citTreatment: decisions[item.taxExpenseItemId].citTreatment,
        })),
        note,
      };
      await confirmTaxExpenseAssessment(expenseId, payload);
      feedback.actionSuccess('ยืนยันผลการประเมินภาษีแล้ว', `tax-expense:assessment:${expenseId}:success`);
      await load();
      onConfirmed?.();
    } catch (error) {
      feedback.actionError(error, 'ไม่สามารถยืนยันผลการประเมินภาษีได้', `tax-expense:assessment:${expenseId}:error`);
    } finally {
      setSaving(false);
    }
  };

  const closePanel = () => {
    if (!saving) onClose?.();
  };

  if (!expenseId) return null;

  return (
    <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-blue-700"><ShieldCheck size={18} /><h2 className="font-black">Rule-assisted Tax Assessment</h2></div>
          <p className="mt-1 text-xs text-slate-500">ระบบเสนอแนวทางเท่านั้น ผู้ใช้ต้องตรวจและยืนยันเองก่อนเปลี่ยน VAT/CIT treatment</p>
          <p className="mt-1 text-xs font-semibold text-amber-700">WHT ไม่ถูกแก้จากหน้านี้ และยังต้องยืนยันผ่าน WHT Workflow เพื่อรักษา audit trail</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={loading || saving} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />รีเฟรช</button>
          <button type="button" onClick={closePanel} disabled={saving} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50">ปิด</button>
        </div>
      </div>

      {loading ? <div className="py-10 text-center text-sm text-slate-500">กำลังสร้างคำแนะนำ...</div> : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.taxExpenseItemId} className="rounded-xl border border-slate-200 p-3">
              <div className="font-black text-slate-900">#{item.lineNumber} {item.description}</div>
              <div className="mt-1 text-xs text-slate-500">หมวด {item.category?.code || '-'} · {item.category?.name || '-'}</div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black">VAT suggestion</span><span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${confidenceClass(item.suggestions?.vat?.confidence)}`}>{item.suggestions?.vat?.confidence || '-'}</span></div>
                  <p className="mt-1 text-xs text-slate-600">{item.suggestions?.vat?.reason}</p>
                  <select value={decisions[item.taxExpenseItemId]?.vatTreatment || ''} onChange={(event) => updateDecision(item.taxExpenseItemId, 'vatTreatment', event.target.value)} disabled={loading || saving} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:bg-slate-100">
                    {VAT_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black">CIT suggestion</span><span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${confidenceClass(item.suggestions?.cit?.confidence)}`}>{item.suggestions?.cit?.confidence || '-'}</span></div>
                  <p className="mt-1 text-xs text-slate-600">{item.suggestions?.cit?.reason}</p>
                  <select value={decisions[item.taxExpenseItemId]?.citTreatment || ''} onChange={(event) => updateDecision(item.taxExpenseItemId, 'citTreatment', event.target.value)} disabled={loading || saving} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:bg-slate-100">
                    {CIT_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800"><span className="font-black">WHT:</span> {item.suggestions?.wht?.reason}</div>
            </div>
          ))}
          {!items.length && <div className="py-8 text-center text-sm text-slate-400">ไม่พบรายการสำหรับประเมิน</div>}
          <textarea value={note} onChange={(event) => setNote(event.target.value)} disabled={loading || saving} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100" placeholder="หมายเหตุการประเมิน (ถ้ามี)" />
          <button type="button" disabled={!complete || saving || loading} onClick={confirm} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-40"><CheckCircle2 size={16} />{saving ? 'กำลังยืนยัน...' : 'ยืนยันผลการประเมิน'}</button>
          {data?.latestAssessment && <p className="text-xs font-semibold text-emerald-700">ยืนยันล่าสุด v{data.latestAssessment.version} · {data.latestAssessment.status}</p>}
        </div>
      )}
    </section>
  );
};

export default TaxExpenseAssessmentPanel;