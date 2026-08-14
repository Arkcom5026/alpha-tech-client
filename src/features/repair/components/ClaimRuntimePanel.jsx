import React, { useEffect, useMemo, useState } from 'react';
import repairApi from '../api/repairApi';
import { CLAIM_LABELS, CLAIM_TRANSITIONS, formatDateTime, formatMoney } from '../utils/repairRuntime';

const ACTION_COPY = {
  SUBMITTED: ['ส่งเคลม', 'ยืนยันว่าจัดเตรียมข้อมูลและส่งเรื่องให้ผู้จำหน่าย/ศูนย์แล้ว'],
  IN_TRANSIT: ['อยู่ระหว่างขนส่ง', 'บันทึกเมื่อสินค้าออกจากร้านและอยู่ระหว่างจัดส่งไปศูนย์'],
  RECEIVED_BY_PROVIDER: ['ศูนย์รับสินค้าแล้ว', 'ยืนยันว่าผู้จำหน่ายหรือศูนย์บริการรับสินค้าแล้ว'],
  INSPECTING: ['ศูนย์กำลังตรวจสอบ', 'บันทึกเมื่อศูนย์เริ่มตรวจและประเมินอาการ'],
  APPROVED: ['ศูนย์อนุมัติเคลม', 'บันทึกว่าศูนย์ยอมรับเงื่อนไขการเคลมแล้ว'],
  REJECTED: ['ศูนย์ปฏิเสธเคลม', 'ใช้เมื่อศูนย์ไม่รับเคลม พร้อมบันทึกเหตุผลให้ชัดเจน'],
  REPAIRING: ['ศูนย์กำลังซ่อม', 'ใช้เมื่อผลอนุมัติคือซ่อมสินค้าชิ้นเดิม'],
  REPLACEMENT_PENDING: ['รอสินค้าทดแทน', 'ใช้เมื่อศูนย์อนุมัติเปลี่ยนสินค้าและกำลังรอของใหม่'],
  CREDIT_PENDING: ['รอเครดิต', 'ใช้เมื่อศูนย์อนุมัติคืนเครดิตและกำลังรอเอกสาร/ยอดเครดิต'],
  RESOLVED: ['ปิดผลการเคลม', 'บันทึกผลสุดท้ายและปิดรายการเคลม'],
  CANCELLED: ['ยกเลิกรายการเคลม', 'ใช้เฉพาะเมื่อยุติกระบวนการเคลมและต้องระบุเหตุผล'],
};

const RESOLUTION_OPTIONS = [
  ['REPAIRED', 'ซ่อมคืน'], ['REPLACED', 'เปลี่ยนสินค้าใหม่'], ['CREDITED', 'รับเครดิต'],
  ['REFUNDED', 'คืนเงิน'], ['RETURNED_UNCHANGED', 'ส่งคืนโดยไม่แก้ไข'], ['REJECTED', 'ปฏิเสธ'], ['WRITTEN_OFF', 'ตัดจำหน่าย'],
];

