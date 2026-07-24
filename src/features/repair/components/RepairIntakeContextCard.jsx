import React from 'react';
import { formatRepairDateTime } from '../utils/repairFormat';

const Cell = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value ?? '-'}</p>
  </div>
);

const RepairIntakeContextCard = ({ context }) => {
  if (!context) return null;
  const identity = context.identity || {};
  const warranty = context.warranty || {};

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Service Intake Context</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {identity.product?.name || identity.serialNumber || 'สินค้า'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {identity.product?.brand || '-'} · {identity.product?.productType || '-'}
          </p>
        </div>
        <span className="w-fit rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-700">
          {identity.status || 'UNKNOWN'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Cell label="บาร์โค้ด" value={identity.barcode} />
        <Cell label="หมายเลขซีเรียล" value={identity.serialNumber} />
        <Cell label="ผู้ซื้อเดิม" value={context.latestSale?.customerName} />
        <Cell label="วันที่ขาย" value={formatRepairDateTime(context.latestSale?.soldAt)} />
        <Cell label="ผู้จำหน่ายต้นทาง" value={context.procurement?.supplier?.name} />
        <Cell label="ประกันถึง" value={formatRepairDateTime(warranty.expiresAt)} />
        <Cell
          label="สถานะประกัน"
          value={warranty.isExpired === null ? 'ไม่ทราบ' : warranty.isExpired ? 'หมดประกัน' : 'ยังอยู่ในประกัน'}
        />
        <Cell label="สาขา" value={identity.branchId} />
      </div>
    </section>
  );
};

export default RepairIntakeContextCard;
