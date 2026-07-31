import React, { useMemo, useState } from 'react';
import { REPAIR_LABELS, formatDateTime, formatMoney } from '../utils/repairRuntime';

const WORKFLOW_ACTION_LABELS = {
  QUEUE_DIAGNOSIS: 'เข้าคิววินิจฉัย',
  START_DIAGNOSIS: 'เริ่มวินิจฉัย',
  COMPLETE_DIAGNOSIS: 'วินิจฉัยเสร็จ',
  APPROVE_QUOTATION: 'อนุมัติใบเสนอราคา',
  REJECT_QUOTATION: 'ปฏิเสธใบเสนอราคา',
  START_REPAIR: 'เริ่มซ่อม',
  WAIT_FOR_PARTS: 'รออะไหล่',
  RESUME_REPAIR: 'กลับมาซ่อมต่อ',
  COMPLETE_REPAIR: 'ซ่อมเสร็จ ส่งตรวจคุณภาพ',
  PASS_QC: 'ผ่านการตรวจคุณภาพ',
  FAIL_QC: 'ไม่ผ่านการตรวจคุณภาพ',
  REWORK_AFTER_QC: 'ส่งกลับแก้ไข',
  DELIVER: 'ส่งมอบเครื่อง',
  CLOSE: 'ปิดงาน',
  CANCEL: 'ยกเลิกงาน',
};

const JobRuntimePanel = ({
  job,
  workflowStatus,
  availableWorkflowActions = [],
  submitting,
  onTransition,
  onAddPart,
  onOpenClaim,
}) => {
  const [transition, setTransition] = useState({ action: '', note: '' });
  const [part, setPart] = useState({ productId: '', qtyUsed: 1 });
  const [claim, setClaim] = useState({ reason: '', supplierId: '', serviceProvider: '', note: '' });

  const actions = useMemo(
    () => (Array.isArray(availableWorkflowActions) ? availableWorkflowActions : []),
    [availableWorkflowActions]
  );
  const activeClaim = (job.warrantyClaims || []).find(
    (item) => !['RESOLVED', 'CANCELLED'].includes(item.status)
  );

  const submitTransition = async () => {
    const result = await onTransition({
      action: transition.action,
      note: transition.note,
      expectedWorkflowStatus: workflowStatus,
    });
    if (result) setTransition({ action: '', note: '' });
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Repair Runtime</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{job.jobNo}</h2>
            <p className="mt-1 text-sm text-slate-500">{job.deviceModel}</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              {REPAIR_LABELS[job.status] || job.status}
            </span>
            {workflowStatus ? (
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                Workflow: {workflowStatus}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="ลูกค้า" value={job.customerName || job.customerId} />
          <Info label="ช่าง" value={job.technician?.name || 'ยังไม่มอบหมาย'} />
          <Info label="รับเมื่อ" value={formatDateTime(job.createdAt)} />
          <Info label="อัปเดตล่าสุด" value={formatDateTime(job.updatedAt)} />
          <Info label="มัดจำ" value={formatMoney(job.depositPaid)} />
          <Info label="ราคาประเมิน" value={formatMoney(job.estimatedCost)} />
          <Info label="บาร์โค้ด" value={job.stockItem?.barcode || job.device?.barcode} />
          <Info label="Serial" value={job.stockItem?.serialNumber || job.device?.serialNumber} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black text-slate-500">อาการที่แจ้ง</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{job.reportedSymptoms}</p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">ขั้นตอนงานซ่อม</h3>
          {actions.length ? (
            <>
              <select
                value={transition.action}
                onChange={(event) => setTransition((current) => ({ ...current, action: event.target.value }))}
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">เลือกคำสั่งถัดไป</option>
                {actions.map((item) => (
                  <option key={item.action} value={item.action}>
                    {WORKFLOW_ACTION_LABELS[item.action] || item.action}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={transition.note}
                onChange={(event) => setTransition((current) => ({ ...current, note: event.target.value }))}
                placeholder="บันทึกความคืบหน้า"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <button
                type="button"
                disabled={!transition.action || submitting}
                onClick={submitTransition}
                className="mt-3 rounded-xl bg-slate-900 px-5 py-3 font-black text-white disabled:opacity-40"
              >
                ดำเนินการขั้นตอน
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">ไม่มีคำสั่งถัดไปที่ Server อนุญาต</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">อะไหล่ที่ใช้</h3>
          <div className="mt-3 space-y-2">
            {(job.partsUsed || []).length ? (
              job.partsUsed.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-black text-slate-900">{item.productName || `สินค้า #${item.productId}`}</p>
                  <p className="mt-1 text-xs text-slate-500">จำนวน {item.qtyUsed}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">ยังไม่มีการบันทึกอะไหล่</p>
            )}
          </div>

          {!['COMPLETED', 'CANCELLED'].includes(job.status) ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_auto]">
              <input
                value={part.productId}
                onChange={(event) => setPart((current) => ({ ...current, productId: event.target.value }))}
                inputMode="numeric"
                placeholder="Product ID"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={part.qtyUsed}
                onChange={(event) => setPart((current) => ({ ...current, qtyUsed: event.target.value }))}
                type="number"
                min="1"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <button
                type="button"
                disabled={submitting || !part.productId}
                onClick={() => onAddPart({ productId: Number(part.productId), qtyUsed: Number(part.qtyUsed) })}
                className="rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:opacity-40"
              >
                บันทึก
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h3 className="text-lg font-black text-indigo-950">Warranty Handoff</h3>
        {activeClaim ? (
          <div className="mt-3">
            <p className="text-sm text-indigo-800">
              มีรายการเคลมที่กำลังเปิด: {activeClaim.claimNo || `Claim #${activeClaim.id}`}
            </p>
            <button
              type="button"
              onClick={() => onOpenClaim(activeClaim.id)}
              className="mt-3 rounded-xl bg-indigo-700 px-5 py-3 font-black text-white"
            >
              เปิดรายการเคลม
            </button>
          </div>
        ) : (job.stockItemId || job.deviceId) && !['COMPLETED', 'CANCELLED'].includes(job.status) ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <textarea
              rows={3}
              value={claim.reason}
              onChange={(event) => setClaim((current) => ({ ...current, reason: event.target.value }))}
              placeholder="เหตุผลในการส่งเคลม"
              className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2"
            />
            <input
              value={claim.supplierId}
              onChange={(event) => setClaim((current) => ({ ...current, supplierId: event.target.value }))}
              inputMode="numeric"
              placeholder="Supplier ID"
              className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
            />
            <input
              value={claim.serviceProvider}
              onChange={(event) => setClaim((current) => ({ ...current, serviceProvider: event.target.value }))}
              placeholder="ศูนย์บริการ"
              className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
            />
            <textarea
              rows={2}
              value={claim.note}
              onChange={(event) => setClaim((current) => ({ ...current, note: event.target.value }))}
              placeholder="หมายเหตุ"
              className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2"
            />
            <button
              type="button"
              disabled={submitting || !claim.reason.trim()}
              onClick={() => onOpenClaim({ ...claim, supplierId: claim.supplierId ? Number(claim.supplierId) : null })}
              className="rounded-xl bg-indigo-700 px-5 py-3 font-black text-white md:col-span-2 disabled:opacity-40"
            >
              เปิดรายการเคลมจากงานซ่อม
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-indigo-800">งานนี้ไม่สามารถเปิดรายการเคลมใหม่ได้</p>
        )}
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value ?? '-'}</p>
  </div>
);

export default JobRuntimePanel;
