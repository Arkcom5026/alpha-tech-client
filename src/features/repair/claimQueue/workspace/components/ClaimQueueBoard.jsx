import React from 'react';
import { formatDateTime } from '../../../utils/repairRuntime';

const MISSING_CLAIM_ASSET = Object.freeze({
  sourceType: 'DESCRIBED_DEVICE',
  sourceId: null,
  displayName: 'ไม่พบข้อมูลอุปกรณ์',
  brand: null,
  category: null,
  model: null,
  barcode: null,
  serialNumber: null,
  imei: null,
});

const CLAIM_LANE_STYLES = {
  DRAFT: 'border-slate-200 bg-slate-100/70',
  SUBMITTED: 'border-blue-200 bg-blue-50/70',
  IN_TRANSIT: 'border-cyan-200 bg-cyan-50/70',
  RECEIVED_BY_PROVIDER: 'border-violet-200 bg-violet-50/70',
  INSPECTING: 'border-amber-200 bg-amber-50/70',
  APPROVED: 'border-emerald-200 bg-emerald-50/70',
  REPAIRING: 'border-orange-200 bg-orange-50/70',
  REPLACEMENT_PENDING: 'border-teal-200 bg-teal-50/70',
  CREDIT_PENDING: 'border-slate-300 bg-slate-100/80',
  RESOLVED: 'border-green-200 bg-green-50/70',
  REJECTED: 'border-red-200 bg-red-50/70',
  CANCELLED: 'border-zinc-300 bg-zinc-100/80',
};

const getClaimAsset = (item) => item?.claimAsset || MISSING_CLAIM_ASSET;

const getAssetMeta = (asset) =>
  [asset.brand, asset.model, asset.category].filter(Boolean).join(' • ');

const getAssetIdentity = (asset) =>
  [
    asset.barcode ? `Barcode: ${asset.barcode}` : null,
    asset.serialNumber ? `Serial: ${asset.serialNumber}` : null,
    asset.imei ? `IMEI: ${asset.imei}` : null,
  ].filter(Boolean);

const getAssetSourceLabel = (sourceType) => {
  if (sourceType === 'INTAKE_SNAPSHOT') return 'ข้อมูลตอนรับซ่อม';
  if (sourceType === 'DEVICE_INTAKE') return 'ข้อมูลใบรับซ่อม';
  if (sourceType === 'STOCK_ITEM') return 'สินค้าที่ซื้อจากร้าน';
  if (sourceType === 'CUSTOMER_DEVICE') return 'อุปกรณ์ของลูกค้า';
  return 'ข้อมูลรายการเคลม';
};

const ClaimDetail = ({ label, value }) =>
  value ? (
    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
      <span className="font-black text-slate-600">{label}:</span> {value}
    </p>
  ) : null;

const ClaimQueueBoard = ({ lanes, onOpen }) => (
  <div className="overflow-x-auto pb-2">
    <div className="grid min-w-[1180px] grid-cols-5 gap-4">
      {lanes.map((lane) => (
        <section
          key={lane.key}
          className={`rounded-2xl border p-3 ${
            CLAIM_LANE_STYLES[lane.key] || 'border-slate-200 bg-slate-100/70'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-black text-slate-950">{lane.label}</h2>
              <p className="mt-1 text-xs text-slate-500">{lane.description}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm">
              {lane.items.length}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {lane.items.length ? (
              lane.items.map((item) => {
                const customer = item.repairJob?.customer;
                const customerName = customer?.name || item.repairJob?.customerName || null;
                const customerContact = customer?.phone || customer?.email || null;
                const asset = getClaimAsset(item);
                const assetMeta = getAssetMeta(asset);
                const assetIdentity = getAssetIdentity(asset);
                const source = item.source;
                const supplierName = item.supplier?.name || item.serviceProvider;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onOpen(item)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-slate-950">{item.claimNo}</p>
                      {source ? (
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700">
                          {source.label}
                        </span>
                      ) : null}
                    </div>

                    {source?.referenceNo ? (
                      <p className="mt-1 text-[11px] font-bold text-indigo-600">
                        {source.referenceNo}
                      </p>
                    ) : null}

                    {customerName ? (
                      <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2">
                        <p className="line-clamp-1 text-sm font-black text-slate-800">{customerName}</p>
                        {customerContact ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{customerContact}</p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-2 rounded-lg border border-slate-100 px-2.5 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-black text-slate-800">{asset.displayName}</p>
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                          {getAssetSourceLabel(asset.sourceType)}
                        </span>
                      </div>
                      {assetMeta ? (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{assetMeta}</p>
                      ) : null}
                      {assetIdentity.length ? (
                        <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                          {assetIdentity.map((value) => (
                            <p key={value} className="line-clamp-1">{value}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-2 rounded-lg bg-indigo-50/60 px-2.5 py-2">
                      <ClaimDetail label="Supplier/ศูนย์" value={supplierName} />
                      <ClaimDetail label="Tracking" value={item.trackingNumber} />
                      <ClaimDetail label="เลขอ้างอิง" value={item.externalClaimRef} />
                      <ClaimDetail label="เหตุผล" value={item.reason || item.repairJob?.reportedSymptoms} />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(item.updatedAt || item.openedAt)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-xs text-slate-400">
                ไม่มีรายการ
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  </div>
);

export default ClaimQueueBoard;
