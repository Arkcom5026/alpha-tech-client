import React from 'react';
import { REPAIR_WORKFLOW_LABELS, formatDateTime, formatMoney } from '../utils/repairRuntime';

const FINAL_PRICE_ACTIONS = new Set(['COMPLETE_REPAIR', 'COMPLETE_REPAIR_DIRECT']);

const JobRuntimePanel = ({ job }) => {
  const workflowStatus = job?.workflow?.status || 'RECEIVED';
  const hasFinalRepairAmount = (job?.workflow?.history || []).some((event) =>
    FINAL_PRICE_ACTIONS.has(event.action)
  );
  const deviceName =
    job?.repairAsset?.displayName ||
    job?.assetDescription ||
    job?.deviceModel ||
    null;
  const deviceModel = job?.repairAsset?.model || job?.device?.model || null;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Repair Runtime</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{job.jobNo}</h2>
            <p className="mt-1 text-sm text-slate-500">{deviceName}</p>
          </div>
          <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            {REPAIR_WORKFLOW_LABELS[workflowStatus] || workflowStatus}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="ชื่ออุปกรณ์" value={deviceName} />
          <Info label="รุ่น / Model" value={deviceModel} />
          <Info label="ลูกค้า" value={job.customerName || job.customerId} />
          <Info label="ช่าง" value={job.technician?.name || 'ยังไม่มอบหมาย'} />
          <Info label="รับเมื่อ" value={formatDateTime(job.createdAt)} />
          <Info label="อัปเดตล่าสุด" value={formatDateTime(job.updatedAt)} />
          <Info label="มัดจำ" value={formatMoney(job.depositPaid)} />
          <Info
            label={hasFinalRepairAmount ? 'ค่าซ่อมจริง' : 'ราคาประเมิน'}
            value={formatMoney(job.estimatedCost)}
          />
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
          <h3 className="text-lg font-black text-slate-950">ขั้นตอนงาน</h3>
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="font-black">สถานะถูกควบคุมด้วย Repair Workflow</p>
            <p className="mt-1 text-blue-800">
              ใช้ปุ่มดำเนินการในส่วน workflow ด้านบน ระบบจะแสดงเฉพาะงานที่ทำได้ในสถานะปัจจุบันและป้องกันการข้ามขั้นตอน
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">อะไหล่ที่ใช้</h3>
          <p className="mt-1 text-xs text-slate-500">การเบิกอะไหล่ทำจากขั้น “กำลังซ่อม” ด้านบน เพื่อให้สต๊อกและสถานะงานสอดคล้องกัน</p>
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
        </section>
      </div>
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
