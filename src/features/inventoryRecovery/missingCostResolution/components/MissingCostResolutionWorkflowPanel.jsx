import React, { useMemo, useState } from 'react';
import { CheckCircle2, FilePlus2, RotateCcw, Send, ShieldCheck, XCircle } from 'lucide-react';
import { feedback } from '@/design-system';
import {
  useAppendMissingCostEvidence,
  useTransitionMissingCostResolution,
} from '../hooks/useMissingCostResolutionWorkflow';

const SOURCE_TYPES = [
  ['SUPPLIER_DOCUMENT', 'เอกสารจากผู้ขาย'],
  ['LEGACY_INVOICE', 'ใบกำกับ/ใบซื้อเดิม'],
  ['PURCHASE_RECORD', 'ประวัติการจัดซื้อ'],
  ['HISTORICAL_COST_REFERENCE', 'ต้นทุนอ้างอิงย้อนหลัง'],
  ['MANUAL_BUSINESS_DECISION', 'มติทางธุรกิจ'],
];

const CONFIDENCE_LEVELS = [
  ['HIGH', 'สูง'],
  ['MEDIUM', 'ปานกลาง'],
  ['LOW', 'ต่ำ'],
];

const ACTIONS = {
  DRAFT: [
    { toStatus: 'SUBMITTED', label: 'ส่งตรวจ', icon: Send, tone: 'blue', reasonCode: 'SUBMITTED_FOR_REVIEW' },
    { toStatus: 'CANCELLED', label: 'ยกเลิกรายการ', icon: XCircle, tone: 'slate', reasonCode: 'CANCELLED_BY_OPERATOR' },
  ],
  RETURNED_FOR_CORRECTION: [
    { toStatus: 'SUBMITTED', label: 'ส่งตรวจอีกครั้ง', icon: Send, tone: 'blue', reasonCode: 'RESUBMITTED_AFTER_CORRECTION' },
    { toStatus: 'CANCELLED', label: 'ยกเลิกรายการ', icon: XCircle, tone: 'slate', reasonCode: 'CANCELLED_BY_OPERATOR' },
  ],
  SUBMITTED: [
    { toStatus: 'APPROVED', label: 'อนุมัติ', icon: ShieldCheck, tone: 'emerald', reasonCode: 'APPROVED_COST_EVIDENCE' },
    { toStatus: 'RETURNED_FOR_CORRECTION', label: 'ส่งกลับแก้ไข', icon: RotateCcw, tone: 'amber', reasonCode: 'RETURNED_FOR_CORRECTION' },
    { toStatus: 'REJECTED', label: 'ปฏิเสธ', icon: XCircle, tone: 'red', reasonCode: 'REJECTED_COST_EVIDENCE' },
  ],
};

const toneClass = {
  blue: 'bg-blue-600 hover:bg-blue-700 text-white',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  amber: 'bg-amber-500 hover:bg-amber-600 text-white',
  red: 'bg-red-600 hover:bg-red-700 text-white',
  slate: 'bg-slate-700 hover:bg-slate-800 text-white',
};

const getErrorMessage = (error) => error?.friendlyMessage
  || error?.response?.data?.message
  || error?.message
  || 'ไม่สามารถดำเนินการได้';

