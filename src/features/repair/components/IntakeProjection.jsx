import React from 'react';
import { formatDateTime } from '../utils/repairRuntime';

const Cell = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value || '-'}</p>
  </div>
);

const IntakeProjection = ({ context, onOpenJob, onOpenClaim, onCreateJob }) => {
  const identity = context?.identity || {};
  const activeRepair = context?.activeRepair || null;
  const activeClaim = context?.activeClaim || null;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Product Projection</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {identity.product?.name || identity.serialNumber || identity.barcode || 'สินค้า'}
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
          <Cell label="Serial" value={identity.serialNumber} />
          <Cell label="ลูกค้าปัจจุบัน" value={context?.latestSale?.customerName} />
          <Cell label="วันที่ขาย" value={formatDateTime(context?.latestSale?.soldAt)} />
          <Cell label="Supplier" value={context?.procurement?.supplier?.name} />
          <Cell label="ประกันถึง" value={formatDateTime(context?.warranty?.expiresAt)} />
          <Cell
            label="สถานะประกัน"
            value={
              context?.warranty?.isExpired == null
                ? 'ไม่ทราบ'
                : context.warranty.isExpired
                  ? 'หมดประกัน'
                  : 'ยังอยู่ในประกัน'
            }
          />
          <Cell label="สาขา" value={identity.branchId} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Repair Authority</p>
          <h3 className="mt-1 text-lg font-black text-blue-950">
            {activeRepair ? 'พบงานซ่อมที่กำลังเปิด' : 'ยังไม่มีงานซ่อมที่กำลังเปิด'}
          </h3>
          <p className="mt-2 text-sm text-blue-800">
            {activeRepair
              ? `${activeRepair.jobNo || `Job #${activeRepair.id}`} · ${activeRepair.status}`
              : 'สามารถเปิดใบรับซ่อมใหม่จากข้อมูลสินค้านี้ได้'}
          </p>
          <button
            type="button"
            onClick={() =>
              activeRepair ? onOpenJob(activeRepair.id) : onCreateJob()
            }
            className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white"
          >
            {activeRepair ? 'เปิดงานซ่อมเดิม' : 'เปิดใบรับซ่อม'}
          </button>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">Warranty Authority</p>
          <h3 className="mt-1 text-lg font-black text-indigo-950">
            {activeClaim ? 'พบงานเคลมที่กำลังเปิด' : 'ยังไม่มีงานเคลมที่กำลังเปิด'}
          </h3>
          <p className="mt-2 text-sm text-indigo-800">
            {activeClaim
              ? `${activeClaim.claimNo || `Claim #${activeClaim.id}`} · ${activeClaim.status}`
              : 'การเปิดเคลมใหม่ต้องเริ่มจากใบงานซ่อมที่เชื่อมกับสินค้านี้'}
          </p>
          {activeClaim ? (
            <button
              type="button"
              onClick={() => onOpenClaim(activeClaim.id)}
              className="mt-4 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-black text-white"
            >
              เปิดงานเคลมเดิม
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default IntakeProjection;
