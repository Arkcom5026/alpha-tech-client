import React, { useMemo, useState } from 'react';

const STATUS_LABELS = {
  RECEIVED: 'รับงานแล้ว',
  WAITING_DIAGNOSIS: 'รอตรวจวินิจฉัย',
  DIAGNOSING: 'กำลังตรวจวินิจฉัย',
  WAITING_APPROVAL: 'รอลูกค้าอนุมัติ',
  APPROVED: 'ลูกค้าอนุมัติแล้ว',
  REJECTED: 'ลูกค้าไม่อนุมัติ',
  REPAIRING: 'กำลังซ่อม',
  WAITING_PARTS: 'รออะไหล่',
  WAITING_QC: 'รอตรวจ QC',
  QC_FAILED: 'QC ไม่ผ่าน',
  READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  DELIVERED: 'ส่งมอบแล้ว',
  CLOSED: 'ปิดงานแล้ว',
  CANCELLED: 'ยกเลิกแล้ว',
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const RepairWorkflowOverview = ({ job, submitting, onWorkflowAction }) => {
  const workflow = job?.workflow || {};
  const status = workflow.status || 'RECEIVED';
  const history = workflow.history || [];
  const actionNames = useMemo(
    () => new Set((workflow.availableActions || []).map((item) => item.action)),
    [workflow.availableActions]
  );
  const [cancelReason, setCancelReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  const run = (action, note) =>
    onWorkflowAction({
      action,
      expectedWorkflowStatus: status,
      note: note.trim(),
    });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Current Workflow</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-slate-950">{STATUS_LABELS[status] || status}</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{status}</span>
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-black text-blue-700">สิ่งที่ควรทำถัดไป</p>
            <p className="mt-1 text-sm font-bold text-blue-950">
              {workflow.nextAction || 'ตรวจสอบสถานะงานก่อนดำเนินการต่อ'}
            </p>
          </div>

          {status === 'REJECTED' && actionNames.has('REOPEN_AFTER_REJECTION') ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-black text-amber-950">ลูกค้าไม่อนุมัติราคา</p>
              <p className="mt-1 text-sm text-amber-800">หากต้องการเสนอทางเลือกใหม่ ให้ระบุเหตุผลแล้วกลับไปวินิจฉัย/ปรับราคาอีกครั้ง</p>
              <textarea
                rows={3}
                value={reopenReason}
                onChange={(event) => setReopenReason(event.target.value)}
                placeholder="เช่น ปรับแนวทางซ่อมเป็นเปลี่ยนเฉพาะชิ้นส่วนที่เสีย"
                className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-4 py-3"
              />
              <button
                type="button"
                disabled={submitting || !reopenReason.trim()}
                onClick={() => run('REOPEN_AFTER_REJECTION', reopenReason)}
                className="mt-3 rounded-xl bg-amber-600 px-5 py-3 font-black text-white disabled:opacity-40"
              >
                กลับไปวินิจฉัยและเสนอราคาใหม่
              </button>
            </div>
          ) : null}

          {actionNames.has('CANCEL') ? (
            <details className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <summary className="cursor-pointer font-black text-red-800">ยกเลิกใบงาน</summary>
              <p className="mt-2 text-sm text-red-700">การยกเลิกต้องมีเหตุผลเพื่อเก็บไว้ในประวัติงาน</p>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="ระบุเหตุผลการยกเลิก"
                className="mt-3 w-full rounded-xl border border-red-200 bg-white px-4 py-3"
              />
              <button
                type="button"
                disabled={submitting || !cancelReason.trim()}
                onClick={() => {
                  if (window.confirm('ยืนยันยกเลิกใบงานนี้?')) run('CANCEL', cancelReason);
                }}
                className="mt-3 rounded-xl bg-red-700 px-5 py-3 font-black text-white disabled:opacity-40"
              >
                ยืนยันยกเลิกงาน
              </button>
            </details>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Timeline</p>
              <h3 className="mt-1 font-black text-slate-950">ประวัติการดำเนินงาน</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{history.length} รายการ</span>
          </div>

          {history.length ? (
            <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-black text-slate-900">
                      {item.status ? STATUS_LABELS[item.status] || item.status : item.title || item.eventType}
                    </p>
                    <span className="text-xs font-bold text-slate-500">{formatDateTime(item.occurredAt)}</span>
                  </div>
                  {item.previousStatus && item.status ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {STATUS_LABELS[item.previousStatus] || item.previousStatus} → {STATUS_LABELS[item.status] || item.status}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">ยังไม่มีประวัติ workflow</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default RepairWorkflowOverview;
