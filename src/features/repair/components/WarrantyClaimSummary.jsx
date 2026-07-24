import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { CLAIM_RESOLUTION_LABELS } from '../utils/repairStatus';
import { formatRepairDateTime, formatRepairMoney } from '../utils/repairFormat';

const Item = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value ?? '-'}</p>
  </div>
);

const WarrantyClaimSummary = ({ claim }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Warranty Claim</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">{claim.claimNo}</h2>
        <p className="mt-1 text-sm text-slate-500">{claim.stockItem?.product?.name || `Stock #${claim.stockItemId}`}</p>
      </div>
      <StatusBadge status={claim.status} type="claim" />
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Item label="ผู้จำหน่าย" value={claim.supplier?.name} />
      <Item label="ศูนย์บริการ" value={claim.serviceProvider} />
      <Item label="เลขอ้างอิง" value={claim.externalClaimRef} />
      <Item label="Tracking" value={claim.trackingNumber} />
      <Item label="เปิดเมื่อ" value={formatRepairDateTime(claim.openedAt)} />
      <Item label="ศูนย์รับเมื่อ" value={formatRepairDateTime(claim.providerReceivedAt)} />
      <Item label="ปิดเมื่อ" value={formatRepairDateTime(claim.resolvedAt)} />
      <Item label="ผลการเคลม" value={CLAIM_RESOLUTION_LABELS[claim.resolution] || claim.resolution} />
      <Item label="เครดิต" value={formatRepairMoney(claim.creditAmount)} />
      <Item label="การเชื่อมใบซ่อม" value={claim.repairLinkState} />
    </div>

    {claim.repairJob?.id ? (
      <Link
        to={`/advancetech/pos/service/repairs/${claim.repairJob.id}`}
        className="mt-4 inline-flex rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"
      >
        เปิดใบงานซ่อม {claim.repairJob.jobNo}
      </Link>
    ) : null}

    <div className="mt-4 rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">เหตุผลในการเคลม</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{claim.reason}</p>
    </div>
  </section>
);

export default WarrantyClaimSummary;
