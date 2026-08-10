import React, { useMemo, useState } from 'react';
import { formatMoney } from '../utils/repairRuntime';

const STATUS_LABELS = {
  RECEIVED: 'รับงานแล้ว',
  WAITING_DIAGNOSIS: 'รอตรวจสอบ',
  DIAGNOSING: 'กำลังตรวจสอบ',
  WAITING_APPROVAL: 'รอลูกค้าอนุมัติ',
  APPROVED: 'ลูกค้าอนุมัติแล้ว',
  REJECTED: 'ลูกค้าไม่อนุมัติ',
  REPAIRING: 'กำลังซ่อม',
  WAITING_PARTS: 'รออะไหล่',
  WAITING_QC: 'รอตรวจหลังซ่อม',
  QC_FAILED: 'ตรวจหลังซ่อมไม่ผ่าน',
  READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  DELIVERED: 'ส่งมอบแล้ว',
  CLOSED: 'ปิดงานแล้ว',
  CANCELLED: 'ยกเลิก',
};

const ACTION_COPY = {
  QUEUE_DIAGNOSIS: { label: 'ส่งเข้าคิวตรวจ', hint: 'หลักฐานรับเครื่องต้องครบก่อนเริ่มขั้นตอนนี้' },
  START_DIAGNOSIS: { label: 'เริ่มตรวจสอบ', hint: 'เริ่มบันทึกผลตรวจและสาเหตุของปัญหา' },
};

const initialDiagnosis = {
  findings: '',
  cause: '',
  recommendedAction: '',
  estimatedCost: '',
  customerNote: '',
};

