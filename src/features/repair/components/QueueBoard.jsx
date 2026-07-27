import React from 'react';
import { formatDateTime } from '../utils/repairRuntime';

const getRepairAsset = (item) => {
  if (item.repairAsset) return item.repairAsset;

  if (item.stockItem) {
    return {
      sourceType: 'STOCK_ITEM',
      displayName:
        item.stockItem?.product?.name ||
        item.deviceModel ||
        'สินค้าในร้าน',
      brand: item.stockItem?.product?.brand || null,
      category: item.stockItem?.product?.productType || null,
      model: item.deviceModel || null,
      barcode: item.stockItem?.barcode || item.device?.barcode || null,
      serialNumber:
        item.stockItem?.serialNumber || item.device?.serialNumber || null,
      imei: item.device?.imei || null,
    };
  }

  if (item.device) {
    return {
      sourceType: 'CUSTOMER_DEVICE',
      displayName:
        [item.device.brand, item.device.model].filter(Boolean).join(' ') ||
        item.deviceModel ||
        'อุปกรณ์ของลูกค้า',
      brand: item.device.brand || null,
      category: item.device.category || null,
      model: item.device.model || item.deviceModel || null,
      barcode: item.device.barcode || null,
      serialNumber: item.device.serialNumber || null,
      imei: item.device.imei || null,
    };
  }

  return {
    sourceType: 'DESCRIBED_DEVICE',
    displayName: item.deviceModel || 'อุปกรณ์ที่ลูกค้านำมาซ่อม',
    brand: null,
    category: null,
    model: item.deviceModel || null,
    barcode: null,
    serialNumber: null,
    imei: null,
  };
};

const getRepairAssetMeta = (asset) =>
  [asset.brand, asset.category].filter(Boolean).join(' • ');

const getRepairAssetIdentity = (asset) =>
  [
    asset.barcode ? `Barcode: ${asset.barcode}` : null,
    asset.serialNumber ? `Serial: ${asset.serialNumber}` : null,
    asset.imei ? `IMEI: ${asset.imei}` : null,
  ].filter(Boolean);

const getRepairAssetSourceLabel = (sourceType) => {
  if (sourceType === 'STOCK_ITEM') return 'สินค้าที่ซื้อจากร้าน';
  if (sourceType === 'CUSTOMER_DEVICE') return 'อุปกรณ์ของลูกค้า';
  return 'ข้อมูลจากใบรับซ่อม';
};

const QueueBoard = ({ lanes, type, onOpen }) => (
  <div className="overflow-x-auto pb-2">
    <div className="grid min-w-[1180px] grid-cols-5 gap-4">
      {lanes.map((lane) => (
        <section key={lane.key} className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
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
                const customerName =
                  type === 'repair'
                    ? item.customer?.name || item.customerName || `ลูกค้า #${item.customerId}`
                    : item.repairJob?.customerName || null;
                const customerContact =
                  type === 'repair' ? item.customer?.phone || item.customer?.email : null;
                const repairAsset = type === 'repair' ? getRepairAsset(item) : null;
                const assetMeta = repairAsset ? getRepairAssetMeta(repairAsset) : null;
                const assetIdentity = repairAsset ? getRepairAssetIdentity(repairAsset) : [];

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onOpen(item)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <p className="font-black text-slate-950">
                      {type === 'repair' ? item.jobNo : item.claimNo}
                    </p>

                    {customerName ? (
                      <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2">
                        <p className="line-clamp-1 text-sm font-black text-slate-800">
                          {customerName}
                        </p>
                        {customerContact ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {customerContact}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {type === 'repair' ? (
                      <div className="mt-2 rounded-lg border border-slate-100 px-2.5 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-black text-slate-800">
                            {repairAsset.displayName}
                          </p>
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                            {getRepairAssetSourceLabel(repairAsset.sourceType)}
                          </span>
                        </div>
                        {assetMeta ? (
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {assetMeta}
                          </p>
                        ) : null}
                        {assetIdentity.length ? (
                          <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                            {assetIdentity.map((value) => (
                              <p key={value} className="line-clamp-1">{value}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                        {item.stockItem?.product?.name ||
                          [item.device?.brand, item.device?.model].filter(Boolean).join(' ') ||
                          item.reason}
                      </p>
                    )}

                    {type === 'repair' && item.reportedSymptoms ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        อาการ: {item.reportedSymptoms}
                      </p>
                    ) : null}

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(
                        type === 'repair'
                          ? item.updatedAt || item.createdAt
                          : item.updatedAt || item.openedAt
                      )}
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

export default QueueBoard;