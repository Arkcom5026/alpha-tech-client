import React from 'react';
import { formatMoney } from '../utils/repairRuntime';

const RESOLUTION_LABELS = {
  REPAIRED: 'ซ่อมคืน',
  REPLACED: 'เปลี่ยนสินค้าใหม่',
  CREDITED: 'รับเครดิต',
  REFUNDED: 'คืนเงิน',
  RETURNED_UNCHANGED: 'ส่งคืนโดยไม่แก้ไข',
  REJECTED: 'ปฏิเสธเคลม',
  WRITTEN_OFF: 'ตัดจำหน่าย',
};

const ClaimResolutionOutcomePanel = ({ claim }) => {
  if (claim?.status !== 'RESOLVED') return null;

  const replacement = claim.replacementStockItem;
  const deviceRetired = ['REPLACED', 'CREDITED', 'REFUNDED', 'WRITTEN_OFF'].includes(claim.resolution);

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Resolution Outcome</p>
      <h3 className="mt-1 text-lg font-black text-emerald-950">ผลสุดท้ายของงานเคลม</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Outcome label="ผลการเคลม" value={RESOLUTION_LABELS[claim.resolution] || claim.resolution} />
        <Outcome label="สถานะอุปกรณ์เดิม" value={claim.device ? (deviceRetired ? 'ยุติการใช้งานแล้ว' : 'กลับมาใช้งานได้') : 'ไม่มี Device identity'} />
        {claim.resolution === 'CREDITED' ? <Outcome label="ยอดเครดิต" value={formatMoney(claim.creditAmount)} /> : null}
        {replacement ? (
          <Outcome
            label="สินค้าทดแทน"
            value={`${replacement.product?.name || 'สินค้า'} · ${replacement.serialNumber || replacement.barcode || `#${replacement.id}`}`}
          />
        ) : null}
      </div>
      {claim.resolutionNote ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-xs font-black text-emerald-700">รายละเอียดผลการเคลม</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{claim.resolutionNote}</p>
        </div>
      ) : null}
      {claim.resolution === 'REPLACED' && replacement ? (
        <p className="mt-3 text-sm font-bold text-emerald-900">
          สินค้าทดแทนถูกตัดออกจากสต๊อกพร้อม Stock Movement ประเภท CLAIM_REPLACEMENT แล้ว
        </p>
      ) : null}
    </section>
  );
};

const Outcome = ({ label, value }) => (
  <div className="rounded-xl bg-white p-3">
    <p className="text-xs font-black text-emerald-700">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value || '-'}</p>
  </div>
);

export default ClaimResolutionOutcomePanel;