const MissingCostResolutionWorkflowPanel = ({ detail }) => {
  const resolution = detail?.resolution;
  const candidate = detail?.candidate;
  const resolutionId = resolution?.id;
  const evidenceMutation = useAppendMissingCostEvidence(resolutionId);
  const transitionMutation = useTransitionMissingCostResolution(resolutionId);
  const [note, setNote] = useState('');
  const [form, setForm] = useState({
    sourceType: 'SUPPLIER_DOCUMENT',
    sourceReference: '',
    evidenceSummary: '',
    proposedUnitCost: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    confidence: 'HIGH',
    rationale: '',
  });

  const latestEvidence = useMemo(
    () => [...(resolution?.evidenceVersions || [])].sort((a, b) => Number(b.version) - Number(a.version))[0],
    [resolution?.evidenceVersions]
  );
  const canEditEvidence = ['DRAFT', 'RETURNED_FOR_CORRECTION'].includes(resolution?.status);
  const actions = ACTIONS[resolution?.status] || [];
  const busy = evidenceMutation.isPending || transitionMutation.isPending;

  const updateField = (field) => (event) => setForm((current) => ({
    ...current,
    [field]: event.target.value,
  }));

  const submitEvidence = async (event) => {
    event.preventDefault();
    try {
      await evidenceMutation.mutateAsync({
        expectedStatus: resolution.status,
        expectedVersion: resolution.currentVersion,
        expectedSnapshotHash: candidate.sourceSnapshotHash,
        stockBalanceId: candidate.stockBalanceId,
        productId: candidate.productId,
        sourceType: form.sourceType,
        sourceReference: form.sourceReference.trim(),
        evidenceSummary: form.evidenceSummary.trim(),
        proposedUnitCost: Number(form.proposedUnitCost),
        effectiveDate: form.effectiveDate,
        confidence: form.confidence,
        rationale: form.rationale.trim(),
      });
      feedback.success('บันทึกหลักฐานต้นทุนแล้ว');
      setForm((current) => ({ ...current, sourceReference: '', evidenceSummary: '', proposedUnitCost: '', rationale: '' }));
    } catch (error) {
      feedback.error(getErrorMessage(error));
    }
  };

  const transition = async (action) => {
    if (!latestEvidence?.evidenceHash && action.toStatus !== 'CANCELLED') {
      feedback.warning('ต้องมีหลักฐานต้นทุนก่อนเปลี่ยนสถานะ');
      return;
    }
    try {
      await transitionMutation.mutateAsync({
        expectedStatus: resolution.status,
        expectedVersion: resolution.currentVersion,
        expectedSnapshotHash: candidate.sourceSnapshotHash,
        expectedEvidenceHash: latestEvidence?.evidenceHash,
        candidateId: resolution.candidateId,
        proposalId: `resolution:${resolution.id}:v${resolution.currentVersion}`,
        toStatus: action.toStatus,
        reasonCode: action.reasonCode,
        note: note.trim() || null,
      });
      feedback.success(`${action.label}สำเร็จ`);
      setNote('');
    } catch (error) {
      feedback.error(getErrorMessage(error));
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-black text-slate-900">จัดการหลักฐานและการอนุมัติ</h2>
      </div>

      {canEditEvidence && (
        <form onSubmit={submitEvidence} className="space-y-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 font-black text-slate-800"><FilePlus2 className="h-4 w-4" />เพิ่มหลักฐานเวอร์ชันใหม่</div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">ประเภทหลักฐาน
              <select value={form.sourceType} onChange={updateField('sourceType')} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                {SOURCE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">เลขที่/แหล่งอ้างอิง
              <input required value={form.sourceReference} onChange={updateField('sourceReference')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-bold text-slate-700">ต้นทุนต่อหน่วยที่เสนอ
              <input required min="0.01" step="0.01" type="number" value={form.proposedUnitCost} onChange={updateField('proposedUnitCost')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-bold text-slate-700">วันที่ต้นทุนมีผล
              <input required type="date" value={form.effectiveDate} onChange={updateField('effectiveDate')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-bold text-slate-700">ความมั่นใจ
              <select value={form.confidence} onChange={updateField('confidence')} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                {CONFIDENCE_LEVELS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">สรุปหลักฐาน
              <textarea required rows="2" value={form.evidenceSummary} onChange={updateField('evidenceSummary')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">เหตุผลประกอบ
              <textarea required rows="2" value={form.rationale} onChange={updateField('rationale')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
          </div>
          <button disabled={busy} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">บันทึกหลักฐาน</button>
        </form>
      )}

      {actions.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <label className="block text-sm font-bold text-slate-700">หมายเหตุประกอบการดำเนินการ
            <textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.toStatus} type="button" disabled={busy} onClick={() => transition(action)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black disabled:opacity-50 ${toneClass[action.tone]}`}>
                  <Icon className="h-4 w-4" />{action.label}
                </button>
              );
            })}
          </div>
          {resolution?.status === 'SUBMITTED' && <p className="text-xs text-slate-500">Backend จะตรวจผู้อนุมัติแยกจากผู้เสนอและปฏิเสธ optimistic authority ที่ล้าสมัย</p>}
        </div>
      )}

      {!canEditEvidence && actions.length === 0 && (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">สถานะนี้ไม่มีการแก้ไขหลักฐานหรือเปลี่ยนสถานะเพิ่มเติมจากหน้า Workflow</p>
      )}
    </section>
  );
};

export default MissingCostResolutionWorkflowPanel;
