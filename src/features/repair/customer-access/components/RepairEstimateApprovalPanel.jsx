import React, { useCallback, useEffect, useState } from 'react';
import repairApi from '../../api/repairApi';

const money = (value) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const STATUS_LABELS = {
  PENDING: 'รอลูกค้าตอบกลับ',
  APPROVED: 'ลูกค้าอนุมัติแล้ว',
  REJECTED: 'ลูกค้าไม่อนุมัติ',
  SUPERSEDED: 'ถูกแทนที่ด้วยราคาฉบับใหม่',
  EXPIRED: 'หมดอายุ',
};

const RepairEstimateApprovalPanel = ({ repairJobId, job }) => {
  const [approval, setApproval] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  const [state, setState] = useState({ loading: true, error: '', notice: '' });
  const workflowStatus = job?.workflow?.status || 'RECEIVED';
  const repairAuthorization = job?.workflow?.preAgreedService || null;
  const authorizationWasUsed = Boolean(
    repairAuthorization?.enabled &&
      (job?.workflow?.history || []).some(
        (event) => event.action === 'START_PRE_AGREED_SERVICE'
      )
  );
  const canPublish =
    !authorizationWasUsed &&
    workflowStatus === 'WAITING_APPROVAL' &&
    Number(job?.estimatedCost || 0) > 0;

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const payload = await repairApi.getEstimateApproval(repairJobId);
      setApproval(payload?.approval || null);
      setState({ loading: false, error: '', notice: '' });
    } catch (error) {
      setState({ loading: false, error: error.message, notice: '' });
    }
  }, [repairJobId]);

  useEffect(() => {
    load();
  }, [load]);

  const publish = async () => {
    if (!canPublish) return;
    if (!window.confirm('ยืนยันส่งราคาประเมินปัจจุบันให้ลูกค้าพิจารณา?')) return;
    setState({ loading: true, error: '', notice: '' });
    try {
      const payload = await repairApi.publishEstimateApproval(repairJobId, {
        expiryDays: 14,
        requestNote,
      });
      setApproval(payload?.approval || null);
      setRequestNote('');
      setState({
        loading: false,
        error: '',
        notice: 'สร้างคำขออนุมัติราคาแล้ว ลูกค้าตอบกลับได้จากลิงก์ติดตามงาน',
      });
    } catch (error) {
      setState({ loading: false, error: error.message, notice: '' });
    }
  };

  if (authorizationWasUsed) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              Repair Authorization
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-950">ลูกค้าอนุมัติให้ซ่อมแล้ว</h2>
            <p className="mt-1 text-sm text-slate-600">
              งานนี้ไม่ต้องเสนอราคาก่อนซ่อม ช่างดำเนินงานได้ตามอำนาจที่ลูกค้าให้ไว้ และระบุค่าซ่อมจริงเมื่อทำงานเสร็จ
            </p>
          </div>
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            อนุมัติให้ซ่อมแล้ว
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ReadOnlyDetail label="ขอบเขต/เงื่อนไขที่อนุมัติ" value={repairAuthorization.agreedScope || 'อนุมัติให้ดำเนินการซ่อมตามอาการที่แจ้ง'} />
          <ReadOnlyDetail label="ผู้อนุมัติให้ซ่อม" value={repairAuthorization.confirmedByName || '-'} />
          {repairAuthorization.confirmationNote ? (
            <div className="sm:col-span-2">
              <ReadOnlyDetail label="หมายเหตุการอนุมัติ" value={repairAuthorization.confirmationNote} />
            </div>
          ) : null}
        </div>

        <p className="mt-4 rounded-xl border border-emerald-200 bg-white p-3 text-sm font-bold text-emerald-800">
          ไม่ผูกยอดล่วงหน้า — ค่าซ่อมจริงจะถูกบันทึกตอนสรุปงานหลังซ่อมเสร็จ
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
            Customer Estimate Decision
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-950">ส่งราคาประเมินให้ลูกค้าอนุมัติ</h2>
          <p className="mt-1 text-sm text-slate-600">
            ใช้เฉพาะเคสที่ลูกค้าต้องการทราบและอนุมัติราคาก่อนซ่อม ระบบจะล็อกยอดเป็น snapshot รอการตัดสินใจจากลูกค้า และอัปเดต workflow ให้อัตโนมัติเมื่อลูกค้าตอบกลับ
          </p>
        </div>
        {workflowStatus === 'WAITING_APPROVAL' ? (
          <button
            type="button"
            disabled={state.loading || !canPublish}
            onClick={publish}
            className="min-h-11 rounded-xl bg-amber-600 px-5 text-sm font-black text-white disabled:opacity-40"
          >
            {state.loading ? 'กำลังดำเนินการ' : approval?.status === 'PENDING' ? 'ส่งราคาใหม่' : 'ส่งให้ลูกค้า'}
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="ราคาประเมินปัจจุบัน" value={money(job?.estimatedCost)} />
        <Metric label="มัดจำ" value={money(job?.depositPaid)} />
        <Metric
          label="ยอดคงเหลือ"
          value={money(Math.max(Number(job?.estimatedCost || 0) - Number(job?.depositPaid || 0), 0))}
        />
      </div>

      {workflowStatus === 'WAITING_APPROVAL' ? (
        <label className="mt-4 block space-y-1">
          <span className="text-xs font-black text-slate-600">ข้อความถึงลูกค้า</span>
          <textarea
            rows={2}
            value={requestNote}
            onChange={(event) => setRequestNote(event.target.value)}
            placeholder="เช่น รวมค่าแรงและอะไหล่แล้ว รับประกันงานซ่อม 30 วัน"
            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3"
          />
        </label>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
          {workflowStatus === 'APPROVED'
            ? 'ลูกค้าอนุมัติราคาแล้ว ขั้นถัดไปคือเริ่มงานซ่อม'
            : workflowStatus === 'REJECTED'
              ? 'ลูกค้าไม่อนุมัติราคา งานนี้จะไม่เข้าสู่ขั้นซ่อม'
              : 'การส่งราคาจะเปิดเมื่อบันทึกผลตรวจสอบเสร็จและงานอยู่ในขั้นรอลูกค้าอนุมัติ'}
        </p>
      )}

      {approval ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-slate-950">
              ราคาฉบับล่าสุด {money(approval.estimateAmount)}
            </p>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              {STATUS_LABELS[approval.status] || approval.status}
            </span>
          </div>
          {approval.confirmedByName ? (
            <p className="mt-2 text-sm text-slate-600">
              ผู้ตอบกลับ: {approval.confirmedByName}
            </p>
          ) : null}
          {approval.customerNote ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
              หมายเหตุจากลูกค้า: {approval.customerNote}
            </p>
          ) : null}
        </div>
      ) : null}

      {state.notice ? (
        <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.notice}</p>
      ) : null}
      {state.error ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>
      ) : null}
    </section>
  );
};

const Metric = ({ label, value }) => (
  <div className="rounded-xl bg-white p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-950">{value}</p>
  </div>
);

const ReadOnlyDetail = ({ label, value }) => (
  <div className="rounded-xl border border-emerald-100 bg-white p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 whitespace-pre-wrap font-bold text-slate-900">{value}</p>
  </div>
);

export default RepairEstimateApprovalPanel;
