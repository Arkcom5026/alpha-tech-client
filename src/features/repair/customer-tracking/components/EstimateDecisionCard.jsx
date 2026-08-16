import React, { useState } from 'react';
import { decidePublicRepairEstimate } from '../api/repairTrackingPublicApi';
import { ConfirmActionDialog, InlineFeedback, feedback } from '@/design-system';

const money = (value) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const EstimateDecisionCard = ({ token, approval, onChanged }) => {
  const [confirmedByName, setConfirmedByName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [state, setState] = useState({ loading: false, error: '' });
  const [pendingDecision, setPendingDecision] = useState(null);

  if (!approval) return null;

  const decide = async (decision) => {
    if (state.loading || !decision) return;
    if (!confirmedByName.trim()) {
      setState({ loading: false, error: 'กรุณาระบุชื่อผู้ยืนยัน' });
      return;
    }
    setState({ loading: true, error: '' });
    try {
      const updated = await decidePublicRepairEstimate(token, {
        approvalId: approval.id,
        decision,
        confirmedByName: confirmedByName.trim(),
        customerNote: customerNote.trim() || null,
      });
      onChanged(updated);
      setPendingDecision(null);
      setState({ loading: false, error: '' });
      feedback.actionSuccess(
        decision === 'APPROVED' ? 'อนุมัติราคาประเมินเรียบร้อยแล้ว' : 'ส่งผลไม่อนุมัติราคาประเมินเรียบร้อยแล้ว',
        `repair-estimate:${approval.id}:${decision.toLowerCase()}:success`,
      );
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'บันทึกผลการพิจารณาราคาประเมินไม่สำเร็จ';
      setState({ loading: false, error: message });
      feedback.actionError(
        error,
        message,
        `repair-estimate:${approval.id}:${String(decision).toLowerCase()}:error`,
      );
    }
  };

  if (approval.status !== 'PENDING') {
    const approved = approval.status === 'APPROVED';
    return (
      <section className={`rounded-3xl border p-5 ${approved ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
          Estimate Decision
        </p>
        <h2 className={`mt-2 text-lg font-black ${approved ? 'text-emerald-800' : 'text-slate-900'}`}>
          {approved ? '✓ อนุมัติราคาประเมินแล้ว' : approval.status === 'REJECTED' ? 'ไม่อนุมัติราคาประเมิน' : 'คำขอราคานี้ไม่เปิดรับคำตอบแล้ว'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          ราคา {money(approval.estimateAmount)}
          {approval.confirmedByName ? ` · ยืนยันโดย ${approval.confirmedByName}` : ''}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-700">
        Action Required
      </p>
      <h2 className="mt-2 text-xl font-black text-slate-950">กรุณาพิจารณาราคาประเมิน</h2>
      <div className="mt-4 rounded-2xl bg-white p-4">
        <Row label="ราคาประเมิน" value={money(approval.estimateAmount)} />
        <Row label="มัดจำแล้ว" value={money(approval.depositAmount)} />
        <Row label="ยอดคงเหลือโดยประมาณ" value={money(approval.balanceAmount)} strong />
      </div>
      {approval.requestNote ? (
        <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm leading-6 text-slate-700">
          {approval.requestNote}
        </p>
      ) : null}
      <label className="mt-4 block space-y-1">
        <span className="text-xs font-black text-slate-600">ชื่อผู้ยืนยัน *</span>
        <input
          value={confirmedByName}
          onChange={(event) => setConfirmedByName(event.target.value)}
          disabled={state.loading}
          className="min-h-12 w-full rounded-xl border border-amber-200 bg-white px-4 disabled:opacity-60"
          placeholder="พิมพ์ชื่อผู้อนุมัติหรือผู้ส่งซ่อม"
        />
      </label>
      <label className="mt-3 block space-y-1">
        <span className="text-xs font-black text-slate-600">หมายเหตุถึงร้าน</span>
        <textarea
          rows={2}
          value={customerNote}
          onChange={(event) => setCustomerNote(event.target.value)}
          disabled={state.loading}
          className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 disabled:opacity-60"
          placeholder="ไม่บังคับ"
        />
      </label>
      {state.error ? (
        <InlineFeedback variant="error" description={state.error} className="mt-3" />
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={state.loading}
          onClick={() => setPendingDecision('REJECTED')}
          className="min-h-12 rounded-xl border border-red-200 bg-white font-black text-red-700 disabled:opacity-50"
        >
          ไม่อนุมัติ
        </button>
        <button
          type="button"
          disabled={state.loading}
          onClick={() => setPendingDecision('APPROVED')}
          className="min-h-12 rounded-xl bg-emerald-700 font-black text-white disabled:opacity-50"
        >
          {state.loading ? 'กำลังบันทึก' : 'อนุมัติราคา'}
        </button>
      </div>
      <ConfirmActionDialog
        open={Boolean(pendingDecision)}
        title={pendingDecision === 'APPROVED' ? 'ยืนยันอนุมัติราคาประเมิน' : 'ยืนยันไม่อนุมัติราคาประเมิน'}
        description={pendingDecision === 'APPROVED' ? `ราคาประเมิน ${money(approval.estimateAmount)}` : 'ร้านจะได้รับผลการพิจารณานี้ทันที'}
        confirmLabel={pendingDecision === 'APPROVED' ? 'ยืนยันอนุมัติ' : 'ยืนยันไม่อนุมัติ'}
        intent={pendingDecision === 'APPROVED' ? 'primary' : 'destructive'}
        loading={state.loading}
        onConfirm={() => decide(pendingDecision)}
        onClose={() => {
          if (!state.loading) setPendingDecision(null);
        }}
      />
    </section>
  );
};

const Row = ({ label, value, strong = false }) => (
  <div className={`flex items-center justify-between gap-3 py-2 ${strong ? 'mt-1 border-t border-slate-200 pt-3 font-black' : ''}`}>
    <span className="text-sm text-slate-600">{label}</span>
    <span className={strong ? 'text-emerald-700' : 'font-bold text-slate-950'}>{value}</span>
  </div>
);

export default EstimateDecisionCard;