const RepairDiagnosisPanel = ({ job, submitting, onWorkflowAction }) => {
  const workflow = job?.workflow || { status: 'RECEIVED', availableActions: [], diagnosis: null };
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);

  const actionNames = useMemo(
    () => new Set((workflow.availableActions || []).map((item) => item.action)),
    [workflow.availableActions]
  );

  const run = (action, extra = {}) =>
    onWorkflowAction({
      action,
      expectedWorkflowStatus: workflow.status,
      ...extra,
    });

  const completeDiagnosis = () => {
    run('COMPLETE_DIAGNOSIS', {
      diagnosis: {
        ...diagnosis,
        estimatedCost: Number(diagnosis.estimatedCost || 0),
      },
    });
  };

  const existingDiagnosis = workflow.diagnosis;
  const preAgreedService = workflow.preAgreedService;

  return (
    <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Repair Workflow</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">ขั้นตรวจสอบ</h3>
          <p className="mt-1 text-sm text-slate-500">
            งานทั่วไปเลือกตรวจสอบตามปกติ ส่วนงานที่ตกลงราคาและขอบเขตไว้แล้วสามารถเริ่มตามข้อตกลงได้
          </p>
        </div>
        <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {STATUS_LABELS[workflow.status] || workflow.status}
        </span>
      </div>

      {existingDiagnosis ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="ผลตรวจ" value={existingDiagnosis.findings} />
          <Info label="สาเหตุ" value={existingDiagnosis.cause || '-'} />
          <Info label="แนวทางแก้ไข" value={existingDiagnosis.recommendedAction} />
          <Info label="ราคาประเมิน" value={formatMoney(existingDiagnosis.estimatedCost)} />
          {existingDiagnosis.customerNote ? (
            <div className="md:col-span-2">
              <Info label="หมายเหตุสำหรับลูกค้า" value={existingDiagnosis.customerNote} />
            </div>
          ) : null}
        </div>
      ) : null}

      {actionNames.has('START_PRE_AGREED_SERVICE') && preAgreedService?.enabled ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Pre-agreed Service</p>
              <h4 className="mt-1 font-black text-emerald-950">ลูกค้าตกลงราคาและขอบเขตงานแล้ว</h4>
              <p className="mt-1 text-sm text-emerald-800">ไม่จำเป็นต้องผ่านขั้นตรวจสอบและเสนอราคาซ้ำ หากข้อมูลรับเครื่องครบสามารถเริ่มงานตามข้อตกลงได้</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800">
              {formatMoney(preAgreedService.agreedAmount)}
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Info label="ขอบเขตงานที่ตกลง" value={preAgreedService.agreedScope} />
            <Info label="ผู้ยืนยัน" value={preAgreedService.confirmedByName} />
            {preAgreedService.confirmationNote ? (
              <div className="md:col-span-2">
                <Info label="หมายเหตุข้อตกลง" value={preAgreedService.confirmationNote} />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => run('START_PRE_AGREED_SERVICE')}
            className="mt-4 min-h-11 rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-40"
          >
            ใช้ราคาที่ตกลงและไปขั้นเริ่มงาน
          </button>
        </div>
      ) : null}

      {actionNames.has('QUEUE_DIAGNOSIS') ? (
        <ActionCard copy={ACTION_COPY.QUEUE_DIAGNOSIS} disabled={submitting} onClick={() => run('QUEUE_DIAGNOSIS')} />
      ) : null}

      {actionNames.has('START_DIAGNOSIS') ? (
        <ActionCard copy={ACTION_COPY.START_DIAGNOSIS} disabled={submitting} onClick={() => run('START_DIAGNOSIS')} />
      ) : null}

      {actionNames.has('COMPLETE_DIAGNOSIS') ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="font-black text-slate-950">บันทึกผลตรวจสอบ</h4>
          <p className="mt-1 text-xs text-slate-500">กรอกข้อมูลที่จำเป็นให้ครบก่อนส่งต่อไปขั้นขออนุมัติราคา</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <textarea
              rows={4}
              value={diagnosis.findings}
              onChange={(event) => setDiagnosis((current) => ({ ...current, findings: event.target.value }))}
              placeholder="ผลตรวจพบ *"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 md:col-span-2"
            />
            <textarea
              rows={3}
              value={diagnosis.cause}
              onChange={(event) => setDiagnosis((current) => ({ ...current, cause: event.target.value }))}
              placeholder="สาเหตุที่คาดว่าเป็นต้นเหตุ"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
            <textarea
              rows={3}
              value={diagnosis.recommendedAction}
              onChange={(event) => setDiagnosis((current) => ({ ...current, recommendedAction: event.target.value }))}
              placeholder="แนวทางซ่อม / วิธีแก้ไข *"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={diagnosis.estimatedCost}
              onChange={(event) => setDiagnosis((current) => ({ ...current, estimatedCost: event.target.value }))}
              placeholder="ราคาประเมิน"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
            <input
              value={diagnosis.customerNote}
              onChange={(event) => setDiagnosis((current) => ({ ...current, customerNote: event.target.value }))}
              placeholder="หมายเหตุที่ต้องการแจ้งลูกค้า"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            />
          </div>

          <button
            type="button"
            disabled={submitting || !diagnosis.findings.trim() || !diagnosis.recommendedAction.trim()}
            onClick={completeDiagnosis}
            className="mt-4 min-h-12 rounded-xl bg-blue-700 px-5 font-black text-white disabled:opacity-40"
          >
            บันทึกผลตรวจและส่งขออนุมัติราคา
          </button>
        </div>
      ) : null}

      {workflow.status === 'WAITING_APPROVAL' ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-black">ตรวจสอบเสร็จแล้ว</p>
          <p className="mt-1">ขั้นถัดไปคือการส่งราคาประเมินและรอการตัดสินใจจากลูกค้า</p>
        </div>
      ) : null}
    </section>
  );
};

const ActionCard = ({ copy, disabled, onClick }) => (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="font-black text-slate-950">{copy.label}</p>
    <p className="mt-1 text-sm text-slate-500">{copy.hint}</p>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-3 min-h-11 rounded-xl bg-slate-900 px-5 font-black text-white disabled:opacity-40"
    >
      {copy.label}
    </button>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 whitespace-pre-wrap font-bold text-slate-900">{value}</p>
  </div>
);

export default RepairDiagnosisPanel;
