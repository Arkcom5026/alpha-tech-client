import React, { useMemo, useState } from 'react';
import { formatMoney } from '../utils/repairRuntime';

const STATUS_LABELS = {
  RECEIVED: 'รับเครื่องแล้ว',
  ACCEPTED: 'ช่างรับงานแล้ว',
  WAITING_DIAGNOSIS: 'รอตรวจสอบ',
  DIAGNOSING: 'กำลังตรวจสอบ',
  WAITING_APPROVAL: 'รอลูกค้าอนุมัติ',
  APPROVED: 'ลูกค้าอนุมัติราคาแล้ว',
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
  QUEUE_DIAGNOSIS: { label: 'ตรวจสอบก่อน', hint: 'ใช้เมื่อต้องตรวจหาสาเหตุ หรือเมื่อลูกค้าต้องการเสนอราคาก่อนซ่อม' },
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
  const repairAuthorization = workflow.preAgreedService;
  const acceptanceEntry = Boolean(
    workflow.status === 'RECEIVED' && actionNames.has('ACCEPT_JOB')
  );
  const authorizationEntry = Boolean(
    workflow.status === 'ACCEPTED' &&
      repairAuthorization?.enabled &&
      actionNames.has('START_PRE_AGREED_SERVICE')
  );
  const directEntry = Boolean(
    workflow.status === 'ACCEPTED' &&
      actionNames.has('START_REPAIR') &&
      !authorizationEntry
  );
  const readyAfterAcceptance = authorizationEntry || directEntry;
  const hasOptionalEntryActions =
    workflow.status === 'ACCEPTED' && actionNames.has('QUEUE_DIAGNOSIS');

  return (
    <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Repair Workflow</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">
            {acceptanceEntry ? 'รอช่างรับงาน' : readyAfterAcceptance ? 'พร้อมดำเนินงาน' : 'ขั้นตรวจสอบ'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {acceptanceEntry
              ? 'ร้านรับเครื่องแล้ว ช่างต้องรับผิดชอบใบงานก่อน จึงเริ่มซ่อมหรือเลือกตรวจสอบได้'
              : readyAfterAcceptance
                ? 'ช่างรับงานแล้ว เลือกเริ่มซ่อมได้ทันที หรือใช้การตรวจสอบเมื่อเคสต้องการรายละเอียดหรือเสนอราคาก่อนซ่อม'
                : 'ใช้การตรวจสอบเมื่อต้องหาสาเหตุหรือประเมินงานเพิ่มเติมก่อนดำเนินการ'}
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

      {acceptanceEntry ? (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Job Acceptance · Primary Action</p>
          <h4 className="mt-1 text-lg font-black text-emerald-950">ช่างรับงานก่อนดำเนินการ</h4>
          <p className="mt-1 text-sm text-emerald-800">
            การรับงานหมายถึงช่างรับผิดชอบใบงานนี้ ยังไม่ใช่การเริ่มซ่อม หลังรับงานแล้วจึงเลือกเริ่มซ่อมหรือตรวจสอบก่อนตามเคส
          </p>
          <button
            type="button"
            disabled={submitting}
            onClick={() => run('ACCEPT_JOB')}
            className="mt-4 min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white disabled:opacity-40"
          >
            รับงาน
          </button>
        </div>
      ) : null}

      {authorizationEntry ? (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Repair Authorization · Primary Action</p>
              <h4 className="mt-1 text-lg font-black text-emerald-950">ลูกค้าอนุมัติให้ซ่อมแล้ว</h4>
              <p className="mt-1 text-sm text-emerald-800">
                ช่างรับงานแล้ว และลูกค้าอนุญาตให้ดำเนินการโดยไม่ต้องเสนอราคาก่อน สามารถเริ่มซ่อมได้ทันทีและระบุค่าซ่อมจริงเมื่อซ่อมเสร็จ
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800">
              ไม่ผูกยอดล่วงหน้า
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Info label="ขอบเขต/เงื่อนไขที่อนุมัติ" value={repairAuthorization.agreedScope || 'อนุมัติให้ดำเนินการซ่อมตามอาการที่แจ้ง'} />
            <Info label="ผู้อนุมัติให้ซ่อม" value={repairAuthorization.confirmedByName} />
            {repairAuthorization.confirmationNote ? (
              <div className="md:col-span-2">
                <Info label="หมายเหตุการอนุมัติ" value={repairAuthorization.confirmationNote} />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => run('START_PRE_AGREED_SERVICE')}
            className="mt-4 min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white disabled:opacity-40"
          >
            เริ่มซ่อม
          </button>
        </div>
      ) : null}

      {directEntry ? (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Primary Action</p>
          <h4 className="mt-1 text-lg font-black text-emerald-950">เริ่มซ่อมได้เลย</h4>
          <p className="mt-1 text-sm text-emerald-800">
            ช่างรับงานแล้ว หากข้อมูลและขอบเขตงานเพียงพอสามารถเริ่มซ่อมได้ โดยไม่ต้องผ่านขั้นตรวจสอบหรือเสนอราคาโดยไม่จำเป็น
          </p>
          <button
            type="button"
            disabled={submitting}
            onClick={() => run('START_REPAIR')}
            className="mt-4 min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white disabled:opacity-40"
          >
            เริ่มซ่อม
          </button>
        </div>
      ) : null}

      {hasOptionalEntryActions ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">ตัวเลือกเพิ่มเติม</p>
          <p className="mt-1 text-sm text-slate-500">หลังรับงานแล้ว เลือกตรวจสอบเมื่อเคสต้องหาสาเหตุหรือเมื่อลูกค้าต้องการเสนอราคาก่อนซ่อม</p>
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
          <p className="mt-1 text-xs text-slate-500">สำหรับเคสที่ต้องเสนอราคาก่อนซ่อม ให้บันทึกผลตรวจและราคาประเมินก่อนส่งให้ลูกค้าอนุมัติ</p>

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
  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="font-black text-slate-950">{copy.label}</p>
    <p className="mt-1 text-sm text-slate-500">{copy.hint}</p>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-3 min-h-11 rounded-xl border border-slate-300 bg-white px-5 font-black text-slate-700 disabled:opacity-40"
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