const ClaimRuntimePanel = ({ claim, submitting, onTransition, onOpenRepair }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [draft, setDraft] = useState({
    note: '', serviceProvider: claim.serviceProvider || '', externalClaimRef: claim.externalClaimRef || '',
    trackingNumber: claim.trackingNumber || '', resolution: '', resolutionNote: '', replacementStockItemId: '', creditAmount: '',
  });
  const [replacementQuery, setReplacementQuery] = useState('');
  const [replacementState, setReplacementState] = useState({ loading: false, error: '', options: [] });

  const nextStatuses = useMemo(() => CLAIM_TRANSITIONS[claim.status] || [], [claim.status]);
  const requiresReason = ['REJECTED', 'CANCELLED'].includes(selectedAction);
  const resolving = selectedAction === 'RESOLVED';
  const resolutionRequiresReplacement = draft.resolution === 'REPLACED';
  const resolutionRequiresCredit = draft.resolution === 'CREDITED';

  useEffect(() => {
    if (!resolving || !resolutionRequiresReplacement) return;
    let active = true;
    const timer = setTimeout(async () => {
      setReplacementState((v) => ({ ...v, loading: true, error: '' }));
      try {
        const result = await repairApi.getReplacementOptions(claim.id, replacementQuery);
        if (active) setReplacementState({ loading: false, error: '', options: result?.options || [] });
      } catch (error) {
        if (active) setReplacementState({ loading: false, error: error.message, options: [] });
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [claim.id, resolving, resolutionRequiresReplacement, replacementQuery]);

  const canSubmit = Boolean(
    selectedAction && (!requiresReason || draft.note.trim()) && (!resolving || draft.resolution) &&
    (!resolutionRequiresReplacement || Number(draft.replacementStockItemId) > 0) &&
    (!resolutionRequiresCredit || Number(draft.creditAmount) >= 0)
  );

  const submit = () => onTransition({
    status: selectedAction,
    expectedStatus: claim.status,
    note: draft.note.trim() || null,
    serviceProvider: draft.serviceProvider.trim() || null,
    externalClaimRef: draft.externalClaimRef.trim() || null,
    trackingNumber: draft.trackingNumber.trim() || null,
    resolution: resolving ? draft.resolution || null : null,
    resolutionNote: resolving ? draft.resolutionNote.trim() || null : null,
    replacementStockItemId: resolutionRequiresReplacement ? Number(draft.replacementStockItemId) : null,
    creditAmount: resolutionRequiresCredit ? Number(draft.creditAmount) : null,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Claim Runtime</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{claim.claimNo}</h2>
            <p className="mt-1 text-sm text-slate-500">{claim.claimAsset?.displayName || 'ไม่พบข้อมูลอุปกรณ์'}</p>
          </div>
          <span className="w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">{CLAIM_LABELS[claim.status] || claim.status}</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="ผู้จำหน่าย" value={claim.supplier?.name} /><Info label="ศูนย์บริการ" value={claim.serviceProvider} />
          <Info label="Tracking" value={claim.trackingNumber} /><Info label="เลขอ้างอิง" value={claim.externalClaimRef} />
          <Info label="Serial" value={claim.claimAsset?.serialNumber} /><Info label="เปิดเมื่อ" value={formatDateTime(claim.openedAt)} />
          <Info label="ศูนย์รับเมื่อ" value={formatDateTime(claim.providerReceivedAt)} /><Info label="ปิดเมื่อ" value={formatDateTime(claim.resolvedAt)} />
          <Info label="เครดิต" value={formatMoney(claim.creditAmount)} />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4"><p className="text-xs font-black text-slate-500">เหตุผลในการเคลม</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{claim.reason}</p></div>
        {claim.repairJob?.id ? <button type="button" onClick={() => onOpenRepair(claim.repairJob.id)} className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">เปิดใบงานซ่อม {claim.repairJob.jobNo}</button> : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Next Action</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">ดำเนินการขั้นถัดไป</h3>
          {nextStatuses.length ? <>
            <div className="mt-4 grid gap-3">{nextStatuses.map((status) => {
              const [title, description] = ACTION_COPY[status] || [CLAIM_LABELS[status] || status, 'ดำเนินการสถานะถัดไป'];
              return <button key={status} type="button" onClick={() => setSelectedAction(status)} className={`rounded-xl border p-4 text-left ${selectedAction === status ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></button>;
            })}</div>
            {selectedAction ? <div className="mt-5 rounded-2xl border border-indigo-100 bg-slate-50 p-4">
              <h4 className="font-black text-slate-950">รายละเอียดก่อนยืนยัน</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input value={draft.serviceProvider} onChange={(e) => setDraft((v) => ({ ...v, serviceProvider: e.target.value }))} placeholder="ศูนย์บริการ" className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
                <input value={draft.externalClaimRef} onChange={(e) => setDraft((v) => ({ ...v, externalClaimRef: e.target.value }))} placeholder="เลขอ้างอิงจากศูนย์" className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
                <input value={draft.trackingNumber} onChange={(e) => setDraft((v) => ({ ...v, trackingNumber: e.target.value }))} placeholder="Tracking number" className="rounded-xl border border-slate-300 bg-white px-4 py-3 sm:col-span-2" />
              </div>
              {resolving ? <div className="mt-3 space-y-3">
                <select value={draft.resolution} onChange={(e) => setDraft((v) => ({ ...v, resolution: e.target.value, replacementStockItemId: '' }))} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="">เลือกผลการเคลม</option>{RESOLUTION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                {resolutionRequiresReplacement ? <div className="rounded-xl border border-indigo-200 bg-white p-3">
                  <p className="text-sm font-black text-slate-900">เลือกสินค้าทดแทนจากสต๊อกสาขา</p>
                  <input value={replacementQuery} onChange={(e) => setReplacementQuery(e.target.value)} placeholder="ค้นหาชื่อสินค้า / Barcode / Serial" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                  {replacementState.loading ? <p className="mt-2 text-sm text-slate-500">กำลังค้นหา...</p> : null}
                  {replacementState.error ? <p className="mt-2 text-sm font-bold text-red-600">{replacementState.error}</p> : null}
                  <div className="mt-2 max-h-56 space-y-2 overflow-auto">{replacementState.options.map((item) => <button key={item.id} type="button" onClick={() => setDraft((v) => ({ ...v, replacementStockItemId: String(item.id) }))} className={`w-full rounded-xl border p-3 text-left ${String(item.id) === draft.replacementStockItemId ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}><p className="font-black text-slate-900">{item.productName || `Stock #${item.id}`}{item.preferredMatch ? ' · รุ่นเดียวกับของเดิม' : ''}</p><p className="mt-1 text-xs text-slate-500">Barcode {item.barcode || '-'} · Serial {item.serialNumber || '-'}</p></button>)}</div>
                </div> : null}
                {resolutionRequiresCredit ? <input value={draft.creditAmount} onChange={(e) => setDraft((v) => ({ ...v, creditAmount: e.target.value }))} type="number" min="0" placeholder="ยอดเครดิต" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /> : null}
                <textarea rows={2} value={draft.resolutionNote} onChange={(e) => setDraft((v) => ({ ...v, resolutionNote: e.target.value }))} placeholder="รายละเอียดผลการเคลม" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
              </div> : null}
              <textarea rows={3} value={draft.note} onChange={(e) => setDraft((v) => ({ ...v, note: e.target.value }))} placeholder={requiresReason ? 'ระบุเหตุผล (จำเป็น)' : 'หมายเหตุการดำเนินการ'} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
              <button type="button" disabled={submitting || !canSubmit} onClick={submit} className="mt-3 w-full rounded-xl bg-indigo-700 px-5 py-3 font-black text-white disabled:opacity-40">{submitting ? 'กำลังบันทึก...' : `ยืนยัน: ${ACTION_COPY[selectedAction]?.[0] || CLAIM_LABELS[selectedAction]}`}</button>
            </div> : null}
          </> : <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">รายการนี้อยู่ในสถานะปลายทางแล้ว</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Timeline</p><h3 className="mt-1 text-lg font-black text-slate-950">ประวัติการเคลม</h3>
          <div className="mt-4 space-y-4">{(claim.events || []).length ? claim.events.map((event) => <div key={event.id} className="relative border-l-2 border-indigo-200 pl-4"><span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-indigo-600" /><p className="font-black text-slate-900">{CLAIM_LABELS[event.status] || event.status}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(event.occurredAt)}{event.performedByName ? ` · ${event.performedByName}` : ''}</p>{event.note ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{event.note}</p> : null}</div>) : <p className="text-sm text-slate-500">ยังไม่มีเหตุการณ์</p>}</div>
        </section>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-black text-slate-500">{label}</p><p className="mt-1 font-black text-slate-900">{value ?? '-'}</p></div>;

export default ClaimRuntimePanel;
