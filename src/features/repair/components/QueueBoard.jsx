import React from 'react';
import { formatDateTime } from '../utils/repairRuntime';

const getRepairAsset = (item) => {
  if (item.repairAsset) return item.repairAsset;
  if (item.stockItem) return { sourceType: 'STOCK_ITEM', displayName: item.stockItem?.product?.name || item.deviceModel || 'สินค้าในร้าน', brand: item.stockItem?.product?.brand || null, category: item.stockItem?.product?.productType || null, model: item.deviceModel || null, barcode: item.stockItem?.barcode || item.device?.barcode || null, serialNumber: item.stockItem?.serialNumber || item.device?.serialNumber || null, imei: item.device?.imei || null };
  if (item.device) return { sourceType: 'CUSTOMER_DEVICE', displayName: [item.device.brand, item.device.model].filter(Boolean).join(' ') || item.deviceModel || 'อุปกรณ์ของลูกค้า', brand: item.device.brand || null, category: item.device.category || null, model: item.device.model || item.deviceModel || null, barcode: item.device.barcode || null, serialNumber: item.device.serialNumber || null, imei: item.device.imei || null };
  return { sourceType: 'DESCRIBED_DEVICE', displayName: item.deviceModel || 'อุปกรณ์ที่ลูกค้านำมาซ่อม', brand: null, category: null, model: item.deviceModel || null, barcode: null, serialNumber: null, imei: null };
};

const getClaimAsset = (item) => item.claimAsset || getRepairAsset({ ...item, deviceModel: item.repairJob?.deviceModel });
const getAssetMeta = (asset) => [asset.brand, asset.category].filter(Boolean).join(' • ');
const getAssetIdentity = (asset) => [asset.barcode ? `Barcode: ${asset.barcode}` : null, asset.serialNumber ? `Serial: ${asset.serialNumber}` : null, asset.imei ? `IMEI: ${asset.imei}` : null].filter(Boolean);
const getAssetSourceLabel = (sourceType) => sourceType === 'STOCK_ITEM' ? 'สินค้าที่ซื้อจากร้าน' : sourceType === 'CUSTOMER_DEVICE' ? 'อุปกรณ์ของลูกค้า' : 'ข้อมูลจากใบรับซ่อม';

const CLAIM_LANE_STYLES = {
  DRAFT: 'border-slate-200 bg-slate-100/70', SUBMITTED: 'border-blue-200 bg-blue-50/70', IN_TRANSIT: 'border-cyan-200 bg-cyan-50/70', RECEIVED_BY_PROVIDER: 'border-violet-200 bg-violet-50/70', INSPECTING: 'border-amber-200 bg-amber-50/70', APPROVED: 'border-emerald-200 bg-emerald-50/70', REPAIRING: 'border-orange-200 bg-orange-50/70', REPLACEMENT_PENDING: 'border-teal-200 bg-teal-50/70', CREDIT_PENDING: 'border-slate-300 bg-slate-100/80', RESOLVED: 'border-green-200 bg-green-50/70', REJECTED: 'border-red-200 bg-red-50/70', CANCELLED: 'border-zinc-300 bg-zinc-100/80',
};

const ClaimDetail = ({ label, value }) => value ? <p className="mt-1 line-clamp-1 text-[11px] text-slate-500"><span className="font-black text-slate-600">{label}:</span> {value}</p> : null;

const QueueBoard = ({ lanes, type, onOpen }) => (
  <div className="overflow-x-auto pb-2">
    <div className={`grid gap-4 ${type === 'repair' ? 'min-w-[1420px] grid-cols-6' : 'min-w-[1180px] grid-cols-5'}`}>
      {lanes.map((lane) => (
        <section key={lane.key} className={`rounded-2xl border p-3 ${type === 'claim' ? CLAIM_LANE_STYLES[lane.key] || 'border-slate-200 bg-slate-100/70' : lane.key === 'EXTERNAL_REPAIR' ? 'border-violet-200 bg-violet-50/70' : 'border-slate-200 bg-slate-100/70'}`}>
          <div className="flex items-start justify-between gap-2"><div><h2 className="font-black text-slate-950">{lane.label}</h2><p className="mt-1 text-xs text-slate-500">{lane.description}</p></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm">{lane.items.length}</span></div>
          <div className="mt-3 space-y-3">
            {lane.items.length ? lane.items.map((item) => {
              const isRepair = type === 'repair';
              const customer = isRepair ? item.customer : item.repairJob?.customer;
              const customerName = customer?.name || (isRepair ? item.customerName : item.repairJob?.customerName) || (isRepair ? `ลูกค้า #${item.customerId}` : null);
              const customerContact = customer?.phone || customer?.email || null;
              const asset = isRepair ? getRepairAsset(item) : getClaimAsset(item);
              const assetMeta = getAssetMeta(asset);
              const assetIdentity = getAssetIdentity(asset);
              const source = !isRepair ? item.source : null;
              const supplierName = !isRepair ? item.supplier?.name || item.serviceProvider : null;
              const external = isRepair ? item.activeSubcontract : null;
              return (
                <button type="button" key={item.id} onClick={() => onOpen(item)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2"><p className="font-black text-slate-950">{isRepair ? item.jobNo : item.claimNo}</p>{!isRepair && source ? <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700">{source.label}</span> : null}</div>
                  {source?.referenceNo ? <p className="mt-1 text-[11px] font-bold text-indigo-600">{source.referenceNo}</p> : null}
                  {customerName ? <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2"><p className="line-clamp-1 text-sm font-black text-slate-800">{customerName}</p>{customerContact ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{customerContact}</p> : null}</div> : null}
                  <div className="mt-2 rounded-lg border border-slate-100 px-2.5 py-2"><div className="flex items-start justify-between gap-2"><p className="line-clamp-2 text-sm font-black text-slate-800">{asset.displayName}</p><span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">{getAssetSourceLabel(asset.sourceType)}</span></div>{assetMeta ? <p className="mt-1 line-clamp-1 text-xs text-slate-500">{assetMeta}</p> : null}{assetIdentity.length ? <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">{assetIdentity.map((value) => <p key={value} className="line-clamp-1">{value}</p>)}</div> : null}</div>
                  {isRepair && item.reportedSymptoms ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">อาการ: {item.reportedSymptoms}</p> : null}
                  {external?.active ? <div className="mt-2 rounded-lg bg-violet-50 px-2.5 py-2 text-[11px] text-violet-800"><p className="font-black">ส่งให้: {external.providerName}</p><p className="mt-1 line-clamp-2">งาน: {external.workScope}</p><p className="mt-1 text-violet-600">ส่งออก {formatDateTime(external.sentAt)}</p></div> : null}
                  {!isRepair ? <div className="mt-2 rounded-lg bg-indigo-50/60 px-2.5 py-2"><ClaimDetail label="Supplier/ศูนย์" value={supplierName} /><ClaimDetail label="Tracking" value={item.trackingNumber} /><ClaimDetail label="เลขอ้างอิง" value={item.externalClaimRef} /><ClaimDetail label="เหตุผล" value={item.reason || item.repairJob?.reportedSymptoms} /></div> : null}
                  <p className="mt-2 text-xs text-slate-400">{formatDateTime(isRepair ? item.updatedAt || item.createdAt : item.updatedAt || item.openedAt)}</p>
                </button>
              );
            }) : <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-xs text-slate-400">ไม่มีรายการ</div>}
          </div>
        </section>
      ))}
    </div>
  </div>
);

export default QueueBoard;
